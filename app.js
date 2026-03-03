(() => {
  "use strict";

  const BUILD_ID = "2026-03-03.14-ui-fix";
  const LIST = Array.isArray(window.BATMAN_GUIDE_LIST) ? window.BATMAN_GUIDE_LIST : [];

  const KEYS = {
    state: "batman-guide:state:v3",
    eraOpen: "batman-guide:era-open:v3",
    syncCfg: "batman-guide:sync:v3"
  };

  const AUTO_PULL_INTERVAL_MS = 15000;
  const AUTO_PUSH_DEBOUNCE_MS = 900;
  const PULL_THROTTLE_MS = 2500;

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
    gistFile: "batman_guide_progress.json",
    gistToken: "",
    auto: false
  });

  let state = loadJSON(KEYS.state, defaultState());
  let dirty = false;
  let autoPushTimer = null;
  let autoPullTimer = null;
  let syncInFlight = false;
  let lastPullAt = 0;

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
    return !!(cfg.gistId && cfg.gistFile && cfg.gistToken);
  }

  function setSyncStatus(text) {
    $("syncStatus").textContent = text;
  }

  function getFiltered() {
    const q = $("search").value.trim().toLowerCase();
    const type = $("typeFilter").value;
    const onlyRemaining = $("onlyRemaining").checked;
    const hideOptional = $("hideOptional").checked;

    return LIST.filter((entry) => {
      const st = ensureItemState(entry);
      if (q && !entry.title.toLowerCase().includes(q)) return false;
      if (type && entry.type !== type) return false;
      if (onlyRemaining && st.done) return false;
      if (hideOptional && entry.optional) return false;
      return true;
    });
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
      return;
    }
    const st = ensureItemState(cont);
    const where = st.pos ? ` (${st.pos} ${st.unit})` : "";
    $("continueText").textContent = `Continue: ${cont.title}${where}`;
  }

  function loadOpenState() {
    return loadJSON(KEYS.eraOpen, {});
  }

  function saveOpenState(val) {
    saveJSON(KEYS.eraOpen, val);
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

    for (const [era, items] of byEra.entries()) {
      const details = document.createElement("details");
      details.className = "era";
      const key = eraKey(era);
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

        item.append(top, tags, progress);
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

  async function gistFetch(cfg) {
    const r = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${cfg.gistToken}`
      }
    });
    if (!r.ok) throw new Error(`Gist fetch failed (${r.status})`);
    return r.json();
  }

  async function gistGetText(cfg) {
    const gist = await gistFetch(cfg);
    const file = gist.files?.[cfg.gistFile];
    if (!file) throw new Error(`File ${cfg.gistFile} not found in gist`);
    if (typeof file.content === "string") return file.content;
    if (file.raw_url) {
      const rr = await fetch(file.raw_url, {
        headers: { Authorization: `token ${cfg.gistToken}` }
      });
      if (!rr.ok) throw new Error(`Raw file fetch failed (${rr.status})`);
      return rr.text();
    }
    throw new Error("No content in gist file");
  }

  async function gistPush(cfg) {
    const body = {
      files: {
        [cfg.gistFile]: {
          content: exportPayload()
        }
      }
    };
    const r = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        Authorization: `token ${cfg.gistToken}`
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

    const text = await gistGetText(cfg);
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
      remoteText = await gistGetText(cfg);
    } catch {
      await gistPush(cfg);
      setSyncStatus("Remote initialized by push.");
      return;
    }

    let remote;
    try {
      remote = JSON.parse(remoteText);
    } catch {
      await gistPush(cfg);
      setSyncStatus("Remote fixed (invalid JSON replaced).");
      return;
    }

    const remoteAt = parseDate(remote?.state?.updatedAt);
    const localAt = parseDate(state.updatedAt);

    if (!remote?.state) {
      await gistPush(cfg);
      setSyncStatus("Remote fixed (invalid shape replaced).");
      return;
    }

    if (remoteAt > localAt) {
      const imported = importPayload(remoteText);
      if (!imported.ok) throw new Error(imported.err);
      dirty = false;
      render();
      setSyncStatus("Sync complete (pulled newer remote).");
      return;
    }

    if (localAt > remoteAt || dirty) {
      await gistPush(cfg);
      setSyncStatus("Sync complete (pushed newer local).");
      return;
    }

    setSyncStatus("Already in sync.");
  }

  function stopAutoSync() {
    if (autoPullTimer) {
      clearInterval(autoPullTimer);
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
    if (!cfg.auto || !syncReady(cfg)) return;

    autoPullTimer = setInterval(() => {
      void runAutoSync("interval");
    }, AUTO_PULL_INTERVAL_MS);
  }

  function scheduleAutoPush() {
    const cfg = getCfg();
    if (!cfg.auto || !syncReady(cfg)) return;
    if (autoPushTimer) clearTimeout(autoPushTimer);
    autoPushTimer = setTimeout(() => {
      void runAutoSync("change");
    }, AUTO_PUSH_DEBOUNCE_MS);
  }

  async function runAutoSync(reason) {
    const cfg = getCfg();
    if (!cfg.auto || !syncReady(cfg) || syncInFlight) return;

    syncInFlight = true;
    try {
      setSyncStatus(`Auto-sync (${reason})...`);
      if (dirty) await gistSync(cfg);
      else await gistPull(cfg, false);
    } catch (e) {
      setSyncStatus(`Auto-sync failed: ${String(e.message || e)}`);
    } finally {
      syncInFlight = false;
    }
  }

  function bindUI() {
    for (const id of ["search", "typeFilter", "onlyRemaining", "hideOptional"]) {
      $(id).addEventListener("input", render);
      $(id).addEventListener("change", render);
    }

    $("btnClearFilters").addEventListener("click", () => {
      $("search").value = "";
      $("typeFilter").value = "";
      $("onlyRemaining").checked = false;
      $("hideOptional").checked = false;
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
    $("gistFile").value = cfg.gistFile;
    $("gistToken").value = cfg.gistToken;
    $("autoSync").checked = !!cfg.auto;

    const saveCfgFromUI = () => {
      const nextCfg = {
        gistId: $("gistId").value.trim(),
        gistFile: $("gistFile").value.trim(),
        gistToken: $("gistToken").value.trim(),
        auto: $("autoSync").checked
      };
      setCfg(nextCfg);
      startAutoSync();
      setSyncStatus(syncReady(nextCfg) ? "Sync configured." : "Sync not configured.");
      return nextCfg;
    };

    for (const id of ["gistId", "gistFile", "gistToken", "autoSync"]) {
      $(id).addEventListener("change", saveCfgFromUI);
    }

    $("gistPull").addEventListener("click", async () => {
      const c = saveCfgFromUI();
      if (!syncReady(c)) return setSyncStatus("Fill gist ID/file/token first.");
      try {
        setSyncStatus("Pulling...");
        await gistPull(c, true);
      } catch (e) {
        setSyncStatus(`Pull failed: ${String(e.message || e)}`);
      }
    });

    $("gistPush").addEventListener("click", async () => {
      const c = saveCfgFromUI();
      if (!syncReady(c)) return setSyncStatus("Fill gist ID/file/token first.");
      try {
        setSyncStatus("Pushing...");
        await gistPush(c);
      } catch (e) {
        setSyncStatus(`Push failed: ${String(e.message || e)}`);
      }
    });

    $("gistSync").addEventListener("click", async () => {
      const c = saveCfgFromUI();
      if (!syncReady(c)) return setSyncStatus("Fill gist ID/file/token first.");
      try {
        setSyncStatus("Syncing...");
        await gistSync(c);
      } catch (e) {
        setSyncStatus(`Sync failed: ${String(e.message || e)}`);
      }
    });

    $("resetState").addEventListener("click", () => {
      if (!confirm("Reset local progress? This cannot be undone.")) return;
      state = defaultState();
      saveState();
      render();
      setSyncStatus("Local state reset.");
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
})();(() => {
  "use strict";

  const BUILD_ID = "2026-03-03.13-simplified";
  const LIST = Array.isArray(window.BATMAN_GUIDE_LIST) ? window.BATMAN_GUIDE_LIST : [];

  const KEYS = {
    state: "batman-guide:state:v3",
    eraOpen: "batman-guide:era-open:v3",
    syncCfg: "batman-guide:sync:v3"
  };

  const AUTO_PULL_INTERVAL_MS = 15000;
  const AUTO_PUSH_DEBOUNCE_MS = 900;
  const PULL_THROTTLE_MS = 2500;

  const $ = (id) => document.getElementById(id);

  const defaultState = () => ({
    build: BUILD_ID,
    updatedAt: null,
    lastTouchedId: null,
    items: {}
  });

  const defaultCfg = () => ({
    gistId: "",
    gistFile: "batman_guide_progress.json",
    gistToken: "",
    auto: false
  });

  let state = loadJSON(KEYS.state, defaultState());
  let dirty = false;
  let autoPushTimer = null;
  let autoPullTimer = null;
  let syncInFlight = false;
  let lastPullAt = 0;

  function nowISO() {
    return new Date().toISOString();
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return structuredClone(fallback);
      return Object.assign(structuredClone(fallback), JSON.parse(raw));
    } catch {
      return structuredClone(fallback);
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
    return !!(cfg.gistId && cfg.gistFile && cfg.gistToken);
  }

  function setSyncStatus(text) {
    $("syncStatus").textContent = text;
  }

  function getFiltered() {
    const q = $("search").value.trim().toLowerCase();
    const type = $("typeFilter").value;
    const onlyRemaining = $("onlyRemaining").checked;
    const hideOptional = $("hideOptional").checked;

    return LIST.filter((entry) => {
      const st = ensureItemState(entry);
      if (q && !entry.title.toLowerCase().includes(q)) return false;
      if (type && entry.type !== type) return false;
      if (onlyRemaining && st.done) return false;
      if (hideOptional && entry.optional) return false;
      return true;
    });
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
      return;
    }
    const st = ensureItemState(cont);
    const where = st.pos ? ` (${st.pos} ${st.unit})` : "";
    $("continueText").textContent = `Continue: ${cont.title}${where}`;
  }

  function loadOpenState() {
    return loadJSON(KEYS.eraOpen, {});
  }

  function saveOpenState(val) {
    saveJSON(KEYS.eraOpen, val);
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

    for (const [era, items] of byEra.entries()) {
      const details = document.createElement("details");
      details.className = "era";
      const key = eraKey(era);
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

        item.append(top, tags, progress);
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

  async function gistFetch(cfg) {
    const r = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${cfg.gistToken}`
      }
    });
    if (!r.ok) throw new Error(`Gist fetch failed (${r.status})`);
    return r.json();
  }

  async function gistGetText(cfg) {
    const gist = await gistFetch(cfg);
    const file = gist.files?.[cfg.gistFile];
    if (!file) throw new Error(`File ${cfg.gistFile} not found in gist`);
    if (typeof file.content === "string") return file.content;
    if (file.raw_url) {
      const rr = await fetch(file.raw_url, {
        headers: { Authorization: `token ${cfg.gistToken}` }
      });
      if (!rr.ok) throw new Error(`Raw file fetch failed (${rr.status})`);
      return rr.text();
    }
    throw new Error("No content in gist file");
  }

  async function gistPush(cfg) {
    const body = {
      files: {
        [cfg.gistFile]: {
          content: exportPayload()
        }
      }
    };
    const r = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        Authorization: `token ${cfg.gistToken}`
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

    const text = await gistGetText(cfg);
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
      remoteText = await gistGetText(cfg);
    } catch {
      await gistPush(cfg);
      setSyncStatus("Remote initialized by push.");
      return;
    }

    let remote;
    try {
      remote = JSON.parse(remoteText);
    } catch {
      await gistPush(cfg);
      setSyncStatus("Remote fixed (invalid JSON replaced).");
      return;
    }

    const remoteAt = parseDate(remote?.state?.updatedAt);
    const localAt = parseDate(state.updatedAt);

    if (!remote?.state) {
      await gistPush(cfg);
      setSyncStatus("Remote fixed (invalid shape replaced).");
      return;
    }

    if (remoteAt > localAt) {
      const imported = importPayload(remoteText);
      if (!imported.ok) throw new Error(imported.err);
      dirty = false;
      render();
      setSyncStatus("Sync complete (pulled newer remote).");
      return;
    }

    if (localAt > remoteAt || dirty) {
      await gistPush(cfg);
      setSyncStatus("Sync complete (pushed newer local).");
      return;
    }

    setSyncStatus("Already in sync.");
  }

  function stopAutoSync() {
    if (autoPullTimer) {
      clearInterval(autoPullTimer);
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
    if (!cfg.auto || !syncReady(cfg)) return;

    autoPullTimer = setInterval(() => {
      void runAutoSync("interval");
    }, AUTO_PULL_INTERVAL_MS);
  }

  function scheduleAutoPush() {
    const cfg = getCfg();
    if (!cfg.auto || !syncReady(cfg)) return;
    if (autoPushTimer) clearTimeout(autoPushTimer);
    autoPushTimer = setTimeout(() => {
      void runAutoSync("change");
    }, AUTO_PUSH_DEBOUNCE_MS);
  }

  async function runAutoSync(reason) {
    const cfg = getCfg();
    if (!cfg.auto || !syncReady(cfg) || syncInFlight) return;

    syncInFlight = true;
    try {
      setSyncStatus(`Auto-sync (${reason})...`);
      if (dirty) await gistSync(cfg);
      else await gistPull(cfg, false);
    } catch (e) {
      setSyncStatus(`Auto-sync failed: ${String(e.message || e)}`);
    } finally {
      syncInFlight = false;
    }
  }

  function bindUI() {
    for (const id of ["search", "typeFilter", "onlyRemaining", "hideOptional"]) {
      $(id).addEventListener("input", render);
      $(id).addEventListener("change", render);
    }

    $("btnClearFilters").addEventListener("click", () => {
      $("search").value = "";
      $("typeFilter").value = "";
      $("onlyRemaining").checked = false;
      $("hideOptional").checked = false;
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
    $("gistFile").value = cfg.gistFile;
    $("gistToken").value = cfg.gistToken;
    $("autoSync").checked = !!cfg.auto;

    const saveCfgFromUI = () => {
      const nextCfg = {
        gistId: $("gistId").value.trim(),
        gistFile: $("gistFile").value.trim(),
        gistToken: $("gistToken").value.trim(),
        auto: $("autoSync").checked
      };
      setCfg(nextCfg);
      startAutoSync();
      setSyncStatus(syncReady(nextCfg) ? "Sync configured." : "Sync not configured.");
      return nextCfg;
    };

    for (const id of ["gistId", "gistFile", "gistToken", "autoSync"]) {
      $(id).addEventListener("change", saveCfgFromUI);
    }

    $("gistPull").addEventListener("click", async () => {
      const c = saveCfgFromUI();
      if (!syncReady(c)) return setSyncStatus("Fill gist ID/file/token first.");
      try {
        setSyncStatus("Pulling...");
        await gistPull(c, true);
      } catch (e) {
        setSyncStatus(`Pull failed: ${String(e.message || e)}`);
      }
    });

    $("gistPush").addEventListener("click", async () => {
      const c = saveCfgFromUI();
      if (!syncReady(c)) return setSyncStatus("Fill gist ID/file/token first.");
      try {
        setSyncStatus("Pushing...");
        await gistPush(c);
      } catch (e) {
        setSyncStatus(`Push failed: ${String(e.message || e)}`);
      }
    });

    $("gistSync").addEventListener("click", async () => {
      const c = saveCfgFromUI();
      if (!syncReady(c)) return setSyncStatus("Fill gist ID/file/token first.");
      try {
        setSyncStatus("Syncing...");
        await gistSync(c);
      } catch (e) {
        setSyncStatus(`Sync failed: ${String(e.message || e)}`);
      }
    });

    $("resetState").addEventListener("click", () => {
      if (!confirm("Reset local progress? This cannot be undone.")) return;
      state = defaultState();
      saveState();
      render();
      setSyncStatus("Local state reset.");
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

  bindUI();
  startAutoSync();
  initPWA();
  render();
})();/* Batman Guide app.js — build 2026-03-03.11-clean-sync-ui */
(() => {
  "use strict";

  const BUILD_ID = "2026-03-03.11-clean-sync-ui";
  const BASE = Array.isArray(window.BATMAN_GUIDE_LIST) ? window.BATMAN_GUIDE_LIST : [];
  const LIST_VERSION = "batman_guide_build_" + BUILD_ID;
  const STORAGE_KEY = "batman-guide:state:v2";
  const LEGACY_STORAGE_KEY = "batman-guide:state:v1";
  const GIST_CFG_KEY = "batman-guide:gist:v2";
  const LEGACY_GIST_CFG_KEY = "batman-guide:gist:v1";
  const ERA_OPEN_KEY = "batman-guide:eraOpen:v2";
  const LEGACY_ERA_OPEN_KEY = "batman-guide:eraOpen:v1";
  const AUTO_PULL_INTERVAL_MS = 15000;
  const AUTO_PUSH_DEBOUNCE_MS = 700;
  const PULL_THROTTLE_MS = 3000;

  const $ = (id) => document.getElementById(id);

  function nowISO(){ return new Date().toISOString(); }
  function fmtDate(iso){
    if(!iso) return "—";
    try{ return new Date(iso).toLocaleString(); }catch{ return iso; }
  }
  function sanitizeEraKey(s){ return (s||"unknown").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }

  try{ $("bootMsg") && $("bootMsg").remove(); }catch{}

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if(!raw) return { items:{}, lastTouchedId:null, updatedAt:null };
      const st = JSON.parse(raw);
      if(!st.items) st.items = {};
      return st;
    }catch{
      return { items:{}, lastTouchedId:null, updatedAt:null };
    }
  }
  let state = loadState();
  let dirty = false;
  let lastPullAt = 0;

  let autoPushTimer = null;
  let autoPullInterval = null;
  let autoSyncInFlight = false;

  async function runAutoSync(cfg, reason){
    if(!ready(cfg)) return;
    if(dirty) await gistSync(cfg, reason || "auto");
    else await pullIfNewer(cfg, reason || "auto");
  }

  async function attemptAutoSync(reason){
    const cfg = loadCfg();
    if(!cfg.auto || !ready(cfg) || autoSyncInFlight) return;
    autoSyncInFlight = true;
    try{
      await runAutoSync(cfg, reason);
    }catch{
      setSyncStatus("Auto-sync failed");
    }finally{
      autoSyncInFlight = false;
    }
  }

  function startAutoSyncLoop(){
    if(autoPullInterval){
      clearInterval(autoPullInterval);
      autoPullInterval = null;
    }
    const cfg = loadCfg();
    if(!cfg.auto || !ready(cfg)) return;
    autoPullInterval = setInterval(()=>{ attemptAutoSync("interval"); }, AUTO_PULL_INTERVAL_MS);
  }

  function scheduleAutoSync(){
    const cfg = loadCfg();
    if(!cfg.auto || !ready(cfg)) return;
    if(autoPushTimer) clearTimeout(autoPushTimer);
    autoPushTimer = setTimeout(()=>{ attemptAutoSync("change"); }, AUTO_PUSH_DEBOUNCE_MS);
  }

  function saveState(){
    state.updatedAt = nowISO();
    dirty = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    scheduleAutoSync();
  }
  function ensureItemState(id, type){
    if(!state.items[id]) state.items[id] = { done:false, pos:null, unit: type==="series" ? "issue" : (type==="collection" ? "item" : "page"), note:"", touchedAt:null };
    if(!state.items[id].unit) state.items[id].unit = type==="series" ? "issue" : (type==="collection" ? "item" : "page");
  }

  function groupByEra(entries){
    const map = new Map();
    for(const e of entries){
      const k = e.era || "Unknown era";
      if(!map.has(k)) map.set(k, []);
      map.get(k).push(e);
    }
    return map;
  }
  function getEraOrder(entries){
    const out = [];
    const seen = new Set();
    for(const e of entries){
      const k = e.era || "Unknown era";
      if(!seen.has(k)){ seen.add(k); out.push(k); }
    }
    return out;
  }

  function getFilteredEntries(all){
    const onlyRemaining = $("onlyRemaining")?.checked || false;
    const hideOptional = $("hideOptional")?.checked || false;
    const typeFilter = ($("typeFilter")?.value || "").trim();
    const q = ($("search")?.value || "").trim().toLowerCase();
    return all.filter(e => {
      ensureItemState(e.id, e.type);
      if(onlyRemaining && state.items[e.id].done) return false;
      if(hideOptional && e.optional) return false;
      if(typeFilter && e.type !== typeFilter) return false;
      if(q && !e.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function computeStats(entries){
    let done = 0;
    for(const e of entries){
      ensureItemState(e.id, e.type);
      if(state.items[e.id].done) done++;
    }
    const total = entries.length;
    const pct = total ? Math.round((done/total)*100) : 0;
    return {done,total,left:Math.max(0,total-done),pct};
  }

  function findNextUnread(entries){
    for(const e of entries){ ensureItemState(e.id, e.type); if(!state.items[e.id].done) return e; }
    return null;
  }
  function findContinue(entries){
    const id = state.lastTouchedId;
    if(id){
      const found = entries.find(e=>e.id===id);
      if(found) return found;
    }
    return findNextUnread(entries);
  }
  function scrollToId(id){
    const el = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
  }
  function scrollToEraKey(key){
    const el = document.getElementById(`era-${key}`);
    if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
  }

  function loadEraOpen(){
    try{ return JSON.parse(localStorage.getItem(ERA_OPEN_KEY) || localStorage.getItem(LEGACY_ERA_OPEN_KEY) || "{}"); }catch{ return {}; }
  }
  function saveEraOpen(map){ localStorage.setItem(ERA_OPEN_KEY, JSON.stringify(map)); }

  function refreshHeader(){
    const filtered = getFilteredEntries(BASE);
    const stats = computeStats(filtered);
    $("progressBar").style.width = stats.pct + "%";
    $("progressText").textContent = `Progress: ${stats.pct}% (${stats.done}/${stats.total})`;

    const next = findNextUnread(filtered);
    $("nextText").textContent = next ? next.title : "All done ✅";

    const cont = findContinue(filtered);
    let extra = "";
    if(cont){
      const st = state.items[cont.id];
      if(st && st.pos !== null && st.pos !== undefined) extra = ` — stop at: ${st.pos} ${st.unit||""}`.trim();
    }
    $("continueText").textContent = cont ? (cont.title + extra) : "—";
  }

  function render(){
    const main = $("main");
    const all = BASE.slice();
    const filtered = getFilteredEntries(all);

    const jump = $("jumpEra");
    const current = jump.value;
    jump.innerHTML = '<option value="">Jump to era…</option>';
    for(const era of getEraOrder(filtered)){
      const opt = document.createElement("option");
      opt.value = sanitizeEraKey(era);
      opt.textContent = era;
      jump.appendChild(opt);
    }
    jump.value = current;

    main.innerHTML = "";
    const eraOpen = loadEraOpen();
    const grouped = groupByEra(filtered);

    for(const eraName of getEraOrder(filtered)){
      const items = grouped.get(eraName) || [];
      if(!items.length) continue;

      const key = sanitizeEraKey(eraName);
      const wrapper = document.createElement("div");
      wrapper.className = "era";
      wrapper.id = `era-${key}`;

      const head = document.createElement("div");
      head.className = "eraHead";

      const left = document.createElement("div");
      left.innerHTML = `<div class="eraTitle">${eraName}</div><div class="eraSub">${items.length} item(s)</div>`;

      let eraDone = 0;
      for(const it of items) if(state.items[it.id]?.done) eraDone++;
      const eraPct = items.length ? Math.round((eraDone/items.length)*100) : 0;

      const right = document.createElement("div");
      right.className = "pill";
      right.textContent = `${eraDone}/${items.length} (${eraPct}%)`;

      head.appendChild(left);
      head.appendChild(right);

      const list = document.createElement("div");
      list.className = "list";

      let open = (eraOpen[key] === undefined) ? true : !!eraOpen[key];
      const applyOpen = ()=>{ list.style.display = open ? "block" : "none"; };
      applyOpen();

      head.addEventListener("click", ()=>{
        open = !open;
        const m = loadEraOpen();
        m[key] = open;
        saveEraOpen(m);
        applyOpen();
      });

      for(const entry of items){
        ensureItemState(entry.id, entry.type);
        const st = state.items[entry.id];

        const item = document.createElement("div");
        item.className = "item" + (st.done ? " done" : "");
        item.dataset.id = entry.id;

        const head2 = document.createElement("div");
        head2.className = "itemhead";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "check";
        cb.checked = !!st.done;
        cb.addEventListener("change", ()=>{
          st.done = cb.checked;
          st.touchedAt = nowISO();
          state.lastTouchedId = entry.id;
          saveState();
          render();
        });

        const meta = document.createElement("div");
        meta.style.flex = "1";

        const t = document.createElement("div");
        t.className = "title";
        t.textContent = entry.title;

        const meta2 = document.createElement("div");
        meta2.className = "meta2";

        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = entry.type.toUpperCase() + (entry.optional ? " • OPTIONAL" : "");

        const touched = document.createElement("span");
        touched.className = "mini";
        touched.textContent = st.touchedAt ? ("Updated: " + fmtDate(st.touchedAt)) : "";

        const buttons = document.createElement("div");
        buttons.className = "inline";

        if(entry.url){
          const a = document.createElement("a");
          a.href = entry.url;
          a.target = "_blank";
          a.rel = "noopener";
          a.className = "btn smallbtn primary";
          a.textContent = "Open";
          buttons.appendChild(a);
        }

        const setC = document.createElement("button");
        setC.className = "btn smallbtn";
        setC.textContent = "Set continue";
        setC.addEventListener("click", ()=>{
          state.lastTouchedId = entry.id;
          st.touchedAt = nowISO();
          saveState();
          refreshHeader();
          scrollToId(entry.id);
        });
        buttons.appendChild(setC);

        meta2.appendChild(badge);
        if(touched.textContent) meta2.appendChild(touched);
        meta2.appendChild(buttons);

        meta.appendChild(t);
        meta.appendChild(meta2);

        head2.appendChild(cb);
        head2.appendChild(meta);

        const fields = document.createElement("div");
        fields.className = "row";
        fields.style.marginTop = "10px";

        const pos = document.createElement("input");
        pos.className = "inp";
        pos.type = "number";
        pos.min = "0";
        pos.step = "1";
        pos.style.maxWidth = "140px";
        pos.placeholder = "stop at…";
        pos.value = (st.pos === null || st.pos === undefined) ? "" : String(st.pos);
        pos.addEventListener("input", ()=>{
          st.pos = pos.value === "" ? null : Number(pos.value);
          st.touchedAt = nowISO();
          state.lastTouchedId = entry.id;
          saveState();
          refreshHeader();
        });

        const unit = document.createElement("select");
        unit.style.maxWidth = "160px";
        ["page","issue","item","chapter","%"].forEach(u=>{
          const o = document.createElement("option");
          o.value=u; o.textContent=u;
          unit.appendChild(o);
        });
        unit.value = st.unit || "page";
        unit.addEventListener("change", ()=>{
          st.unit = unit.value;
          st.touchedAt = nowISO();
          state.lastTouchedId = entry.id;
          saveState();
          refreshHeader();
        });

        const note = document.createElement("input");
        note.className = "inp";
        note.type = "text";
        note.placeholder = "note…";
        note.value = st.note || "";
        note.addEventListener("input", ()=>{
          st.note = note.value;
          st.touchedAt = nowISO();
          state.lastTouchedId = entry.id;
          saveState();
          refreshHeader();
        });

        fields.appendChild(pos);
        fields.appendChild(unit);
        fields.appendChild(note);

        item.appendChild(head2);
        item.appendChild(fields);
        list.appendChild(item);
      }

      wrapper.appendChild(head);
      wrapper.appendChild(list);
      main.appendChild(wrapper);
    }

    refreshHeader();
  }

  const toolsOverlay = $("toolsOverlay");
  function openTools(){ toolsOverlay.classList.add("open"); toolsOverlay.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
  function closeTools(){ toolsOverlay.classList.remove("open"); toolsOverlay.setAttribute("aria-hidden","true"); document.body.style.overflow=""; }

  $("btnTools").addEventListener("click", openTools);
  $("fabTools").addEventListener("click", openTools);
  $("btnCloseTools").addEventListener("click", closeTools);
  toolsOverlay.addEventListener("click", (e)=>{ if(e.target === toolsOverlay) closeTools(); });

  $("btnTop").addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));
  $("btnNext").addEventListener("click", ()=>{ const f = getFilteredEntries(BASE); const n = findNextUnread(f); if(n) scrollToId(n.id); });
  $("btnContinue").addEventListener("click", ()=>{ const f = getFilteredEntries(BASE); const c = findContinue(f); if(c) scrollToId(c.id); });
  $("jumpEra").addEventListener("change", ()=>{ const v = $("jumpEra").value; if(v) scrollToEraKey(v); });

  ["onlyRemaining","hideOptional","typeFilter"].forEach(id=> $(id).addEventListener("change", render));
  $("search").addEventListener("input", render);

  document.addEventListener("keydown", (e)=>{
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    const typing = (tag==="input" || tag==="textarea" || tag==="select");
    if(typing && e.key !== "Escape") return;
    if(e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey){ e.preventDefault(); $("search").focus(); return; }
    if(e.key.toLowerCase() === "n") $("btnNext").click();
    if(e.key.toLowerCase() === "c") $("btnContinue").click();
    if(e.key === "Escape"){ $("search").blur(); closeTools(); }
  });

  function loadCfg(){
    try{
      const raw = localStorage.getItem(GIST_CFG_KEY) || localStorage.getItem(LEGACY_GIST_CFG_KEY);
      if(!raw) return { gistId:"", gistFile:"batman_guide_progress.json", token:"", auto:false };
      const c = JSON.parse(raw);
      return {
        gistId: (c.gistId||"").trim(),
        gistFile: (c.gistFile||"batman_guide_progress.json").trim() || "batman_guide_progress.json",
        token: (c.token||"").trim(),
        auto: !!c.auto
      };
    }catch{
      return { gistId:"", gistFile:"batman_guide_progress.json", token:"", auto:false };
    }
  }
  function saveCfg(cfg){ localStorage.setItem(GIST_CFG_KEY, JSON.stringify(cfg)); }
  function setSyncStatus(t){ $("syncStatus").textContent = t; }
  function cfgFromUI(){
    return {
      gistId: ($("gistId").value||"").trim(),
      gistFile: ($("gistFile").value||"batman_guide_progress.json").trim() || "batman_guide_progress.json",
      token: ($("gistToken").value||"").trim(),
      auto: $("autoSync").checked
    };
  }
  function cfgToUI(c){
    $("gistId").value = c.gistId || "";
    $("gistFile").value = c.gistFile || "batman_guide_progress.json";
    $("gistToken").value = c.token || "";
    $("autoSync").checked = !!c.auto;
  }
  function ready(c){ return !!(c.gistId && c.gistFile && c.token); }
  function saveCfgFromUI(){ const cfg = cfgFromUI(); saveCfg(cfg); return cfg; }
  function setCfgStatus(cfg){ setSyncStatus(ready(cfg) ? "Sync ready" : "Sync not configured"); }

  async function ghFetch(cfg, method, url, body){
    const headers = {
      "Accept":"application/vnd.github+json",
      "Authorization":"Bearer " + cfg.token,
      "X-GitHub-Api-Version":"2022-11-28"
    };
    const res = await fetch(url, {
      method,
      headers: Object.assign({}, headers, body ? {"Content-Type":"application/json"} : {}),
      body: body ? JSON.stringify(body) : undefined
    });
    if(!res.ok){
      const text = await res.text().catch(()=> "");
      throw new Error(`GitHub API ${res.status}: ${text || res.statusText}`);
    }
    return res.status === 204 ? null : res.json();
  }

  async function getGistFileText(cfg){
    const data = await ghFetch(cfg, "GET", `https://api.github.com/gists/${cfg.gistId}`);
    const files = data && data.files ? data.files : {};
    const f = files[cfg.gistFile];
    if(!f) throw new Error(`Gist file not found: ${cfg.gistFile}`);
    if(f.truncated && f.raw_url){
      const r = await fetch(f.raw_url, { headers: {"Accept":"text/plain"} });
      if(!r.ok) throw new Error("Failed to fetch raw gist file");
      return r.text();
    }
    return f.content || "";
  }

  function exportPayload(){
    return JSON.stringify({ version: LIST_VERSION, exportedAt: nowISO(), state }, null, 2);
  }
  function importPayload(txt){
    let obj;
    try{ obj = JSON.parse(txt); }catch{ return {ok:false, err:"Invalid JSON"}; }
    if(!obj || !obj.state) return {ok:false, err:"Not a valid export"};
    state = obj.state;
    if(!state.items) state.items = {};
    state.updatedAt = nowISO();
    saveState();
    return {ok:true};
  }

  async function gistPull(cfg){
    setSyncStatus("Pulling…");
    const content = await getGistFileText(cfg);
    const trimmed = (content || "").trim();
    if(!trimmed || trimmed === "{}" || trimmed === "[]"){
      throw new Error("Gist file is empty/placeholder. Press PUSH once on a device to create the first save, then pull on other devices.");
    }
    const res = importPayload(trimmed);
    if(!res.ok) throw new Error(res.err || "Invalid export JSON. Press PUSH once to overwrite the gist with a valid save.");
    dirty = false;
    setSyncStatus("Pulled ✓ " + new Date().toLocaleString());
    render();
  }

  async function gistPush(cfg){
    setSyncStatus("Pushing…");
    const payload = exportPayload();
    await ghFetch(cfg, "PATCH", `https://api.github.com/gists/${cfg.gistId}`, {
      files: { [cfg.gistFile]: { content: payload } }
    });
    dirty = false;
    setSyncStatus("Pushed ✓ " + new Date().toLocaleString());
  }

  function parseISO(iso){ const t = Date.parse(iso||""); return isNaN(t) ? 0 : t; }

  async function pullIfNewer(cfg, reason){
    if(!ready(cfg)) return;
    const now = Date.now();
    if(now - lastPullAt < PULL_THROTTLE_MS) return;
    lastPullAt = now;

    setSyncStatus(reason === "startup" ? "Syncing…" : "Checking…");
    let content = null;
    try{
      content = await getGistFileText(cfg);
    }catch{
      setSyncStatus("Sync ready");
      return;
    }
    const trimmed = (content || "").trim();
    if(!trimmed || trimmed === "{}" || trimmed === "[]"){
      setSyncStatus("Remote empty (push once)");
      return;
    }

    let remote = null;
    try{ remote = JSON.parse(trimmed); }catch{ remote = null; }
    if(!remote || !remote.state){
      setSyncStatus("Remote invalid (push once)");
      return;
    }

    const remoteUpdated = parseISO(remote?.state?.updatedAt);
    const localUpdated = parseISO(state?.updatedAt);
    if(remoteUpdated > localUpdated){
      const res = importPayload(trimmed);
      if(!res.ok){
        setSyncStatus("Import failed");
        return;
      }
      dirty = false;
      setSyncStatus("Pulled ✓ " + new Date().toLocaleString());
      render();
    } else {
      setSyncStatus("Up to date");
    }
  }

  async function gistSync(cfg, reason){
    setSyncStatus(reason ? `Syncing (${reason})…` : "Syncing…");
    let content = null;
    try{
      content = await getGistFileText(cfg);
    }catch{
      await gistPush(cfg);
      setSyncStatus("Synced ✓ (created gist save)");
      return;
    }

    const trimmed = (content || "").trim();
    if(!trimmed || trimmed === "{}" || trimmed === "[]"){
      await gistPush(cfg);
      setSyncStatus("Synced ✓ (initialized remote)");
      return;
    }

    let remote = null;
    try{ remote = JSON.parse(trimmed); }catch{ remote = null; }
    if(!remote || !remote.state){
      await gistPush(cfg);
      setSyncStatus("Synced ✓ (fixed remote format)");
      return;
    }

    const remoteUpdated = parseISO(remote?.state?.updatedAt);
    const localUpdated = parseISO(state?.updatedAt);
    if(remoteUpdated > localUpdated){
      const res = importPayload(trimmed);
      if(!res.ok) throw new Error(res.err);
      dirty = false;
      setSyncStatus("Synced ✓ (pulled newer)");
      render();
    } else if(localUpdated > remoteUpdated){
      await gistPush(cfg);
      setSyncStatus("Synced ✓ (pushed newer)");
    } else {
      setSyncStatus("Synced ✓ (already same)");
    }
  }

  const cfg = loadCfg();
  cfgToUI(cfg);
  setSyncStatus(ready(cfg) ? "Sync ready" : "Sync not configured");
  startAutoSyncLoop();
  if(ready(cfg)) { pullIfNewer(cfg, "startup"); }
  $("siteUrl").value = location.href;
  $("copySiteUrl").addEventListener("click", ()=> navigator.clipboard?.writeText(location.href).catch(()=>{}));
  ["gistId","gistFile","gistToken","autoSync"].forEach(id=> $(id).addEventListener("change", ()=>{
    const cfg = saveCfgFromUI();
    setCfgStatus(cfg);
    startAutoSyncLoop();
    if(cfg.auto) attemptAutoSync("settings");
  }));

  function bindSyncAction(buttonId, action, failStatus){
    $(buttonId).addEventListener("click", async ()=>{
      const cfg = saveCfgFromUI();
      if(!ready(cfg)) return alert("Fill Gist ID + file + token first.");
      try{ await action(cfg); }
      catch(e){ alert(String(e.message||e)); setSyncStatus(failStatus); }
    });
  }

  bindSyncAction("gistPull", gistPull, "Pull failed");
  bindSyncAction("gistPush", gistPush, "Push failed");
  bindSyncAction("gistSync", (cfg)=> gistSync(cfg, "manual"), "Sync failed");

  window.addEventListener("focus", ()=> attemptAutoSync("focus"));
  document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState === "visible") attemptAutoSync("visible"); });
  window.addEventListener("online", ()=> attemptAutoSync("online"));

  // PWA
  let deferredPrompt = null;
  const installBtn = $("installBtn");
  const installStatus = $("installStatus");
  const setInstallStatus = (t)=> installStatus.textContent = t;
  if(location.protocol === "file:") setInstallStatus("Open via HTTPS to install");
  else if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").then(()=> setInstallStatus("Offline ready (SW active)")).catch(()=> setInstallStatus("Install may be available (no SW)"));
  }
  window.addEventListener("beforeinstallprompt", (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "inline-flex";
    setInstallStatus("Install available");
  });
  installBtn.addEventListener("click", async ()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt = null;
    installBtn.style.display = "none";
    setInstallStatus("Install requested");
  });

  render();
})();
