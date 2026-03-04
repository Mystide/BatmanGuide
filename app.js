(() => {
  "use strict";

  const BUILD_ID = "batman-guide-auto-sync";
  const LIST = Array.isArray(window.BATMAN_GUIDE_LIST) ? window.BATMAN_GUIDE_LIST : [];


  const REAL_COVERS = {
    "E4-01": "https://covers.openlibrary.org/b/isbn/9781401207526-M.jpg",
    "E4-07": "https://covers.openlibrary.org/b/isbn/9781563894695-M.jpg",
    "E4-08": "https://covers.openlibrary.org/b/isbn/9781563896767-M.jpg",
    "E4-11": "https://covers.openlibrary.org/b/isbn/9781401216672-M.jpg",
    "E4-12": "https://covers.openlibrary.org/b/isbn/9781401212599-M.jpg",
    "E4-14": "https://covers.openlibrary.org/b/isbn/9781401237219-M.jpg",
    "E4-20": "https://covers.openlibrary.org/b/isbn/9781401235635-M.jpg",
    "E4-25": "https://covers.openlibrary.org/b/isbn/9781401200619-M.jpg",
    "E4-27": "https://covers.openlibrary.org/b/isbn/9781401218249-M.jpg",
    "E4-29": "https://covers.openlibrary.org/b/isbn/9781401210847-M.jpg",
    "E4-31": "https://covers.openlibrary.org/b/isbn/9781401221706-M.jpg",
    "E4-35": "https://covers.openlibrary.org/b/isbn/9781401232078-M.jpg",
    "E4-36": "https://covers.openlibrary.org/b/isbn/9781401233389-M.jpg",
    "E5-01": "https://covers.openlibrary.org/b/isbn/9781401235420-M.jpg",
    "E5-04": "https://covers.openlibrary.org/b/isbn/9781401246020-M.jpg",
    "E5-06": "https://covers.openlibrary.org/b/isbn/9781401252281-M.jpg",
    "E6-01": "https://covers.openlibrary.org/b/isbn/9781401267775-M.jpg",
    "E6-06": "https://covers.openlibrary.org/b/isbn/9781401273615-M.jpg",
    "E6-14": "https://covers.openlibrary.org/b/isbn/9781779507907-M.jpg",
    "E6-15": "https://covers.openlibrary.org/b/isbn/9781779513151-M.jpg",
    "E7-02": "https://covers.openlibrary.org/b/isbn/9781779516541-M.jpg",
    "E7-03": "https://covers.openlibrary.org/b/isbn/9781779520029-M.jpg",
    "E7-05": "https://covers.openlibrary.org/b/isbn/9781779525871-M.jpg"
  };

  const KEYS = {
    state: "batman-guide:state:v3",
    eraOpen: "batman-guide:era-open:v3",
    syncCfg: "batman-guide:sync:v3",
    filters: "batman-guide:filters:v1"
  };

  const AUTO_PULL_BASE_INTERVAL_MS = 15000;
  const AUTO_PULL_MAX_INTERVAL_MS = 120000;
  const AUTO_PUSH_DEBOUNCE_MS = 120;
  const PULL_THROTTLE_MS = 2500;
  const SYNC_REQUEST_TIMEOUT_MS = 9000;

  const $ = (id) => document.getElementById(id);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const defaultState = () => ({
    build: BUILD_ID,
    updatedAt: null,
    lastTouchedId: null,
    items: {}
  });

  const defaultCfg = () => ({
    gistId: "",
    gistToken: "",
    auto: true,
    pullMs: AUTO_PULL_BASE_INTERVAL_MS
  });


  const defaultFilters = () => ({
    search: "",
    type: "",
    onlyRemaining: false,
    hideOptional: false,
    sortBy: "order"
  });

  function readFilters() {
    return loadJSON(KEYS.filters, defaultFilters());
  }

  function writeFilters() {
    saveJSON(KEYS.filters, {
      search: $("search").value || "",
      type: $("typeFilter").value || "",
      onlyRemaining: !!$("onlyRemaining").checked,
      hideOptional: !!$("hideOptional").checked,
      sortBy: $("sortBy").value || "order"
    });
  }

  let state = loadJSON(KEYS.state, defaultState());
  let dirty = false;
  let autoPushTimer = null;
  let autoPullTimer = null;
  let syncInFlight = false;
  let syncQueued = false;
  let lastPullAt = 0;
  let gistETag = "";
  let pullDelayMs = AUTO_PULL_BASE_INTERVAL_MS;


  function clampPullInterval(ms) {
    const n = Number(ms);
    if (!Number.isFinite(n)) return AUTO_PULL_BASE_INTERVAL_MS;
    return Math.max(AUTO_PULL_BASE_INTERVAL_MS, Math.min(AUTO_PULL_MAX_INTERVAL_MS, Math.round(n)));
  }

  function scheduleNextAutoPull(delay = pullDelayMs) {
    if (autoPullTimer) clearTimeout(autoPullTimer);
    const cfg = getCfg();
    if (!syncReady(cfg) || !cfg.auto) return;
    autoPullTimer = setTimeout(() => {
      void runAutoSync("interval");
    }, Math.max(0, delay));
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return clone(fallback);
      return Object.assign(clone(fallback), JSON.parse(raw));
    } catch {
      return clone(fallback);
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function setError(msg) {
    const box = $("errorBox");
    box.textContent = msg || "";
    box.classList.toggle("hidden", !msg);
  }

  function ensureItemState(entry) {
    if (!state.items[entry.id]) {
      state.items[entry.id] = {
        done: false,
        pos: "",
        note: "",
        unit: entry.type === "series" ? "issue" : entry.type === "collection" ? "item" : "page",
        touchedAt: null
      };
    }
    return state.items[entry.id];
  }

  function saveState(markDirty = true) {
    state.updatedAt = nowISO();
    state.build = BUILD_ID;
    saveJSON(KEYS.state, state);
    if (markDirty) {
      dirty = true;
      scheduleAutoPush();
    }
  }

  function eraKey(era) {
    return String(era || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function getCfg() {
    return loadJSON(KEYS.syncCfg, defaultCfg());
  }

  function setCfg(cfg) {
    saveJSON(KEYS.syncCfg, cfg);
  }

  function syncReady(cfg) {
    return !!(cfg.gistId && cfg.gistToken);
  }

  function setSyncStatus(text) {
    $("syncStatus").textContent = text;
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function getFiltered() {
    const q = $("search").value.trim().toLowerCase();
    const type = $("typeFilter").value;
    const onlyRemaining = $("onlyRemaining").checked;
    const hideOptional = $("hideOptional").checked;
    const sortBy = $("sortBy").value;

    const filtered = LIST.filter((entry) => {
      const st = ensureItemState(entry);
      if (q && !entry.title.toLowerCase().includes(q)) return false;
      if (type && entry.type !== type) return false;
      if (onlyRemaining && st.done) return false;
      if (hideOptional && entry.optional) return false;
      return true;
    });

    if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "progress") {
      filtered.sort((a, b) => {
        const sa = ensureItemState(a);
        const sb = ensureItemState(b);
        if (sa.done !== sb.done) return Number(sa.done) - Number(sb.done);
        const ta = Date.parse(sa.touchedAt || "") || 0;
        const tb = Date.parse(sb.touchedAt || "") || 0;
        return ta - tb;
      });
    }

    return filtered;
  }

  function groupedByEra(entries) {
    const out = new Map();
    for (const e of entries) {
      const era = e.era || "Unknown";
      if (!out.has(era)) out.set(era, []);
      out.get(era).push(e);
    }
    return out;
  }

  function stats(entries) {
    let done = 0;
    for (const e of entries) {
      if (ensureItemState(e).done) done++;
    }
    const total = entries.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }

  function nextUnread(entries) {
    return entries.find((e) => !ensureItemState(e).done) || null;
  }

  function continueEntry(entries) {
    const found = entries.find((e) => e.id === state.lastTouchedId);
    return found || nextUnread(entries);
  }

  function scrollToEntry(id) {
    const el = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function refreshHeader(filtered) {
    const s = stats(filtered);
    $("progressBar").style.width = `${s.pct}%`;
    $("progressText").textContent = `Progress: ${s.done}/${s.total} (${s.pct}%)`;

    const next = nextUnread(filtered);
    $("nextText").textContent = `Next: ${next ? next.title : "All done"}`;

    const cont = continueEntry(filtered);
    if (!cont) {
      $("continueText").textContent = "Continue: -";
    } else {
      const st = ensureItemState(cont);
      const where = st.pos ? ` (${st.pos} ${st.unit})` : "";
      $("continueText").textContent = `Continue: ${cont.title}${where}`;
    }

    const requiredRemaining = filtered.filter((entry) => !entry.optional && !ensureItemState(entry).done).length;
    setText("statVisible", String(s.total));
    setText("statDone", String(s.done));
    setText("statRemaining", String(Math.max(0, s.total - s.done)));
    setText("statRequired", String(requiredRemaining));
  }

  function loadOpenState() {
    return loadJSON(KEYS.eraOpen, {});
  }

  function saveOpenState(val) {
    saveJSON(KEYS.eraOpen, val);
  }


  function populateEraJump(entries) {
    const sel = $("eraJump");
    if (!sel) return;
    const current = sel.value;
    const eras = [...groupedByEra(entries).keys()];
    sel.innerHTML = '<option value="">Jump to era…</option>';
    for (const era of eras) {
      const key = eraKey(era);
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = era;
      sel.appendChild(opt);
    }
    if ([...sel.options].some((o) => o.value === current)) sel.value = current;
  }


  function entryCoverLabel(entry) {
    if (entry.type === "series") return "Series";
    if (entry.type === "collection") return "Event";
    return "Book";
  }

  function entryInitials(title) {
    const words = String(title || "Batman").replace(/[^a-zA-Z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "BM";
  }

  function coverGradient(entry) {
    let hash = 0;
    const key = `${entry.id}:${entry.title}`;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
    const hue = Math.abs(hash) % 360;
    const hue2 = (hue + 42) % 360;
    return `linear-gradient(160deg, hsl(${hue} 62% 36%), hsl(${hue2} 72% 24%))`;
  }

  function render() {
    setError("");
    const filtered = getFiltered();
    const root = $("main");
    root.innerHTML = "";

    if (!LIST.length) {
      setError("Reading list failed to load. Check that list.js exists and is loaded before app.js.");
      refreshHeader([]);
      return;
    }

    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = "<strong>No results.</strong> Clear or adjust filters to see entries.";
      root.appendChild(empty);
      refreshHeader([]);
      return;
    }

    const byEra = groupedByEra(filtered);
    const openMap = loadOpenState();
    populateEraJump(filtered);

    for (const [era, items] of byEra.entries()) {
      const details = document.createElement("details");
      details.className = "era";
      const key = eraKey(era);
      details.dataset.eraKey = key;
      details.open = openMap[key] !== false;

      details.addEventListener("toggle", () => {
        const current = loadOpenState();
        current[key] = details.open;
        saveOpenState(current);
      });

      const done = items.filter((it) => ensureItemState(it).done).length;
      const pct = Math.round((done / items.length) * 100);

      const summary = document.createElement("summary");
      summary.innerHTML = `<span>${era}</span><span class="muted">${done}/${items.length} (${pct}%)</span>`;
      details.appendChild(summary);

      const list = document.createElement("div");
      list.className = "items";

      for (const entry of items) {
        const st = ensureItemState(entry);

        const item = document.createElement("div");
        item.className = `item${st.done ? " done" : ""}`;
        item.dataset.id = entry.id;

        const cover = document.createElement("div");
        cover.className = "cover";
        cover.style.background = coverGradient(entry);
        const coverUrl = REAL_COVERS[entry.id] || "";
        if (coverUrl) {
          const img = document.createElement("img");
          img.src = coverUrl;
          img.alt = `${entry.title} cover`;
          img.loading = "lazy";
          img.referrerPolicy = "no-referrer";
          img.onerror = () => {
            img.remove();
            cover.innerHTML = `<div>${entryInitials(entry.title)}<small>${entryCoverLabel(entry)}</small></div>`;
          };
          cover.appendChild(img);
        } else {
          cover.innerHTML = `<div>${entryInitials(entry.title)}<small>${entryCoverLabel(entry)}</small></div>`;
        }

        const content = document.createElement("div");

        const top = document.createElement("div");
        top.className = "row space";
        top.innerHTML = `
          <label class="row" style="align-items:flex-start;">
            <input type="checkbox" ${st.done ? "checked" : ""} data-action="done" />
            <span class="title">${entry.title}</span>
          </label>
          <a href="${entry.url}" target="_blank" rel="noopener">Open</a>
        `;

        const tags = document.createElement("div");
        tags.className = "tags";
        tags.innerHTML = `
          <span class="tag">${entry.type}</span>
          <span class="tag">${entry.optional ? "optional" : "required"}</span>
          <span class="muted">${entry.id}</span>
        `;

        const progress = document.createElement("div");
        progress.className = "row";
        progress.innerHTML = `
          <input class="input" data-action="pos" placeholder="where you stopped" value="${escapeHtml(st.pos || "")}" style="max-width:180px;" />
          <input class="input" data-action="note" placeholder="note" value="${escapeHtml(st.note || "")}" style="min-width:240px;" />
        `;

        top.querySelector('[data-action="done"]').addEventListener("change", (e) => {
          st.done = e.target.checked;
          st.touchedAt = nowISO();
          state.lastTouchedId = entry.id;
          saveState();
          render();
        });

        progress.querySelector('[data-action="pos"]').addEventListener("change", (e) => {
          st.pos = e.target.value.trim();
          st.touchedAt = nowISO();
          state.lastTouchedId = entry.id;
          saveState();
          refreshHeader(filtered);
        });

        progress.querySelector('[data-action="note"]').addEventListener("change", (e) => {
          st.note = e.target.value.trim();
          st.touchedAt = nowISO();
          state.lastTouchedId = entry.id;
          saveState();
        });

        content.append(top, tags, progress);

        const layout = document.createElement("div");
        layout.className = "item-grid";
        layout.append(cover, content);

        item.appendChild(layout);
        list.appendChild(item);
      }

      details.appendChild(list);
      root.appendChild(details);
    }

    refreshHeader(filtered);
  }

  function escapeHtml(v) {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function exportPayload() {
    return JSON.stringify({
      app: "Batman Guide",
      version: 1,
      updatedAt: nowISO(),
      state
    }, null, 2);
  }

  function importPayload(text) {
    try {
      const payload = JSON.parse(text);
      if (!payload || !payload.state || typeof payload.state !== "object") {
        return { ok: false, err: "Invalid payload" };
      }
      state = Object.assign(defaultState(), payload.state);
      saveJSON(KEYS.state, state);
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e.message || "Parse error" };
    }
  }

  const GIST_FILE = "batmanguide_progress.json";

  async function gistFetch(cfg, opts = {}) {
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.gistToken}`
    };
    if (opts.allowNotModified && gistETag) {
      headers["If-None-Match"] = gistETag;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("timeout"), SYNC_REQUEST_TIMEOUT_MS);
    const r = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      headers,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    if (r.status === 304 && opts.allowNotModified) {
      return { notModified: true, gist: null };
    }
    if (!r.ok) throw new Error(`Gist fetch failed (${r.status})`);
    gistETag = r.headers.get("ETag") || gistETag;
    return { notModified: false, gist: await r.json() };
  }

  async function gistGetText(cfg, opts = {}) {
    const { notModified, gist } = await gistFetch(cfg, opts);
    if (notModified) return { notModified: true, text: "" };

    const file = gist.files?.[GIST_FILE];
    if (!file) throw new Error(`File ${GIST_FILE} not found in gist`);
    if (typeof file.content === "string") return { notModified: false, text: file.content };
    if (file.raw_url) {
      const rr = await fetch(file.raw_url, {
        headers: { Authorization: `Bearer ${cfg.gistToken}` }
      });
      if (!rr.ok) throw new Error(`Raw file fetch failed (${rr.status})`);
      return { notModified: false, text: await rr.text() };
    }
    throw new Error("No content in gist file");
  }

  async function gistPush(cfg) {
    const body = {
      files: {
        [GIST_FILE]: {
          content: exportPayload()
        }
      }
    };
    const r = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${cfg.gistToken}`
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const msg = await r.text().catch(() => "");
      throw new Error(`Push failed (${r.status}) ${msg.slice(0, 200)}`);
    }
    dirty = false;
    setSyncStatus("Push complete.");
  }

  function parseDate(value) {
    const t = Date.parse(value || "");
    return Number.isFinite(t) ? t : 0;
  }

  async function gistPull(cfg, force = false) {
    const now = Date.now();
    if (!force && now - lastPullAt < PULL_THROTTLE_MS) return;
    lastPullAt = now;

    const pulled = await gistGetText(cfg, { allowNotModified: !force });
    if (pulled.notModified) {
      setSyncStatus("No remote updates.");
      return;
    }

    const text = pulled.text;
    const incoming = JSON.parse(text);
    if (!incoming?.state) throw new Error("Remote payload invalid");

    const remoteAt = parseDate(incoming.state.updatedAt);
    const localAt = parseDate(state.updatedAt);

    if (remoteAt > localAt || force) {
      const imported = importPayload(text);
      if (!imported.ok) throw new Error(imported.err);
      dirty = false;
      render();
      setSyncStatus("Pulled newer state.");
    } else {
      setSyncStatus("Local state already up to date.");
    }
  }

  async function gistSync(cfg) {
    let remoteText = "";
    try {
      const pulled = await gistGetText(cfg, { allowNotModified: true });
      if (pulled.notModified) {
        if (dirty) {
          await gistPush(cfg);
          setSyncStatus("Sync complete (pushed local change).");
          return "pushed";
        }
        setSyncStatus("Already in sync.");
        return "unchanged";
      }
      remoteText = pulled.text;
    } catch {
      await gistPush(cfg);
      setSyncStatus("Remote initialized by push.");
      return "pushed";
    }

    let remote;
    try {
      remote = JSON.parse(remoteText);
    } catch {
      await gistPush(cfg);
      setSyncStatus("Remote fixed (invalid JSON replaced).");
      return "pushed";
    }

    const remoteAt = parseDate(remote?.state?.updatedAt);
    const localAt = parseDate(state.updatedAt);

    if (!remote?.state) {
      await gistPush(cfg);
      setSyncStatus("Remote fixed (invalid shape replaced).");
      return "pushed";
    }

    if (remoteAt > localAt) {
      const imported = importPayload(remoteText);
      if (!imported.ok) throw new Error(imported.err);
      dirty = false;
      render();
      setSyncStatus("Sync complete (pulled newer remote).");
      return "pulled";
    }

    if (localAt > remoteAt || dirty) {
      await gistPush(cfg);
      setSyncStatus("Sync complete (pushed newer local).");
      return "pushed";
    }

    setSyncStatus("Already in sync.");
    return "unchanged";
  }

  function stopAutoSync() {
    if (autoPullTimer) {
      clearTimeout(autoPullTimer);
      autoPullTimer = null;
    }
    if (autoPushTimer) {
      clearTimeout(autoPushTimer);
      autoPushTimer = null;
    }
  }

  function startAutoSync() {
    stopAutoSync();
    const cfg = getCfg();
    if (!syncReady(cfg) || !cfg.auto) return;

    pullDelayMs = clampPullInterval(cfg.pullMs);
    void runAutoSync("start");
  }

  function scheduleAutoPush() {
    const cfg = getCfg();
    if (!syncReady(cfg) || !cfg.auto) return;
    if (autoPushTimer) clearTimeout(autoPushTimer);
    autoPushTimer = setTimeout(() => {
      void runAutoSync("change");
    }, AUTO_PUSH_DEBOUNCE_MS);
  }

  async function runAutoSync(reason) {
    const cfg = getCfg();
    if (!syncReady(cfg) || !cfg.auto) return;
    if (syncInFlight) {
      syncQueued = true;
      return;
    }

    syncInFlight = true;
    try {
      setSyncStatus(`Auto-sync (${reason})...`);
      if (dirty && reason === "change") {
        await gistPush(cfg);
        pullDelayMs = clampPullInterval(cfg.pullMs);
        setSyncStatus("Sync complete (pushed local change).");
      } else {
        const result = await gistSync(cfg);
        if (result === "unchanged") {
          pullDelayMs = Math.min(AUTO_PULL_MAX_INTERVAL_MS, Math.round(pullDelayMs * 1.35));
        } else {
          pullDelayMs = clampPullInterval(cfg.pullMs);
        }
      }
    } catch (e) {
      pullDelayMs = Math.min(AUTO_PULL_MAX_INTERVAL_MS, Math.round(Math.max(pullDelayMs, clampPullInterval(cfg.pullMs)) * 1.8));
      setSyncStatus(`Auto-sync failed: ${String(e.message || e)}`);
    } finally {
      syncInFlight = false;
      if (syncQueued) {
        syncQueued = false;
        void runAutoSync("queued");
      } else if (reason !== "change") {
        scheduleNextAutoPull(pullDelayMs);
      }
    }
  }

  function bindUI() {
    const savedFilters = readFilters();
    $("search").value = savedFilters.search || "";
    $("typeFilter").value = savedFilters.type || "";
    $("onlyRemaining").checked = !!savedFilters.onlyRemaining;
    $("hideOptional").checked = !!savedFilters.hideOptional;
    $("sortBy").value = savedFilters.sortBy || "order";

    for (const id of ["search", "typeFilter", "onlyRemaining", "hideOptional", "sortBy"]) {
      $(id).addEventListener("input", () => {
        writeFilters();
        render();
      });
      $(id).addEventListener("change", () => {
        writeFilters();
        render();
      });
    }

    const eraJump = $("eraJump");
    if (eraJump) {
      eraJump.addEventListener("change", () => {
        const key = eraJump.value;
        if (!key) return;
        const section = document.querySelector(`details[data-era-key="${CSS.escape(key)}"]`);
        if (section) {
          section.open = true;
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    $("btnClearFilters").addEventListener("click", () => {
      $("search").value = "";
      $("typeFilter").value = "";
      $("onlyRemaining").checked = false;
      $("hideOptional").checked = false;
      $("sortBy").value = "order";
      writeFilters();
      render();
    });

    $("btnExpandAll").addEventListener("click", () => {
      const updated = loadOpenState();
      for (const era of groupedByEra(getFiltered()).keys()) updated[eraKey(era)] = true;
      saveOpenState(updated);
      render();
    });

    $("btnCollapseAll").addEventListener("click", () => {
      const updated = loadOpenState();
      for (const era of groupedByEra(getFiltered()).keys()) updated[eraKey(era)] = false;
      saveOpenState(updated);
      render();
    });

    $("btnTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    $("btnNext").addEventListener("click", () => {
      const next = nextUnread(getFiltered());
      if (next) scrollToEntry(next.id);
    });

    $("btnContinue").addEventListener("click", () => {
      const c = continueEntry(getFiltered());
      if (c) scrollToEntry(c.id);
    });

    const cfg = getCfg();
    $("gistId").value = cfg.gistId;
    $("gistToken").value = cfg.gistToken;
    $("autoSync").checked = cfg.auto !== false;

    const saveCfgFromUI = () => {
      const nextCfg = {
        gistId: $("gistId").value.trim(),
        gistToken: $("gistToken").value.trim(),
        auto: $("autoSync").checked,
        pullMs: clampPullInterval(getCfg().pullMs)
      };
      setCfg(nextCfg);
      startAutoSync();
      if (!syncReady(nextCfg)) {
        setSyncStatus("Auto-sync is off until Gist ID and token are filled.");
      } else if (!nextCfg.auto) {
        setSyncStatus("Auto-sync paused. Use Pull/Push/Sync now for manual sync.");
      } else {
        setSyncStatus("Auto-sync active (adaptive polling).");
        void runAutoSync("settings");
      }
      return nextCfg;
    };

    for (const id of ["gistId", "gistToken", "autoSync"]) {
      $(id).addEventListener("change", saveCfgFromUI);
    }

    $("gistPull").addEventListener("click", () => {
      if (!syncReady(getCfg())) return setSyncStatus("Set Gist ID and token first.");
      void gistPull(getCfg(), true).catch((e) => setSyncStatus(`Pull failed: ${String(e.message || e)}`));
    });

    $("gistPush").addEventListener("click", () => {
      if (!syncReady(getCfg())) return setSyncStatus("Set Gist ID and token first.");
      void gistPush(getCfg()).catch((e) => setSyncStatus(`Push failed: ${String(e.message || e)}`));
    });

    $("gistSync").addEventListener("click", () => {
      if (!syncReady(getCfg())) return setSyncStatus("Set Gist ID and token first.");
      void gistSync(getCfg()).catch((e) => setSyncStatus(`Sync failed: ${String(e.message || e)}`));
    });

    const importInput = $("importStateFile");
    const exportBtn = $("exportState");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const blob = new Blob([exportPayload()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batman-guide-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setSyncStatus("Local backup exported.");
      });
    }

    if (importInput) {
      importInput.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const imported = importPayload(text);
          if (!imported.ok) throw new Error(imported.err);
          dirty = true;
          render();
          scheduleAutoPush();
          setSyncStatus("Backup imported to local state.");
        } catch (err) {
          setSyncStatus(`Import failed: ${String(err.message || err)}`);
        } finally {
          importInput.value = "";
        }
      });
    }

    $("resetState").addEventListener("click", () => {
      if (!confirm("Reset local progress? This cannot be undone.")) return;
      state = defaultState();
      saveState();
      render();
      setSyncStatus("Local state reset.");
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        $("search").focus();
      }
    });

    window.addEventListener("focus", () => void runAutoSync("focus"));
    window.addEventListener("online", () => void runAutoSync("online"));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void runAutoSync("visible");
    });
  }

  function initPWA() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  try {
    bindUI();
    startAutoSync();
    initPWA();
    render();
  } catch (e) {
    setError(`App failed to start: ${String(e.message || e)}`);
    console.error(e);
  }
})();
