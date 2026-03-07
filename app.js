(() => {
  "use strict";

  const BUILD_ID = "batman-guide-auto-sync";
  const LIST = Array.isArray(window.BATMAN_GUIDE_LIST) ? window.BATMAN_GUIDE_LIST : [];


  const REAL_COVERS = {
    "E1-01": "https://imgix-media.wbdndc.net/ingest/book/preview/91031541-9328-474c-9d6d-a67d249b6783/198d8835-5e2a-46af-8ac0-bd862ef573b1/0.jpg",
    "E1-02": "https://books.google.com/books/content?id=yJf0DQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    "E1-03": "https://books.google.com/books/content?id=NVUwDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    "E1-04": "https://books.google.com/books/content?id=RnxJDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    "E1-06": "https://books.google.com/books/content?id=yjyZwgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    "E1-07": "https://covers.openlibrary.org/b/id/12415426-M.jpg",
    "E2-01": "https://covers.openlibrary.org/b/id/7803421-M.jpg",
    "E3-01": "https://books.google.com/books/content?id=K6qn0QEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    "E3-02": "https://books.google.com/books/content?id=Zvg4AgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    "E4-00": "https://covers.openlibrary.org/b/id/749280-M.jpg",
    "E4-01": "https://covers.openlibrary.org/b/isbn/9781401207526-M.jpg",
    "E4-02": "https://covers.openlibrary.org/b/id/11026165-M.jpg",
    "E4-02A": "https://books.google.com/books/content?id=Rxt3EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    "E4-03A": "https://books.google.com/books/content?id=oZaVBgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    "E4-03B": "https://books.google.com/books/content?id=CKHWAwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    "E4-03C": "https://books.google.com/books/content?id=PE7yngEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    "E4-05": "https://covers.openlibrary.org/b/id/15166226-M.jpg",
    "E4-06": "https://books.google.com/books/content?id=jpV0DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    "E5-10": "https://books.google.com/books/content?id=nUu3BQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    filters: "batman-guide:filters:v1",
    customCovers: "batman-guide:custom-covers:v1",
    coverCache: "batman-guide:covers:v2",
    fallbackCoverCache: "batman-guide:fallback-covers:v1",
    uiPrefs: "batman-guide:ui:v1",
    syncOnboardingSeen: "batman-guide:sync:onboarding-seen:v1"
  };

  const AUTO_PULL_BASE_INTERVAL_MS = 15000;
  const AUTO_PULL_MAX_INTERVAL_MS = 120000;
  const AUTO_PUSH_DEBOUNCE_MS = 120;
  const PULL_THROTTLE_MS = 2500;
  const SYNC_REQUEST_TIMEOUT_MS = 9000;
  const FIXED_LOGO_URL = "./batman-logo.png";

  const $ = (id) => document.getElementById(id);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  const defaultState = () => ({
    build: BUILD_ID,
    updatedAt: null,
    lastTouchedId: null,
    customCovers: {},
    items: {}
  });

  const defaultCfg = () => ({
    gistId: "",
    gistToken: "",
    rememberToken: false,
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


  const defaultUiPrefs = () => ({
    filtersOpen: false,
    showCoverEditor: false,
    coverEditorOnlyMissing: true
  });

  function readUiPrefs() {
    return loadJSON(KEYS.uiPrefs, defaultUiPrefs());
  }

  function writeUiPrefs(next) {
    const current = readUiPrefs();
    void saveJSON(KEYS.uiPrefs, Object.assign(defaultUiPrefs(), current, next));
  }

  function readFilters() {
    return loadJSON(KEYS.filters, defaultFilters());
  }

  function writeFilters() {
    void saveJSON(KEYS.filters, {
      search: $("search").value || "",
      type: $("typeFilter").value || "",
      onlyRemaining: !!$("onlyRemaining").checked,
      hideOptional: !!$("hideOptional").checked,
      sortBy: $("sortBy").value || "order"
    });
  }

  function readFiltersFromURL() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const type = params.get("type") || "";
      const sortBy = params.get("sort") || "order";
      return {
        search: params.get("q") || "",
        type: ["", "book", "series", "collection"].includes(type) ? type : "",
        onlyRemaining: params.get("remaining") === "1",
        hideOptional: params.get("required") === "1",
        sortBy: ["order", "title", "progress"].includes(sortBy) ? sortBy : "order"
      };
    } catch {
      return defaultFilters();
    }
  }

  function writeFiltersToURL() {
    try {
      const filters = {
        search: $("search").value.trim(),
        type: $("typeFilter").value || "",
        onlyRemaining: !!$("onlyRemaining").checked,
        hideOptional: !!$("hideOptional").checked,
        sortBy: $("sortBy").value || "order"
      };
      const defaults = defaultFilters();
      const next = new URLSearchParams(window.location.search || "");

      if (filters.search && filters.search !== defaults.search) next.set("q", filters.search);
      else next.delete("q");

      if (filters.type && filters.type !== defaults.type) next.set("type", filters.type);
      else next.delete("type");

      if (filters.onlyRemaining !== defaults.onlyRemaining) next.set("remaining", filters.onlyRemaining ? "1" : "0");
      else next.delete("remaining");

      if (filters.hideOptional !== defaults.hideOptional) next.set("required", filters.hideOptional ? "1" : "0");
      else next.delete("required");

      if (filters.sortBy && filters.sortBy !== defaults.sortBy) next.set("sort", filters.sortBy);
      else next.delete("sort");

      const nextQuery = next.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash || ""}`;
      window.history.replaceState(null, "", nextUrl);
    } catch {
      // no-op: keep local filters even when URL updates fail
    }
  }

  let state = loadJSON(KEYS.state, defaultState());
  const customCovers = loadJSON(KEYS.customCovers, {});
  let dirty = false;
  let autoPushTimer = null;
  let autoPullTimer = null;
  let syncInFlight = false;
  let syncQueued = false;
  let lastPullAt = 0;
  let gistETag = "";
  let sessionToken = "";
  let pullDelayMs = AUTO_PULL_BASE_INTERVAL_MS;
  let randomTargetId = "";
  const coverCache = loadJSON(KEYS.coverCache, {});
  const fallbackCoverCache = loadJSON(KEYS.fallbackCoverCache, {});
  const coverFetchInFlight = new Map();
  const failedCoverCandidates = new Map();

  // Migration: older builds stored custom covers inside the sync state payload.
  if (state.customCovers && typeof state.customCovers === "object") {
    Object.assign(customCovers, state.customCovers);
    delete state.customCovers;
    void saveJSON(KEYS.customCovers, customCovers);
    void saveJSON(KEYS.state, state);
  }


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
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function setError(msg) {
    const box = $("errorBox");
    if (!box) return;
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
    if (!saveJSON(KEYS.state, state)) {
      setSyncStatus("Local save failed (storage unavailable). Changes remain in memory.");
    }
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

  function getEffectiveToken(cfg) {
    return (cfg?.gistToken || "").trim() || sessionToken;
  }

  function withRuntimeToken(cfg) {
    return Object.assign({}, cfg, { gistToken: getEffectiveToken(cfg) });
  }

  function setCfg(cfg) {
    void saveJSON(KEYS.syncCfg, cfg);
  }

  function syncReady(cfg) {
    return !!((cfg?.gistId || "").trim() && getEffectiveToken(cfg));
  }

  function setSyncStatus(text) {
    const el = $("syncStatus");
    if (el) el.textContent = text;
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function applyBrand() {
    const heroLogo = $("heroLogo");
    if (!heroLogo) return;
    heroLogo.src = FIXED_LOGO_URL;
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

  function randomUnread(entries) {
    const unread = entries.filter((e) => !ensureItemState(e).done);
    if (!unread.length) return null;
    return unread[Math.floor(Math.random() * unread.length)];
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

    const randomEntry = randomTargetId ? filtered.find((e) => e.id === randomTargetId) : null;
    $("randomText").textContent = `Random: ${randomEntry ? randomEntry.title : "-"}`;

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
    void saveJSON(KEYS.eraOpen, val);
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

  function entryCoverFallback(entry) {
    return `<div>${entryInitials(entry.title)}<small>${entryCoverLabel(entry)}</small></div>`;
  }

  function entryLogoFallback(entry) {
    return `
      <img src="${FIXED_LOGO_URL}" alt="${escapeHtml(entry.title)} cover fallback" loading="lazy" />
      <span class="cover-fallback-label">${entryCoverLabel(entry)}</span>
    `;
  }

  function extractDcuiId(url) {
    const value = String(url || "");
    const match = value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return match ? match[0] : "";
  }

  function dcuiCollectionSlug(url) {
    try {
      const pathname = new URL(url).pathname || "";
      const m = pathname.match(/\/collections\/([^/?#]+)/i);
      return m?.[1] ? m[1] : "";
    } catch {
      return "";
    }
  }

  function buildOfficialCoverCandidates(entry) {
    const candidates = [];
    const seen = new Set();
    const push = (url) => {
      const next = normalizeCoverUrl(url);
      if (!next || seen.has(next)) return;
      seen.add(next);
      candidates.push(next);
    };

    push(entry?.cover);
    if (Array.isArray(entry?.covers)) {
      for (const candidate of entry.covers) push(candidate);
    }
    push(REAL_COVERS[entry.id]);

    const url = String(entry?.url || "");
    const id = extractDcuiId(url);
    if (id) {
      push(`https://imgix-media.wbdndc.net/ingest/book/preview/${id}/0.jpg`);
      push(`https://imgix-media.wbdndc.net/ingest/series/preview/${id}/0.jpg`);
      push(`https://imgix-media.wbdndc.net/ingest/book/preview/${id}/${id}/0.jpg`);
      push(`https://imgix-media.wbdndc.net/ingest/series/preview/${id}/${id}/0.jpg`);
      push(`https://imgix-media.wbdndc.net/ingest/book/preview/${id}/cover.jpg`);
      push(`https://imgix-media.wbdndc.net/ingest/series/preview/${id}/cover.jpg`);
    }

    const slug = dcuiCollectionSlug(url);
    if (slug) {
      push(`https://imgix-media.wbdndc.net/ingest/collection/preview/${slug}/0.jpg`);
      push(`https://imgix-media.wbdndc.net/ingest/collections/preview/${slug}/0.jpg`);
    }

    return candidates;
  }

  function markCoverCandidateFailure(entryId, url) {
    if (!entryId || !url) return;
    if (!failedCoverCandidates.has(entryId)) failedCoverCandidates.set(entryId, new Set());
    failedCoverCandidates.get(entryId).add(url);
  }

  function isFailedCoverCandidate(entryId, url) {
    if (!entryId || !url) return false;
    return !!failedCoverCandidates.get(entryId)?.has(url);
  }

  function canLoadImageUrl(url) {
    return new Promise((resolve) => {
      if (!url) return resolve(false);
      const img = new Image();
      img.loading = "eager";
      img.referrerPolicy = "no-referrer";
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = normalizeCoverUrl(url);
    });
  }

  function isOfficialCoverUrl(url) {
    const value = String(url || "");
    return value.includes("imgix-media.wbdndc.net") || !!Object.values(REAL_COVERS).find((x) => x === value);
  }

  function escapeSvgText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function generatedCoverDataUrl(entry) {
    const safeTitle = escapeSvgText(entry?.title || "Batman");
    const safeType = escapeSvgText(entryCoverLabel(entry));
    const safeId = escapeSvgText(entry?.id || "");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="460" viewBox="0 0 320 460" role="img" aria-label="${safeTitle} cover">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect width="320" height="460" fill="url(#g)" />
        <rect x="18" y="18" width="284" height="424" rx="18" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" />
        <text x="28" y="70" fill="#f8fafc" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="700" letter-spacing="1">${safeType}</text>
        <foreignObject x="28" y="92" width="264" height="300">
          <div xmlns="http://www.w3.org/1999/xhtml" style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:32px;line-height:1.15;font-weight:800;">${safeTitle}</div>
        </foreignObject>
        <text x="28" y="430" fill="rgba(248,250,252,.85)" font-family="Arial,Helvetica,sans-serif" font-size="14" letter-spacing=".8">${safeId}</text>
      </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function resolveFallbackCover(entry, opts = {}) {
    const id = entry.id;
    const force = !!opts.force;
    if (!id) return "";

    const cached = normalizeCoverUrl(fallbackCoverCache[id]);
    if (!force && cached && !isFailedCoverCandidate(id, cached)) return cached;

    const generated = generatedCoverDataUrl(entry);
    fallbackCoverCache[id] = generated;
    void saveJSON(KEYS.fallbackCoverCache, fallbackCoverCache);
    return generated;
  }

  async function resolveOfficialCover(entry, opts = {}) {
    const id = entry.id;
    const force = !!opts.force;
    if (!id) return "";

    const cached = coverCache[id];
    if (!force && cached && isOfficialCoverUrl(cached) && !isFailedCoverCandidate(id, cached)) return cached;

    const candidates = buildOfficialCoverCandidates(entry);
    for (const url of candidates) {
      if (!url) continue;
      if (isFailedCoverCandidate(id, url)) continue;
      const ok = await canLoadImageUrl(url);
      if (!ok) {
        markCoverCandidateFailure(id, url);
        continue;
      }
      coverCache[id] = url;
      void saveJSON(KEYS.coverCache, coverCache);
      return url;
    }

    return "";
  }

  function normalizeCoverUrl(url) {

    if (!url) return "";
    if (!url.includes("covers.openlibrary.org")) return url;
    return url.includes("?") ? `${url}&default=false` : `${url}?default=false`;
  }

  function sanitizeManualCoverUrl(url) {
    const value = String(url || "").trim();
    if (!/^https?:\/\//i.test(value)) return "";
    return normalizeCoverUrl(value);
  }

  function getManualCoverUrl(entryId) {
    return normalizeCoverUrl(customCovers?.[entryId]);
  }

  function setManualCoverUrl(entryId, url) {
    if (!entryId) return;
    const next = sanitizeManualCoverUrl(url);
    if (!next) {
      delete customCovers[entryId];
      void saveJSON(KEYS.customCovers, customCovers);
      return;
    }
    customCovers[entryId] = next;
    void saveJSON(KEYS.customCovers, customCovers);
  }

  function entryHasStoredCover(entry) {
    return !!(
      getManualCoverUrl(entry.id)
      || normalizeCoverUrl(entry?.cover)
      || normalizeCoverUrl(REAL_COVERS[entry.id])
      || normalizeCoverUrl(coverCache[entry.id])
    );
  }

  function loadCoverImage(coverEl, entry, url) {
    return new Promise((resolve) => {
      if (!coverEl || !url) return resolve(false);
      coverEl.innerHTML = "";
      const img = document.createElement("img");
      img.src = normalizeCoverUrl(url);
      img.alt = `${entry.title} cover`;
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.onload = () => resolve(true);
      img.onerror = () => {
        markCoverCandidateFailure(entry.id, url);
        img.remove();
        resolve(false);
      };
      coverEl.appendChild(img);
    });
  }

  async function applyBestCover(coverEl, entry) {
    const manual = getManualCoverUrl(entry.id);
    const primary = normalizeCoverUrl(entry?.cover) || REAL_COVERS[entry.id];
    const cached = coverCache[entry.id];
    const fallbackCached = normalizeCoverUrl(fallbackCoverCache[entry.id]);

    if (cached && !isOfficialCoverUrl(cached)) {
      delete coverCache[entry.id];
      void saveJSON(KEYS.coverCache, coverCache);
    }

    const candidates = [];
    if (manual) candidates.push(manual);
    if (primary) candidates.push(primary);
    if (cached && isOfficialCoverUrl(cached) && cached !== primary) candidates.push(cached);
    if (fallbackCached && fallbackCached !== primary && fallbackCached !== cached) candidates.push(fallbackCached);

    for (const url of candidates) {
      if (await loadCoverImage(coverEl, entry, url)) return;
    }

    const discoveredOfficial = await resolveOfficialCover(entry, { force: true });
    if (discoveredOfficial && await loadCoverImage(coverEl, entry, discoveredOfficial)) return;

    const discoveredFallback = resolveFallbackCover(entry, { force: true });
    if (discoveredFallback && await loadCoverImage(coverEl, entry, discoveredFallback)) return;

    coverEl.classList.add("fallback-logo");
    coverEl.innerHTML = entryLogoFallback(entry);
  }

  function render() {
    setError("");
    const uiPrefs = readUiPrefs();
    const showCoverEditor = !!uiPrefs.showCoverEditor;
    const coverEditorOnlyMissing = !!uiPrefs.coverEditorOnlyMissing;
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
    const continueId = continueEntry(filtered)?.id || "";
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
      summary.innerHTML = `<span>${escapeHtml(era)}</span><span class="muted">${done}/${items.length} (${pct}%)</span>`;
      details.appendChild(summary);

      const list = document.createElement("div");
      list.className = "items";

      for (const entry of items) {
        const st = ensureItemState(entry);

        const item = document.createElement("div");
        const isContinueTarget = continueId && entry.id === continueId;
        const isRandomTarget = randomTargetId && entry.id === randomTargetId;
        item.className = `item${st.done ? " done" : ""}${isContinueTarget ? " continue-target" : ""}${isRandomTarget ? " random-target" : ""}`;
        item.dataset.id = entry.id;

        const cover = document.createElement("div");
        cover.className = "cover";
        cover.style.background = coverGradient(entry);
        cover.innerHTML = entryCoverFallback(entry);
        void applyBestCover(cover, entry);

        const content = document.createElement("div");

        const top = document.createElement("div");
        top.className = "item-head";
        const safeTitle = escapeHtml(entry.title);
        const safeUrl = escapeAttr(safeExternalUrl(entry.url));
        top.innerHTML = `
          <label class="item-title-row">
            <input type="checkbox" ${st.done ? "checked" : ""} data-action="done" />
            <span class="title">${safeTitle}</span>
          </label>
          <a class="item-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open</a>
        `;

        const tags = document.createElement("div");
        tags.className = "tags";
        tags.innerHTML = `
          <span class="tag">${escapeHtml(entry.type)}</span>
          <span class="tag">${entry.optional ? "optional" : "required"}</span>
          ${isContinueTarget ? "<span class=\"tag continue-tag\">continue</span>" : ""}
          ${isRandomTarget ? "<span class=\"tag random-tag\">random pick</span>" : ""}
          <span class="muted">${escapeHtml(entry.id)}</span>
        `;

        const progress = document.createElement("div");
        progress.className = "progress-fields";
        progress.innerHTML = `
          <input class="input" data-action="pos" placeholder="where you stopped" value="${escapeHtml(st.pos || "")}" />
          <input class="input" data-action="note" placeholder="note" value="${escapeHtml(st.note || "")}" />
        `;

        const shouldShowEditor = showCoverEditor && (!coverEditorOnlyMissing || !entryHasStoredCover(entry));
        let manualCover = null;
        if (shouldShowEditor) {
          manualCover = document.createElement("div");
          manualCover.className = "manual-cover-fields";
          manualCover.innerHTML = `
            <input class="input" data-action="cover-url" placeholder="manual cover URL (https://...)" value="${escapeAttr(customCovers?.[entry.id] || "")}" />
            <button class="btn" type="button" data-action="save-cover">Save cover</button>
            <button class="btn" type="button" data-action="clear-cover">Clear</button>
          `;
        }

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

        if (manualCover) {
          const coverInput = manualCover.querySelector('[data-action="cover-url"]');
          const saveCoverBtn = manualCover.querySelector('[data-action="save-cover"]');
          const clearCoverBtn = manualCover.querySelector('[data-action="clear-cover"]');

          saveCoverBtn.addEventListener("click", () => {
            const next = sanitizeManualCoverUrl(coverInput.value);
            if (!next) {
              setSyncStatus(`Invalid cover URL for ${entry.id}. Use http(s).`);
              return;
            }
            setManualCoverUrl(entry.id, next);
            failedCoverCandidates.delete(entry.id);
            st.touchedAt = nowISO();
            state.lastTouchedId = entry.id;
            saveState();
            render();
            setSyncStatus(`Saved manual cover for ${entry.id}.`);
          });

          clearCoverBtn.addEventListener("click", () => {
            setManualCoverUrl(entry.id, "");
            failedCoverCandidates.delete(entry.id);
            st.touchedAt = nowISO();
            state.lastTouchedId = entry.id;
            saveState();
            render();
            setSyncStatus(`Cleared manual cover for ${entry.id}.`);
          });
        }

        content.append(top, tags, progress);
        if (manualCover) content.append(manualCover);

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
    window.__BATMAN_APP_READY = true;
    updateDebugHealth();
  }

  function escapeHtml(v) {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(v) {
    return escapeHtml(v).replace(/`/g, "&#96;");
  }

  function safeExternalUrl(rawUrl) {
    const str = String(rawUrl || "").trim();
    if (!str) return "about:blank";
    try {
      const parsed = new URL(str, window.location.origin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
      return "about:blank";
    } catch {
      return "about:blank";
    }
  }

  function exportPayload() {
    return JSON.stringify({
      app: "Batman Guide",
      version: 1,
      updatedAt: nowISO(),
      customCovers,
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
      const importedCustomCovers = payload.customCovers && typeof payload.customCovers === "object"
        ? payload.customCovers
        : {};
      for (const [entryId, url] of Object.entries(importedCustomCovers)) {
        setManualCoverUrl(entryId, url);
      }
      if (!saveJSON(KEYS.state, state)) {
        setSyncStatus("Local save failed (storage unavailable). Changes remain in memory.");
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e.message || "Parse error" };
    }
  }

  const GIST_FILE = "batmanguide_progress.json";
  const GIST_COVERS_FILE = "batmanguide_covers.json";

  function exportCustomCoversPayload() {
    return JSON.stringify({
      app: "Batman Guide",
      version: 1,
      updatedAt: nowISO(),
      customCovers
    }, null, 2);
  }

  function importCustomCoversPayload(text) {
    try {
      const payload = JSON.parse(String(text || ""));
      const covers = payload?.customCovers && typeof payload.customCovers === "object"
        ? payload.customCovers
        : {};
      for (const [entryId, url] of Object.entries(covers)) {
        setManualCoverUrl(entryId, url);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e.message || "Parse error" };
    }
  }

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

  async function gistGetTextFromFile(cfg, fileName) {
    const { gist } = await gistFetch(cfg, { allowNotModified: false });
    const file = gist.files?.[fileName];
    if (!file) return { found: false, text: "" };
    if (typeof file.content === "string") return { found: true, text: file.content };
    if (file.raw_url) {
      const rr = await fetch(file.raw_url, {
        headers: { Authorization: `Bearer ${cfg.gistToken}` }
      });
      if (!rr.ok) throw new Error(`Raw file fetch failed (${rr.status})`);
      return { found: true, text: await rr.text() };
    }
    return { found: false, text: "" };
  }

  async function gistPush(cfg) {
    const body = {
      files: {
        [GIST_FILE]: {
          content: exportPayload()
        },
        [GIST_COVERS_FILE]: {
          content: exportCustomCoversPayload()
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
      try {
        const coverPayload = await gistGetTextFromFile(cfg, GIST_COVERS_FILE);
        if (coverPayload.found) {
          const importedCovers = importCustomCoversPayload(coverPayload.text);
          if (!importedCovers.ok) throw new Error(importedCovers.err);
        }
      } catch {
        // optional file; ignore when missing/unavailable
      }
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
      try {
        const coverPayload = await gistGetTextFromFile(cfg, GIST_COVERS_FILE);
        if (coverPayload.found) {
          const importedCovers = importCustomCoversPayload(coverPayload.text);
          if (!importedCovers.ok) throw new Error(importedCovers.err);
        }
      } catch {
        // optional file; ignore when missing/unavailable
      }
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
    const cfg = withRuntimeToken(getCfg());
    if (!syncReady(cfg) || !cfg.auto) return;

    pullDelayMs = clampPullInterval(cfg.pullMs);
    void runAutoSync("start");
  }

  function scheduleAutoPush() {
    const cfg = withRuntimeToken(getCfg());
    if (!syncReady(cfg) || !cfg.auto) return;
    if (autoPushTimer) clearTimeout(autoPushTimer);
    autoPushTimer = setTimeout(() => {
      void runAutoSync("change");
    }, AUTO_PUSH_DEBOUNCE_MS);
  }

  async function runAutoSync(reason) {
    const cfg = withRuntimeToken(getCfg());
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


  async function upgradeCoversFromDcui() {
    const missing = LIST.filter((entry) => !REAL_COVERS[entry.id] && !isOfficialCoverUrl(coverCache[entry.id]));
    for (const entry of missing.slice(0, 18)) {
      await resolveOfficialCover(entry, { force: true });
    }
    if (missing.length) render();
  }

  function touchOptimizedHeader() {
    const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    return coarsePointer && window.innerWidth <= 1366;
  }

  function bindAdaptiveHeader() {
    const header = document.querySelector(".top");
    const controls = $("headerControls");
    const filterToggle = $("btnFilterMenu");
    const revealHeader = $("btnRevealHeader");
    if (!header || !controls || !filterToggle || !revealHeader) return;
    let lastScrollY = window.scrollY;
    let userWantsFiltersOpen = !!readUiPrefs().filtersOpen;
    let headerHidden = false;
    let forceHeaderVisibleUntil = 0;

    const syncFilterToggle = () => {
      const open = !controls.classList.contains("hidden");
      filterToggle.setAttribute("aria-expanded", String(open));
      filterToggle.textContent = open ? "Hide filters" : "Filters";
    };

    const setFiltersOpen = (open, persist = true) => {
      controls.classList.toggle("hidden", !open);
      syncFilterToggle();
      if (!persist) return;
      userWantsFiltersOpen = !!open;
      writeUiPrefs({ filtersOpen: userWantsFiltersOpen });
    };

    const setHeaderHidden = (hidden) => {
      headerHidden = !!hidden;
      header.classList.toggle("header-hidden", headerHidden);
      syncRevealButton();
    };

    const syncRevealButton = () => {
      const shouldShow = headerHidden;
      revealHeader.classList.toggle("hidden", !shouldShow);
    };

    const releaseHeaderFocus = () => {
      const active = document.activeElement;
      if (!active || active === document.body) return;
      if (!header.contains(active)) return;
      if (typeof active.blur === "function") active.blur();
    };

    filterToggle.addEventListener("click", () => {
      const opening = controls.classList.contains("hidden");
      setFiltersOpen(opening);
      if (opening) {
        forceHeaderVisibleUntil = Date.now() + 900;
        setHeaderHidden(false);
      }
      header.classList.toggle("header-expanded", opening);
    });

    revealHeader.addEventListener("click", () => {
      forceHeaderVisibleUntil = Date.now() + 900;
      setHeaderHidden(false);
      header.classList.toggle("header-expanded", userWantsFiltersOpen);
      setFiltersOpen(userWantsFiltersOpen, false);
    });

    const updateCompactMode = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY;
      const shouldCompact = y > 24 || window.innerHeight < 860;
      const scrollingDown = delta > 4;
      const nearTop = y < 72;
      const forceVisible = Date.now() < forceHeaderVisibleUntil;
      const filtersExpanded = header.classList.contains("header-expanded");

      if (touchOptimizedHeader()) {
        header.classList.remove("compact", "header-hidden");
        headerHidden = false;
        setFiltersOpen(userWantsFiltersOpen, false);
        syncRevealButton();
        return;
      }

      if (forceVisible || !shouldCompact || y < 48 || nearTop) {
        setHeaderHidden(false);
      } else if (shouldCompact && scrollingDown && y > 180) {
        if (filtersExpanded) {
          header.classList.remove("header-expanded");
          setFiltersOpen(false, false);
        }
        releaseHeaderFocus();
        setHeaderHidden(true);
      } else if (delta < -4) {
        setHeaderHidden(false);
      }

      header.classList.toggle("compact", shouldCompact);

      if (shouldCompact && y > 24) {
        const stillExpanded = header.classList.contains("header-expanded");
        if (stillExpanded && !headerHidden) {
          setFiltersOpen(userWantsFiltersOpen, false);
        } else {
          setFiltersOpen(false, false);
        }
      } else {
        setHeaderHidden(false);
        setFiltersOpen(userWantsFiltersOpen, false);
        header.classList.remove("header-expanded");
      }
    };

    let raf = 0;
    const queueUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateCompactMode();
        lastScrollY = window.scrollY;
      });
    };

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    updateCompactMode();
  }


  function isDebugMode() {
    try {
      const q = new URLSearchParams(window.location.search || "");
      return q.get("debug") === "1" || localStorage.getItem("batman-guide:debug") === "1";
    } catch {
      return false;
    }
  }

  function updateDebugHealth() {
    const box = $("debugHealth");
    if (!box) return;
    const enabled = isDebugMode();
    box.classList.toggle("hidden", !enabled);
    if (!enabled) return;

    const ready = window.__BATMAN_APP_READY === true ? "yes" : "no";
    const lastStep = window.__BATMAN_LAST_STARTUP_STEP || "-";
    const lastUiStep = window.__BATMAN_LAST_UI_STEP || "-";
    const err = window.__BATMAN_APP_ERROR || "-";
    box.innerHTML = `<strong>Debug health</strong> · ready: ${ready} · startup: ${escapeHtml(lastStep)} · ui: ${escapeHtml(lastUiStep)} · error: ${escapeHtml(err)}`;
  }

  function syncQuickFilterChips() {
    const chipOpen = $("chipOpen");
    const chipRequired = $("chipRequired");
    const chipBook = $("chipBook");
    if (chipOpen) chipOpen.classList.toggle("active", $("onlyRemaining").checked);
    if (chipRequired) chipRequired.classList.toggle("active", $("hideOptional").checked);
    if (chipBook) chipBook.classList.toggle("active", $("typeFilter").value === "book");
  }

  function bindUI() {
    const runUIStep = (step, fn) => {
      window.__BATMAN_LAST_UI_STEP = step;
      updateDebugHealth();
      try {
        fn();
      } catch (error) {
        reportStartupIssue(`bindUI:${step}`, error, false);
      } finally {
        updateDebugHealth();
      }
    };

    let syncEraToggleButton = () => {};

    runUIStep("restoreFilters", () => {
      const savedFilters = readFilters();
      const urlFilters = readFiltersFromURL();
      const params = new URLSearchParams(window.location.search || "");
      const hasURLFilters = ["q", "type", "remaining", "required", "sort"].some((key) => params.has(key));
      const activeFilters = hasURLFilters ? Object.assign(savedFilters, urlFilters) : savedFilters;

      $("search").value = activeFilters.search || "";
      $("typeFilter").value = activeFilters.type || "";
      $("onlyRemaining").checked = !!activeFilters.onlyRemaining;
      $("hideOptional").checked = !!activeFilters.hideOptional;
      $("sortBy").value = activeFilters.sortBy || "order";
      syncQuickFilterChips();
      writeFilters();
      writeFiltersToURL();
    });

    runUIStep("coverEditorPrefs", () => {
      const prefs = readUiPrefs();
      const showToggle = $("showCoverEditor");
      const missingToggle = $("coverEditorOnlyMissing");
      if (showToggle) showToggle.checked = !!prefs.showCoverEditor;
      if (missingToggle) missingToggle.checked = !!prefs.coverEditorOnlyMissing;

      if (showToggle) {
        showToggle.addEventListener("change", () => {
          writeUiPrefs({ showCoverEditor: !!showToggle.checked });
          render();
        });
      }

      if (missingToggle) {
        missingToggle.addEventListener("change", () => {
          writeUiPrefs({ coverEditorOnlyMissing: !!missingToggle.checked });
          render();
        });
      }
    });

    runUIStep("filterInputs", () => {
      for (const id of ["search", "typeFilter", "onlyRemaining", "hideOptional", "sortBy"]) {
        $(id).addEventListener("input", () => {
          writeFilters();
          writeFiltersToURL();
          syncQuickFilterChips();
          render();
          syncEraToggleButton();
        });
        $(id).addEventListener("change", () => {
          writeFilters();
          writeFiltersToURL();
          syncQuickFilterChips();
          render();
          syncEraToggleButton();
        });
      }
    });

    runUIStep("quickFilterChips", () => {
      const chipOpen = $("chipOpen");
      const chipRequired = $("chipRequired");
      const chipBook = $("chipBook");
      if (chipOpen) {
        chipOpen.addEventListener("click", () => {
          $("onlyRemaining").checked = !$("onlyRemaining").checked;
          writeFilters();
          writeFiltersToURL();
          syncQuickFilterChips();
          render();
          syncEraToggleButton();
        });
      }
      if (chipRequired) {
        chipRequired.addEventListener("click", () => {
          $("hideOptional").checked = !$("hideOptional").checked;
          writeFilters();
          writeFiltersToURL();
          syncQuickFilterChips();
          render();
          syncEraToggleButton();
        });
      }
      if (chipBook) {
        chipBook.addEventListener("click", () => {
          $("typeFilter").value = $("typeFilter").value === "book" ? "" : "book";
          writeFilters();
          writeFiltersToURL();
          syncQuickFilterChips();
          render();
          syncEraToggleButton();
        });
      }
    });

    runUIStep("eraControls", () => {
      syncEraToggleButton = () => {
        const btn = $("btnToggleAllEras");
        if (!btn) return;
        const eras = [...groupedByEra(getFiltered()).keys()];
        if (!eras.length) {
          btn.disabled = true;
          btn.textContent = "No eras in view";
          return;
        }
        btn.disabled = false;
        const updated = loadOpenState();
        const allOpen = eras.every((era) => updated[eraKey(era)] !== false);
        btn.textContent = allOpen ? "Collapse all eras" : "Expand all eras";
        btn.setAttribute("aria-label", allOpen ? "Collapse all visible era sections" : "Expand all visible era sections");
      };

      const eraJump = $("eraJump");
      if (eraJump) {
        eraJump.addEventListener("change", () => {
          const key = eraJump.value;
          if (!key) return;
          const section = document.querySelector(`details[data-era-key="${CSS.escape(key)}"]`);
          if (section) {
            section.open = true;
            section.scrollIntoView({ behavior: "smooth", block: "start" });
            syncEraToggleButton();
          }
        });
      }

      const toggleAllEras = (forceOpen = null) => {
        const eras = [...groupedByEra(getFiltered()).keys()];
        const updated = loadOpenState();
        const allOpen = eras.every((era) => updated[eraKey(era)] !== false);
        const nextOpen = forceOpen == null ? !allOpen : !!forceOpen;
        for (const era of eras) updated[eraKey(era)] = nextOpen;
        saveOpenState(updated);
        render();
        syncEraToggleButton();
      };

      const toggleAllBtn = $("btnToggleAllEras");
      if (toggleAllBtn) toggleAllBtn.addEventListener("click", () => toggleAllEras(null));

      const expandAllBtn = $("btnExpandAll");
      if (expandAllBtn) expandAllBtn.addEventListener("click", () => toggleAllEras(true));

      const collapseAllBtn = $("btnCollapseAll");
      if (collapseAllBtn) collapseAllBtn.addEventListener("click", () => toggleAllEras(false));

      $("main").addEventListener("toggle", (e) => {
        if (e.target?.matches?.('details[data-era-key]')) syncEraToggleButton();
      }, true);

      syncEraToggleButton();
    });

    runUIStep("clearFilters", () => {
      $("btnClearFilters").addEventListener("click", () => {
        $("search").value = "";
        $("typeFilter").value = "";
        $("onlyRemaining").checked = false;
        $("hideOptional").checked = false;
        $("sortBy").value = "order";
        writeFilters();
        writeFiltersToURL();
        syncQuickFilterChips();
        render();
        syncEraToggleButton();
      });
    });
    runUIStep("quickNav", () => {
      $("btnNext").addEventListener("click", () => {
        const next = nextUnread(getFiltered());
        if (next) scrollToEntry(next.id);
      });
      $("btnRandom").addEventListener("click", () => {
        const random = randomUnread(getFiltered());
        if (!random) return;
        randomTargetId = random.id;
        render();
        scrollToEntry(random.id);
      });
      $("btnContinue").addEventListener("click", () => {
        const c = continueEntry(getFiltered());
        if (c) scrollToEntry(c.id);
      });
    });

    runUIStep("syncConfig", () => {
      const cfg = getCfg();
      const syncMenu = $("syncMenu");
      const syncMenuTitle = $("syncMenuTitle");
      const syncMenuHint = $("syncMenuHint");
      sessionToken = cfg.gistToken || "";
      $("gistId").value = cfg.gistId;
      $("gistToken").value = cfg.gistToken;
      $("rememberToken").checked = cfg.rememberToken === true;

      const onboardingSeen = () => {
        try {
          return localStorage.getItem(KEYS.syncOnboardingSeen) === "1";
        } catch {
          return true;
        }
      };

      const markOnboardingSeen = () => {
        try {
          localStorage.setItem(KEYS.syncOnboardingSeen, "1");
        } catch {
          // ignore localStorage failures
        }
      };

      const refreshSyncMenuState = (cfgNow) => {
        if (!syncMenu) return;
        const ready = syncReady(cfgNow);
        syncMenu.classList.toggle("is-onboarding", !ready);
        syncMenu.classList.toggle("is-ready", ready);
        if (syncMenuTitle) syncMenuTitle.textContent = ready ? "☁" : "Sync setup";
        if (syncMenuHint) syncMenuHint.textContent = ready ? "" : "(one-time)";
        if (!ready && !onboardingSeen()) {
          syncMenu.open = true;
          markOnboardingSeen();
        } else if (ready) {
          syncMenu.open = false;
        }
      };

      const readCfgFromUI = () => {
        const tokenInput = $("gistToken").value.trim();
        const rememberToken = $("rememberToken").checked;
        sessionToken = tokenInput;
        return {
          gistId: $("gistId").value.trim(),
          gistToken: rememberToken ? tokenInput : "",
          rememberToken,
          auto: true,
          pullMs: clampPullInterval(getCfg().pullMs)
        };
      };

      let settingsSyncTimer = null;
      const scheduleSettingsSync = () => {
        if (settingsSyncTimer) clearTimeout(settingsSyncTimer);
        settingsSyncTimer = setTimeout(() => {
          settingsSyncTimer = null;
          void runAutoSync("settings");
        }, 260);
      };

      const saveCfgFromUI = (triggerSyncNow = false) => {
        const nextCfg = readCfgFromUI();
        setCfg(nextCfg);
        startAutoSync();
        if (!syncReady(nextCfg)) {
          setSyncStatus("Auto-sync is ready once Gist ID and token are filled.");
        } else {
          setSyncStatus("Auto-sync active (adaptive polling).");
          if (triggerSyncNow) scheduleSettingsSync();
        }
        refreshSyncMenuState(nextCfg);
        return nextCfg;
      };

      for (const id of ["gistId", "gistToken", "rememberToken"]) {
        $(id).addEventListener("change", () => {
          saveCfgFromUI(true);
        });
      }
      for (const id of ["gistId", "gistToken"]) {
        $(id).addEventListener("input", () => {
          saveCfgFromUI(false);
        });
      }

      $("clearToken")?.addEventListener("click", () => {
        sessionToken = "";
        $("gistToken").value = "";
        $("rememberToken").checked = false;
        const cfgNow = getCfg();
        const nextCfg = {
          gistId: cfgNow.gistId || "",
          gistToken: "",
          rememberToken: false,
          auto: true,
          pullMs: clampPullInterval(cfgNow.pullMs)
        };
        setCfg(nextCfg);
        startAutoSync();
        setSyncStatus("Token cleared from this session and local storage.");
        refreshSyncMenuState(nextCfg);
      });

      refreshSyncMenuState(cfg);
    });

    runUIStep("backupTools", () => {
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
    });

    runUIStep("globalActions", () => {
      $("resetState").addEventListener("click", () => {
        if (!confirm("Reset local progress? This cannot be undone.")) return;
        state = defaultState();
        saveState();
        render();
        setSyncStatus("Local state reset.");
      });

      window.addEventListener("keydown", (e) => {
        const t = e.target;
        const isTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);

        if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
          if (isTyping) return;
          e.preventDefault();
          $("search").focus();
          return;
        }

        if ((e.key === "r" || e.key === "R") && !e.metaKey && !e.ctrlKey && !e.altKey) {
          if (isTyping) return;
          e.preventDefault();
          $("btnRandom")?.click();
        }
      });

      window.addEventListener("focus", () => void runAutoSync("focus"));
      window.addEventListener("online", () => void runAutoSync("online"));
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") void runAutoSync("visible");
      });
    });

  }



  function normalizeDomConflicts() {
    const uniqueIds = [
      "chipOpen", "chipRequired", "chipBook",
      "btnToggleAllEras", "btnExpandAll", "btnCollapseAll",
      "advancedControls", "eraJump"
    ];

    for (const id of uniqueIds) {
      const nodes = document.querySelectorAll(`#${CSS.escape(id)}`);
      if (nodes.length < 2) continue;
      nodes.forEach((node, idx) => {
        if (idx > 0) node.remove();
      });
    }

    const quickFilterRows = document.querySelectorAll('.header-controls .quick-filters');
    quickFilterRows.forEach((row, idx) => {
      if (idx > 0) row.remove();
    });
  }

  function initPWA() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }


  async function attemptStartupRecovery() {
    const key = "batman-guide:startup-recovery-attempted";
    if (sessionStorage.getItem(key) === "1") return;

    const hasList = Array.isArray(window.BATMAN_GUIDE_LIST) && window.BATMAN_GUIDE_LIST.length > 0;
    if (!hasList) return;

    sessionStorage.setItem(key, "1");
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      // best effort
    }

    const u = new URL(window.location.href);
    u.searchParams.set("cache_bust", String(Date.now()));
    window.location.replace(u.toString());
  }

  function reportStartupIssue(step, error, critical = false) {
    window.__BATMAN_LAST_STARTUP_STEP = step;
    const message = `${step}: ${String(error?.message || error)}`;
    window.__BATMAN_APP_READY = false;
    window.__BATMAN_APP_ERROR = message;
    console.error(`Startup step failed (${step})`, error);
    if (critical) {
      setError(`App failed to start: ${message}`);
      void attemptStartupRecovery();
    }
    updateDebugHealth();
  }

  function runStartupStep(step, fn, critical = false) {
    window.__BATMAN_LAST_STARTUP_STEP = step;
    updateDebugHealth();
    try {
      fn();
      updateDebugHealth();
      return true;
    } catch (error) {
      reportStartupIssue(step, error, critical);
      return false;
    }
  }

  function bootstrap() {
    updateDebugHealth();
    runStartupStep("normalizeDomConflicts", normalizeDomConflicts, false);
    runStartupStep("applyBrand", applyBrand, false);

    if (!runStartupStep("render", render, true)) return;

    runStartupStep("bindUI", bindUI, false);
    runStartupStep("bindAdaptiveHeader", bindAdaptiveHeader, false);
    runStartupStep("startAutoSync", startAutoSync, false);
    runStartupStep("initPWA", initPWA, false);

    setTimeout(() => {
      void upgradeCoversFromDcui().catch((error) => {
        reportStartupIssue("upgradeCoversFromDcui", error, false);
      });
    }, 600);
  }

  bootstrap();
})();
