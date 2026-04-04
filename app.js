(() => {
  "use strict";

  const APP_VERSION = "2026.03.31-5";
  const BUILD_ID = `batman-guide-${APP_VERSION}`;
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
  const FILTER_INPUT_DEBOUNCE_MS = 120;
  const SYNC_REQUEST_TIMEOUT_MS = 9000;
  const FIXED_LOGO_URL = "./batman-logo.png";
  const FIXED_WORDMARK_URL = "./assets/lettering/batmanletters1.png";

  const $ = (id) => document.getElementById(id);

  const PROGRESS_UNIT_BY_TYPE = {
    book: "page",
    series: "issue",
    collection: "issue"
  };

  const PROGRESS_PLACEHOLDER_BY_UNIT = {
    page: "page",
    issue: "issue/story",
    chapter: "chapter",
    story: "story"
  };

  const PROGRESS_LABEL_BY_UNIT = {
    page: "page",
    issue: "issue/story",
    chapter: "chapter",
    story: "story"
  };

  const ITEM_STATUSES = ["unread", "in_progress", "read", "paused", "dropped"];
  const READ_STATUS = "read";
  const STATUS_META = {
    unread: { label: "Unread", short: "U" },
    in_progress: { label: "In progress", short: "IP" },
    read: { label: "Read", short: "R" },
    paused: { label: "Paused", short: "P" },
    dropped: { label: "Dropped", short: "D" }
  };

  const SEARCH_SYNONYMS = {
    bruce: "batman",
    wayne: "batman",
    brucewayne: "batman",
    damian: "robin",
    alfred: "batman",
    grayson: "nightwing",
    damianwayne: "robin",
    dick: "nightwing",
    dickgrayson: "nightwing",
    babs: "batgirl",
    barbara: "batgirl",
    gordon: "batgirl",
    barbaragordon: "batgirl",
    jason: "redhood",
    todd: "redhood",
    jasontodd: "redhood",
    selina: "catwoman",
    kyle: "catwoman",
    selinakyle: "catwoman",
    clark: "superman",
    kent: "superman",
    clarkkent: "superman"
  };

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
    sortBy: "order",
    track: "",
    status: "",
    character: "",
    era: ""
  });

  const ERA_OPTIONS = [...new Set(LIST.map((entry) => entry.era).filter(Boolean))];
  const SEARCH_BLOB_CACHE = new Map();
  const NORMALIZED_SEARCH_BLOB_CACHE = new Map();

  for (const entry of LIST) {
    const blob = entrySearchBlob(entry);
    SEARCH_BLOB_CACHE.set(entry.id, blob);
    NORMALIZED_SEARCH_BLOB_CACHE.set(entry.id, normalizeSearchBlob(blob));
  }


  const defaultUiPrefs = () => ({
    filtersOpen: false,
    advancedFiltersOpen: false,
    showCoverEditor: false
  });

  let runtimeUiPrefs = loadJSON(KEYS.uiPrefs, defaultUiPrefs());

  function readUiPrefs() {
    return Object.assign(defaultUiPrefs(), runtimeUiPrefs || {});
  }

  function writeUiPrefs(next) {
    runtimeUiPrefs = Object.assign(defaultUiPrefs(), readUiPrefs(), next || {});
    void saveJSON(KEYS.uiPrefs, runtimeUiPrefs);
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
      sortBy: $("sortBy").value || "order",
      track: $("trackFilter").value || "",
      status: $("statusFilter").value || "",
      character: $("characterFilter").value || "",
      era: $("eraFilter").value || ""
    });
  }

  function readFiltersFromURL() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const type = params.get("type") || "";
      const sortBy = params.get("sort") || "order";
      const track = params.get("track") || "";
      const status = params.get("status") || "";
      const character = params.get("character") || "";
      const era = params.get("era") || "";
      return {
        search: params.get("q") || "",
        type: ["", "book", "series", "collection"].includes(type) ? type : "",
        onlyRemaining: params.get("remaining") === "1",
        hideOptional: params.get("required") === "1",
        sortBy: ["order", "title", "progress", "recent"].includes(sortBy) ? sortBy : "order",
        track: ["", "main", "batfamily"].includes(track) ? track : "",
        status: ITEM_STATUSES.includes(status) ? status : "",
        character: character,
        era: ERA_OPTIONS.includes(era) ? era : ""
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
        sortBy: $("sortBy").value || "order",
        track: $("trackFilter").value || "",
        status: $("statusFilter").value || "",
        character: $("characterFilter").value || "",
        era: $("eraFilter").value || ""
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

      if (filters.track && filters.track !== defaults.track) next.set("track", filters.track);
      else next.delete("track");

      if (filters.status && filters.status !== defaults.status) next.set("status", filters.status);
      else next.delete("status");

      if (filters.character && filters.character !== defaults.character) next.set("character", filters.character);
      else next.delete("character");

      if (filters.era && filters.era !== defaults.era) next.set("era", filters.era);
      else next.delete("era");

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
  let gistETag = "";
  let sessionToken = "";
  let pullDelayMs = AUTO_PULL_BASE_INTERVAL_MS;
  let randomTargetId = "";
  let filterInputTimer = null;
  let activeCollectionModalId = "";
  let pendingPageSyncToast = null;
  let syncToastTimer = null;
  let focusCoverRenderToken = 0;
  let outsideCollapseBound = false;
  const coverCache = loadJSON(KEYS.coverCache, {});
  const fallbackCoverCache = loadJSON(KEYS.fallbackCoverCache, {});
  const coverFetchInFlight = new Map();
  const failedCoverCandidates = new Map();
  let debugModeCache = null;
  const perfStats = {
    filterAvgMs: 0,
    renderAvgMs: 0,
    filterSamples: 0,
    renderSamples: 0
  };

  function perfNow() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") return performance.now();
    return Date.now();
  }

  function recordPerf(metric, value) {
    if (!isDebugMode()) return;
    if (!Number.isFinite(value) || value < 0) return;
    if (metric === "filter") {
      perfStats.filterSamples += 1;
      const n = perfStats.filterSamples;
      perfStats.filterAvgMs += (value - perfStats.filterAvgMs) / n;
      return;
    }
    if (metric === "render") {
      perfStats.renderSamples += 1;
      const n = perfStats.renderSamples;
      perfStats.renderAvgMs += (value - perfStats.renderAvgMs) / n;
    }
  }

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

  function preferredProgressUnit(entry) {
    const explicit = String(entry?.progressUnit || "").trim().toLowerCase();
    if (explicit) return explicit;
    return PROGRESS_UNIT_BY_TYPE[entry?.type] || "page";
  }

  function normalizeProgressUnit(unit, entry) {
    const clean = String(unit || "").trim().toLowerCase();
    if (!clean) return preferredProgressUnit(entry);
    if (clean === "item") return preferredProgressUnit(entry);

    const aliases = {
      pages: "page",
      seite: "page",
      seiten: "page",
      issues: "issue",
      heft: "issue",
      hefte: "issue"
    };

    return aliases[clean] || clean;
  }

  function progressPlaceholder(unit) {
    const clean = String(unit || "").trim().toLowerCase();
    return PROGRESS_PLACEHOLDER_BY_UNIT[clean] || "position";
  }

  function progressUnitLabel(unit) {
    const clean = String(unit || "").trim().toLowerCase();
    return PROGRESS_LABEL_BY_UNIT[clean] || clean || "entry";
  }

  function progressUnit(st) {
    return normalizeProgressUnit(st?.unit || "", null);
  }

  function ensureItemState(entry) {
    if (!state.items[entry.id]) {
      state.items[entry.id] = {
        done: false,
        pos: "",
        note: "",
        unit: preferredProgressUnit(entry),
        touchedAt: null,
        issueStates: {}
      };
    } else {
      state.items[entry.id].unit = normalizeProgressUnit(state.items[entry.id].unit, entry);
      if (!state.items[entry.id].issueStates || typeof state.items[entry.id].issueStates !== "object") {
        state.items[entry.id].issueStates = {};
      }
    }
    const st = state.items[entry.id];
    const fallbackStatus = st.done ? READ_STATUS : "unread";
    st.status = ITEM_STATUSES.includes(st.status) ? st.status : fallbackStatus;
    st.done = st.status === READ_STATUS;
    state.items[entry.id] = st;
    return state.items[entry.id];
  }

  function ensureStatus(st) {
    const status = String(st?.status || "").trim().toLowerCase();
    if (ITEM_STATUSES.includes(status)) return status;
    return st?.done ? READ_STATUS : "unread";
  }

  function nextStatus(currentStatus, step = 1) {
    const current = ensureStatus({ status: currentStatus });
    const index = Math.max(0, ITEM_STATUSES.indexOf(current));
    const normalizedStep = step < 0 ? -1 : 1;
    const nextIndex = (index + normalizedStep + ITEM_STATUSES.length) % ITEM_STATUSES.length;
    return ITEM_STATUSES[nextIndex];
  }

  function normalizeSearchToken(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function expandSearchTerms(rawQuery) {
    const raw = String(rawQuery || "").trim().toLowerCase();
    if (!raw) return [];
    const parts = raw.split(/\s+/).filter(Boolean);
    const out = new Set();
    parts.forEach((part) => {
      const normalized = normalizeSearchToken(part);
      out.add(SEARCH_SYNONYMS[normalized] || part);
    });
    return [...out];
  }

  function entrySearchBlob(entry) {
    const issueTitles = Array.isArray(entry.issues) ? entry.issues.map((issue) => issue?.title || "").join(" ") : "";
    const chars = Array.isArray(entry.characters) ? entry.characters.join(" ") : "";
    return [
      entry.id,
      entry.title,
      entry.hint,
      entry.era,
      entry.type,
      entry.track,
      chars,
      issueTitles
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function normalizeSearchBlob(text) {
    return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ");
  }

  function collectionIssues(entry) {
    if (entry?.type !== "collection" || !Array.isArray(entry.issues)) return [];
    return entry.issues
      .filter((issue) => issue && typeof issue === "object")
      .map((issue) => {
        const title = String(issue.title || "").trim();
        if (!title) return null;
        const fallbackSearchUrl = `https://www.dcuniverseinfinite.com/search?text=${encodeURIComponent(title)}`;
        const url = safeExternalUrl(issue.url || fallbackSearchUrl);
        return { title, url };
      })
      .filter(Boolean);
  }

  function collectionIssueStats(entry, st = ensureItemState(entry)) {
    const issues = collectionIssues(entry);
    if (!issues.length) return { total: 0, done: 0, nextTitle: "" };
    const done = issues.filter((issue) => st.issueStates?.[issue.title] === true).length;
    const nextIssue = issues.find((issue) => st.issueStates?.[issue.title] !== true);
    return { total: issues.length, done, nextTitle: nextIssue?.title || "" };
  }

  function setModalOpen(el, open) {
    if (!el) return;
    el.classList.toggle("hidden", !open);
    document.body.classList.toggle("modal-open", !!open);
  }

  function activeCollectionEntry() {
    return LIST.find((entry) => entry.id === activeCollectionModalId) || null;
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

  const ERA_BAT_SYMBOLS = ["🦇 I", "🦇 II", "🦇 III", "🦇 IV", "🦇 V", "🦇 VI", "🦇 VII"];
  // Optional: set the 7 era symbol image URLs here (e.g. raw GitHub image links).
  // You can also override at runtime with: window.BATMAN_ERA_SYMBOLS = ["...", ...].
  const ERA_BAT_ICON_URLS = [
    "./assets/batsymbols/Era1.png",
    "./assets/batsymbols/Era2.png",
    "./assets/batsymbols/Era3.png",
    "./assets/batsymbols/Era4.png",
    "./assets/batsymbols/Era5.png",
    "./assets/batsymbols/Era6.png",
    "./assets/batsymbols/Era7.png"
  ];

  function eraNumber(era) {
    const m = String(era || "").match(/Era\s+(\d+)/i);
    if (!m) return 0;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : 0;
  }

  function eraBatSymbol(era) {
    const idx = eraNumber(era) - 1;
    return ERA_BAT_SYMBOLS[idx] || "🦇";
  }

  function eraBatIconUrl(era) {
    const idx = eraNumber(era) - 1;
    const fromWindow = Array.isArray(window.BATMAN_ERA_SYMBOLS) ? window.BATMAN_ERA_SYMBOLS[idx] : "";
    return String(fromWindow || ERA_BAT_ICON_URLS[idx] || "").trim();
  }

  function eraBatMarkup(era) {
    const symbol = eraBatSymbol(era);
    const iconUrl = eraBatIconUrl(era);
    if (!iconUrl) {
      return `<span class="era-bat era-bat-${Math.max(1, Math.min(eraNumber(era), 7))}" aria-hidden="true">${escapeHtml(symbol)}</span>`;
    }
    return `<span class="era-bat era-bat-${Math.max(1, Math.min(eraNumber(era), 7))} has-icon" data-fallback-symbol="${escapeAttr(symbol)}" aria-label="${escapeAttr(symbol)}"><img class="era-bat-icon" src="${escapeAttr(iconUrl)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;const host=this.parentElement;if(host){host.classList.remove('has-icon');host.setAttribute('aria-hidden','true');host.removeAttribute('aria-label');host.textContent=host.getAttribute('data-fallback-symbol')||'🦇';}" /></span>`;
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

  function showSyncToast(text, ms = 2200) {
    const el = $("syncToast");
    if (!el) return;
    if (syncToastTimer) {
      clearTimeout(syncToastTimer);
      syncToastTimer = null;
    }
    el.textContent = text;
    el.classList.add("show");
    syncToastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, Math.max(700, ms));
  }

  function rememberPageSyncToast(entry, st) {
    if (progressUnit(st) !== "page") return;
    const pos = String(st?.pos || "").trim();
    if (!pos) return;
    pendingPageSyncToast = {
      entryId: entry.id,
      pos,
      createdAt: Date.now()
    };
    showSyncToast(`Seite ${pos} gespeichert – wird synchronisiert …`, 1800);
  }

  function maybeShowPageSyncDone(result) {
    if (result !== "pushed" || !pendingPageSyncToast) return;
    if (Date.now() - pendingPageSyncToast.createdAt > 120000) {
      pendingPageSyncToast = null;
      return;
    }
    showSyncToast(`✓ Seite ${pendingPageSyncToast.pos} ist synchronisiert.`);
    pendingPageSyncToast = null;
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function applyBrand() {
    const heroLogo = $("heroLogo");
    if (heroLogo) heroLogo.src = FIXED_LOGO_URL;

    const heroWordmark = $("heroWordmark");
    if (heroWordmark && heroWordmark.getAttribute("src") !== FIXED_WORDMARK_URL) {
      heroWordmark.src = FIXED_WORDMARK_URL;
    }
  }

  function getFiltered() {
    const t0 = isDebugMode() ? perfNow() : 0;
    const q = $("search").value.trim().toLowerCase();
    const searchTerms = expandSearchTerms(q);
    const normalizedSearchTerms = searchTerms.map((term) => normalizeSearchBlob(term).trim());
    const type = $("typeFilter").value;
    const onlyRemaining = $("onlyRemaining").checked;
    const hideOptional = $("hideOptional").checked;
    const sortBy = $("sortBy").value;
    const track = $("trackFilter").value;
    const status = $("statusFilter").value;
    const character = $("characterFilter").value;
    const era = $("eraFilter").value;

    const filtered = LIST.filter((entry) => {
      const st = ensureItemState(entry);
      if (searchTerms.length) {
        const blob = SEARCH_BLOB_CACHE.get(entry.id) || entrySearchBlob(entry);
        const normalizedBlob = NORMALIZED_SEARCH_BLOB_CACHE.get(entry.id) || normalizeSearchBlob(blob);
        let matches = true;
        for (let i = 0; i < searchTerms.length; i += 1) {
          const term = searchTerms[i];
          const normalizedTerm = normalizedSearchTerms[i] || "";
          if (!blob.includes(term) && !(normalizedTerm && normalizedBlob.includes(normalizedTerm))) {
            matches = false;
            break;
          }
        }
        if (!matches) return false;
      }
      if (type && entry.type !== type) return false;
      if (onlyRemaining && st.done) return false;
      if (hideOptional && entry.optional) return false;
      if (track === "main" && entry.track === "batfamily") return false;
      if (track === "batfamily" && entry.track !== "batfamily") return false;
      if (status && ensureStatus(st) !== status) return false;
      if (era && entry.era !== era) return false;
      if (character) {
        const chars = Array.isArray(entry.characters) ? entry.characters : [];
        if (!chars.includes(character)) return false;
      }
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
    } else if (sortBy === "recent") {
      const baseOrder = new Map();
      for (let i = 0; i < LIST.length; i += 1) {
        baseOrder.set(LIST[i].id, i);
      }
      filtered.sort((a, b) => {
        const ta = Date.parse(ensureItemState(a).touchedAt || "") || 0;
        const tb = Date.parse(ensureItemState(b).touchedAt || "") || 0;
        if (ta !== tb) return tb - ta;
        return (baseOrder.get(a.id) || 0) - (baseOrder.get(b.id) || 0);
      });
    }

    if (t0) recordPerf("filter", perfNow() - t0);
    return filtered;
  }

  function activeFilterSummary() {
    const labels = [];
    const search = $("search")?.value.trim();
    if (search) labels.push(`Search: ${search}`);
    if ($("typeFilter")?.value) labels.push(`Type: ${$("typeFilter").value}`);
    if ($("onlyRemaining")?.checked) labels.push("Open only");
    if ($("hideOptional")?.checked) labels.push("Required only");
    if ($("trackFilter")?.value) labels.push(`Track: ${$("trackFilter").value}`);
    if ($("statusFilter")?.value) labels.push(`Status: ${$("statusFilter").value.replaceAll("_", " ")}`);
    if ($("characterFilter")?.value) labels.push(`Character: ${$("characterFilter").value}`);
    if ($("eraFilter")?.value) labels.push(`Era: ${$("eraFilter").value}`);
    if (($("sortBy")?.value || "order") !== "order") labels.push(`Sort: ${$("sortBy").value}`);

    if (!labels.length) return "";
    return `${labels.length} active filter${labels.length > 1 ? "s" : ""}: ${labels.join(" • ")}`;
  }

  function activeFilterCount() {
    let count = 0;
    if ($("search")?.value.trim()) count++;
    if ($("typeFilter")?.value) count++;
    if ($("onlyRemaining")?.checked) count++;
    if ($("hideOptional")?.checked) count++;
    if ($("trackFilter")?.value) count++;
    if ($("statusFilter")?.value) count++;
    if ($("characterFilter")?.value) count++;
    if ($("eraFilter")?.value) count++;
    if (($("sortBy")?.value || "order") !== "order") count++;
    return count;
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
    setText("nextText", `Next: ${next ? next.title : "All done"}`);

    const cont = continueEntry(filtered);
    const focusTitle = $("focusTitle");
    const focusMeta = $("focusMeta");
    const focusOpen = $("btnOpenFocus");
    const focusCover = $("focusCover");
    if (!cont) {
      if (focusTitle) focusTitle.textContent = "Everything in this view is complete";
      if (focusMeta) focusMeta.textContent = "Try clearing filters or jump to a different era.";
      if (focusCover) {
        focusCover.className = "focus-cover fallback-logo";
        focusCover.innerHTML = entryLogoFallback({ title: "Batman Guide", type: "book" });
      }
      if (focusOpen) {
        focusOpen.setAttribute("href", "about:blank");
        focusOpen.setAttribute("aria-disabled", "true");
      }
    } else {
      const st = ensureItemState(cont);
      const continueStats = collectionIssueStats(cont, st);
      const where = st.pos ? `${st.pos} ${st.unit}` : "";
      const issueProgress = continueStats.total ? `${continueStats.done}/${continueStats.total} issues` : "";
      if (focusTitle) focusTitle.textContent = cont.title;
      if (focusMeta) {
        const parts = [];
        if (cont.era) parts.push(cont.era);
        if (where) parts.push(where);
        else if (continueStats.nextTitle) parts.push(`Next issue: ${continueStats.nextTitle}`);
        else if (issueProgress) parts.push(issueProgress);
        if (st.note) parts.push(`Note: ${st.note}`);
        focusMeta.textContent = parts.length ? parts.join(" • ") : "Ready to resume.";
      }
      if (focusOpen) {
        focusOpen.setAttribute("href", safeExternalUrl(cont.url));
        focusOpen.setAttribute("aria-disabled", "false");
      }
      if (focusCover) {
        focusCover.className = "focus-cover";
        const token = ++focusCoverRenderToken;
        void applyBestCover(focusCover, cont).then(() => {
          if (token !== focusCoverRenderToken) return;
          focusCover.setAttribute("data-entry-id", cont.id);
        });
      }
    }

    const randomEntry = randomTargetId ? filtered.find((e) => e.id === randomTargetId) : null;
    setText("randomText", `Random: ${randomEntry ? randomEntry.title : "-"}`);

    const requiredRemaining = filtered.filter((entry) => !entry.optional && !ensureItemState(entry).done).length;
    setText("statVisible", String(s.total));
    setText("statDone", String(s.done));
    setText("statRemaining", String(Math.max(0, s.total - s.done)));
    setText("statRequired", String(requiredRemaining));
    setText("heroVisible", String(s.total));
    setText("heroDone", String(s.done));
    setText("heroLeft", String(Math.max(0, s.total - s.done)));
    setText("modalFooterStatus", `Visible: ${s.total} • Left: ${Math.max(0, s.total - s.done)} • Required left: ${requiredRemaining}`);
    setText("filterSummary", activeFilterSummary());
    const activeCount = activeFilterCount();
    setText("headerActionsHint", activeCount > 0 ? `${activeCount} filters active` : "");
    const filterButton = $("btnFilterMenu");
    const filtersDialogOpen = !$("headerControls")?.classList.contains("hidden");
    if (filterButton) {
      filterButton.textContent = filtersDialogOpen ? "Close actions" : (activeCount > 0 ? `Actions (${activeCount})` : "Actions");
    }
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

  function setManualCoverUrl(entryId, url, options = {}) {
    if (!entryId) return "";
    const { markDirty = true } = options;
    const next = sanitizeManualCoverUrl(url);
    const prev = getManualCoverUrl(entryId);

    if (!next) {
      if (!prev) return "";
      delete customCovers[entryId];
      void saveJSON(KEYS.customCovers, customCovers);
      if (markDirty) {
        dirty = true;
        scheduleAutoPush();
      }
      return "";
    }

    if (prev === next) return next;

    customCovers[entryId] = next;
    void saveJSON(KEYS.customCovers, customCovers);
    if (markDirty) {
      dirty = true;
      scheduleAutoPush();
    }
    return next;
  }

  function hasSavedManualCover(entryId) {
    return !!getManualCoverUrl(entryId);
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
    const t0 = isDebugMode() ? perfNow() : 0;
    setError("");
    const uiPrefs = readUiPrefs();
    const showCoverEditor = !!uiPrefs.showCoverEditor;
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

    const rootFrag = document.createDocumentFragment();
    for (const [era, items] of byEra.entries()) {
      const details = document.createElement("details");
      details.className = "era";
      const key = eraKey(era);
      details.dataset.eraKey = key;
      details.open = openMap[key] !== false;

      let done = 0;
      for (const it of items) {
        if (ensureItemState(it).done) done += 1;
      }
      const pct = Math.round((done / items.length) * 100);

      const summary = document.createElement("summary");
      summary.innerHTML = `
        <span class="era-summary-title">
          ${eraBatMarkup(era)}
          <span>${escapeHtml(era)}</span>
        </span>
        <span class="muted">${done}/${items.length} (${pct}%)</span>
      `;
      details.appendChild(summary);

      const list = document.createElement("div");
      list.className = "items";

      const populateEraList = () => {
        if (list.dataset.populated === "1") return;
        list.dataset.populated = "1";
        list.dataset.deferred = "0";
        list.innerHTML = "";

        for (const entry of items) {
          const st = ensureItemState(entry);

          const item = document.createElement("div");
          const isContinueTarget = continueId && entry.id === continueId;
          const isRandomTarget = randomTargetId && entry.id === randomTargetId;
          const hasSavedCover = hasSavedManualCover(entry.id);
          item.className = `item${st.done ? " done" : ""}${isContinueTarget ? " continue-target" : ""}${isRandomTarget ? " random-target" : ""}${showCoverEditor && hasSavedCover ? " cover-saved" : ""}`;
          item.dataset.id = entry.id;

          const cover = document.createElement("div");
          cover.className = "cover";
          cover.style.background = coverGradient(entry);
          cover.innerHTML = entryCoverFallback(entry);
          const coverStatusBadge = document.createElement("span");
          coverStatusBadge.className = "cover-status-badge";
          coverStatusBadge.textContent = STATUS_META[ensureStatus(st)]?.label || "Unread";
          const coverIdBadge = document.createElement("span");
          coverIdBadge.className = "cover-id-badge";
          coverIdBadge.textContent = entry.id;
          void applyBestCover(cover, entry).finally(() => {
            cover.append(coverStatusBadge, coverIdBadge);
          });

          const content = document.createElement("div");
          content.className = "item-content";

          const top = document.createElement("div");
          top.className = "item-head";
          const safeTitle = escapeHtml(entry.title);
          const safeHint = entry.hint ? escapeHtml(entry.hint) : "";
          const safeUrl = escapeAttr(safeExternalUrl(entry.url));
          const entryIssueStats = collectionIssueStats(entry, st);
          const hasProgress = Boolean((st.pos || "").trim() || (st.note || "").trim() || ensureStatus(st) !== "unread" || st.done);
          if (hasProgress) item.classList.add("expanded");
          const coverLink = document.createElement("a");
          coverLink.className = "cover-link";
          coverLink.href = safeUrl;
          coverLink.target = "_blank";
          coverLink.rel = "noopener noreferrer";
          coverLink.textContent = "DCUI";
          const coverTitle = document.createElement("span");
          coverTitle.className = "cover-title";
          coverTitle.innerHTML = safeTitle;
          cover.append(coverLink, coverTitle);
          top.innerHTML = `
            <div class="item-actions">
              ${entryIssueStats.total ? '<button class="btn" type="button" data-action="open-issues">Issues</button>' : ""}
              <button class="btn subtle item-close" type="button" data-action="collapse" aria-label="Close details">×</button>
            </div>
          `;

          const tags = document.createElement("div");
          tags.className = "tags";
          tags.innerHTML = `
            <span class="tag">${escapeHtml(entry.type)}</span>
            <span class="tag">${entry.optional ? "optional" : "required"}</span>
            ${entryIssueStats.total ? `<span class="tag">${entryIssueStats.done}/${entryIssueStats.total} issues</span>` : ""}
            ${isContinueTarget ? "<span class=\"tag continue-tag\">continue</span>" : ""}
            ${isRandomTarget ? "<span class=\"tag random-tag\">random pick</span>" : ""}
            <span class="muted">${escapeHtml(entry.id)}</span>
          `;

          const progress = document.createElement("div");
          progress.className = "progress-fields";
          progress.innerHTML = `
            <div class="progress-pos-group">
              <div class="progress-pos-meta">
                <span class="muted">${entry.type === "collection" ? "Current arc / issue" : "Where you stopped"}</span>
                <span class="progress-unit-pill">${escapeHtml(progressUnitLabel(st.unit))}</span>
              </div>
              <input class="input" data-action="pos" placeholder="${escapeAttr(entry.type === "collection" ? "issue / arc" : progressPlaceholder(st.unit))}" value="${escapeAttr(st.pos || "")}" />
            </div>
            <label class="progress-note-group progress-status-group">
              <span class="muted progress-note-label">Status</span>
              <button
                class="status-cycle status-${ensureStatus(st)}"
                data-action="status-cycle"
                data-status="${ensureStatus(st)}"
                type="button"
                title="Click to cycle status • Shift+Click for previous"
                aria-label="Reading status: ${escapeAttr(STATUS_META[ensureStatus(st)]?.label || "Unread")}"
              >
                <span class="status-cycle-short">${escapeHtml(STATUS_META[ensureStatus(st)]?.short || "U")}</span>
                <span class="status-cycle-label">${escapeHtml(STATUS_META[ensureStatus(st)]?.label || "Unread")}</span>
              </button>
            </label>
          `;

          const shouldShowEditor = showCoverEditor;
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

          top.querySelector('[data-action="open-issues"]')?.addEventListener("click", () => {
            openCollectionModal(entry.id);
          });

          top.querySelector('[data-action="collapse"]')?.addEventListener("click", () => {
            item.classList.remove("expanded");
            item.setAttribute("aria-expanded", "false");
          });

          const posInput = progress.querySelector('[data-action="pos"]');
          const persistPos = (value, { immediate = false } = {}) => {
            const nextPos = String(value || "").trim();
            if (st.pos === nextPos && !immediate) return;
            st.pos = nextPos;
            st.touchedAt = nowISO();
            state.lastTouchedId = entry.id;
            rememberPageSyncToast(entry, st);
            saveState();
            refreshHeader(filtered);
          };

          posInput.addEventListener("input", (e) => {
            persistPos(e.target.value);
          });

          posInput.addEventListener("change", (e) => {
            persistPos(e.target.value, { immediate: true });
          });

          progress.querySelector('[data-action="status-cycle"]').addEventListener("click", (e) => {
            const cycleButton = e.currentTarget;
            const direction = e.shiftKey ? -1 : 1;
            const currentStatus = ensureStatus(st);
            const resolvedNextStatus = nextStatus(currentStatus, direction);
            st.status = resolvedNextStatus;
            st.done = resolvedNextStatus === READ_STATUS;
            cycleButton.dataset.status = resolvedNextStatus;
            cycleButton.className = `status-cycle status-${resolvedNextStatus}`;
            cycleButton.setAttribute("aria-label", `Reading status: ${STATUS_META[resolvedNextStatus]?.label || "Unread"}`);
            const shortNode = cycleButton.querySelector(".status-cycle-short");
            const labelNode = cycleButton.querySelector(".status-cycle-label");
            if (shortNode) shortNode.textContent = STATUS_META[resolvedNextStatus]?.short || "U";
            if (labelNode) labelNode.textContent = STATUS_META[resolvedNextStatus]?.label || "Unread";
            if (coverStatusBadge) coverStatusBadge.textContent = STATUS_META[resolvedNextStatus]?.label || "Unread";
            st.touchedAt = nowISO();
            state.lastTouchedId = entry.id;
            saveState();
            refreshHeader(filtered);
          });

          if (manualCover) {
            const coverInput = manualCover.querySelector('[data-action="cover-url"]');
            const saveCoverBtn = manualCover.querySelector('[data-action="save-cover"]');
            const clearCoverBtn = manualCover.querySelector('[data-action="clear-cover"]');

            saveCoverBtn.addEventListener("click", async () => {
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
              const pushed = await pushCoversToGitHub();
              if (!pushed) setSyncStatus(`Saved manual cover locally for ${entry.id}.`);
            });

            clearCoverBtn.addEventListener("click", async () => {
              setManualCoverUrl(entry.id, "");
              failedCoverCandidates.delete(entry.id);
              st.touchedAt = nowISO();
              state.lastTouchedId = entry.id;
              saveState();
              render();
              const pushed = await pushCoversToGitHub();
              if (!pushed) setSyncStatus(`Cleared manual cover locally for ${entry.id}.`);
            });
          }

          content.append(top, tags, progress);
          if (manualCover) content.append(manualCover);

          const layout = document.createElement("div");
          layout.className = "item-grid";
          layout.append(cover, content);
          item.setAttribute("aria-expanded", item.classList.contains("expanded") ? "true" : "false");
          item.addEventListener("click", (e) => {
            if (e.target.closest("a, button, input, textarea, select, label")) return;
            item.classList.toggle("expanded");
            item.setAttribute("aria-expanded", item.classList.contains("expanded") ? "true" : "false");
          });

          item.appendChild(layout);
          list.appendChild(item);
        }
      };

      details.addEventListener("toggle", () => {
        const current = loadOpenState();
        current[key] = details.open;
        saveOpenState(current);
        if (details.open) populateEraList();
      });

      if (!details.open) {
        list.dataset.deferred = "1";
        list.innerHTML = '<div class="muted">Expand to load entries.</div>';
      } else {
        populateEraList();
      }

      details.appendChild(list);
      rootFrag.appendChild(details);
    }
    root.appendChild(rootFrag);
    bindOutsideCollapse();

    refreshHeader(filtered);
    window.__BATMAN_APP_READY = true;
    if (t0) recordPerf("render", perfNow() - t0);
    updateDebugHealth();
  }

  function bindOutsideCollapse() {
    if (outsideCollapseBound) return;
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.closest && target.closest(".item")) return;
      document.querySelectorAll(".item.expanded").forEach((node) => {
        node.classList.remove("expanded");
        node.setAttribute("aria-expanded", "false");
      });
    });
    outsideCollapseBound = true;
  }

  function persistCollectionState(entry, st) {
    const updated = collectionIssueStats(entry, st);
    if (updated.total && updated.done === updated.total) {
      st.done = true;
      st.status = READ_STATUS;
    } else if (updated.done < updated.total) {
      st.done = false;
      st.status = "in_progress";
    }
    st.touchedAt = nowISO();
    state.lastTouchedId = entry.id;
    saveState();
    render();
  }

  function closeCollectionModal() {
    activeCollectionModalId = "";
    setModalOpen($("collectionModal"), false);
  }

  function renderCollectionModal(entry) {
    const st = ensureItemState(entry);
    const issues = collectionIssues(entry);
    const progress = collectionIssueStats(entry, st);
    setText("collectionModalTitle", entry.title);
    setText("collectionModalStatus", progress.nextTitle ? `Next issue: ${progress.nextTitle} • ${progress.done}/${progress.total} read` : `${progress.done}/${progress.total} read`);

    const list = $("collectionModalList");
    if (!list) return;
    list.innerHTML = "";
    issues.forEach((issue) => {
      const li = document.createElement("li");
      const checked = st.issueStates?.[issue.title] === true;
      const isSearch = /\/search\?/i.test(issue.url);
      const label = isSearch ? `${issue.title} (search)` : issue.title;
      li.innerHTML = `
        <label class="row" style="justify-content:space-between; gap:10px; width:100%;">
          <span class="row" style="gap:10px; min-width:0;">
            <input type="checkbox" data-action="issue-done" ${checked ? "checked" : ""} />
            <span>${escapeHtml(label)}</span>
          </span>
          <a href="${escapeAttr(issue.url)}" target="_blank" rel="noopener noreferrer">Open</a>
        </label>
      `;
      li.querySelector('[data-action="issue-done"]').addEventListener("change", (e) => {
        st.issueStates[issue.title] = !!e.target.checked;
        persistCollectionState(entry, st);
        renderCollectionModal(entry);
      });
      list.appendChild(li);
    });
  }

  function openCollectionModal(entryId) {
    const entry = LIST.find((item) => item.id === entryId);
    if (!entry) return;
    activeCollectionModalId = entryId;
    renderCollectionModal(entry);
    setModalOpen($("collectionModal"), true);
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

  function importPayload(text, options = {}) {
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
        setManualCoverUrl(entryId, url, options);
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
  const PUBLIC_COVERS_FILE = "batmanguide_covers.json";

  function exportCustomCoversPayload() {
    return JSON.stringify({
      app: "Batman Guide",
      version: 1,
      updatedAt: nowISO(),
      customCovers
    }, null, 2);
  }

  function importCustomCoversPayload(text, options = {}) {
    try {
      const payload = JSON.parse(String(text || ""));
      const covers = payload?.customCovers && typeof payload.customCovers === "object"
        ? payload.customCovers
        : {};
      for (const [entryId, url] of Object.entries(covers)) {
        setManualCoverUrl(entryId, url, options);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, err: e.message || "Parse error" };
    }
  }

  function gistHeaders(cfg, opts = {}) {
    const headers = {
      Accept: "application/vnd.github+json"
    };
    const token = getEffectiveToken(cfg);
    if (token) headers.Authorization = `Bearer ${token}`;
    if (opts.requireToken && !token) throw new Error("GitHub token required for this action.");
    return headers;
  }

  async function gistFetch(cfg, opts = {}) {
    const headers = gistHeaders(cfg);
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
        headers: gistHeaders(cfg)
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
        headers: gistHeaders(cfg)
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
      headers: Object.assign({
        "Content-Type": "application/json"
      }, gistHeaders(cfg, { requireToken: true })),
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const msg = await r.text().catch(() => "");
      throw new Error(`Push failed (${r.status}) ${msg.slice(0, 200)}`);
    }
    dirty = false;
    setSyncStatus("Push complete.");
  }

  async function pushCoversToGitHub() {
    const cfg = withRuntimeToken(getCfg());
    if (!(cfg?.gistId || "").trim()) {
      setSyncStatus("Saving to GitHub requires a Gist ID + token.");
      return false;
    }
    try {
      const body = {
        files: {
          [GIST_COVERS_FILE]: {
            content: exportCustomCoversPayload()
          }
        }
      };
      const r = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
        method: "PATCH",
        headers: Object.assign({
          "Content-Type": "application/json"
        }, gistHeaders(cfg, { requireToken: true })),
        body: JSON.stringify(body)
      });
      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        throw new Error(`Cover push failed (${r.status}) ${msg.slice(0, 200)}`);
      }
      setSyncStatus("Cover saved to GitHub.");
      return true;
    } catch (e) {
      setSyncStatus(`GitHub save failed: ${String(e.message || e)}`);
      return false;
    }
  }

  async function pullCoversFromPublicSource() {
    try {
      const r = await fetch(PUBLIC_COVERS_FILE, { cache: "no-store" });
      if (!r.ok) return false;
      const text = await r.text();
      const imported = importCustomCoversPayload(text, { markDirty: false });
      if (!imported.ok) throw new Error(imported.err);
      render();
      setSyncStatus("Covers loaded from GitHub source.");
      return true;
    } catch {
      return false;
    }
  }

  async function pullCoversFromGitHub() {
    const cfg = withRuntimeToken(getCfg());
    if (!(cfg?.gistId || "").trim()) return pullCoversFromPublicSource();
    try {
      const coverPayload = await gistGetTextFromFile(cfg, GIST_COVERS_FILE);
      if (!coverPayload.found) {
        setSyncStatus("No cover file found on GitHub gist yet.");
        return false;
      }
      const imported = importCustomCoversPayload(coverPayload.text, { markDirty: false });
      if (!imported.ok) throw new Error(imported.err);
      render();
      setSyncStatus("Covers loaded from GitHub.");
      return true;
    } catch (e) {
      const fallback = await pullCoversFromPublicSource();
      if (!fallback) setSyncStatus(`GitHub cover load failed: ${String(e.message || e)}`);
      return fallback;
    }
  }

  function parseDate(value) {
    const t = Date.parse(value || "");
    return Number.isFinite(t) ? t : 0;
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
      const imported = importPayload(remoteText, { markDirty: false });
      if (!imported.ok) throw new Error(imported.err);
      try {
        const coverPayload = await gistGetTextFromFile(cfg, GIST_COVERS_FILE);
        if (coverPayload.found) {
          const importedCovers = importCustomCoversPayload(coverPayload.text, { markDirty: false });
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
        maybeShowPageSyncDone("pushed");
      } else {
        const result = await gistSync(cfg);
        maybeShowPageSyncDone(result);
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

  function bindAdaptiveHeader() {
    const header = document.querySelector(".top");
    const controls = $("headerControls");
    const filterToggle = $("btnFilterMenu");
    if (!header || !controls || !filterToggle) return;
    let userWantsFiltersOpen = !!readUiPrefs().filtersOpen;

    const syncFilterToggle = () => {
      const open = !controls.classList.contains("hidden");
      const count = activeFilterCount();
      filterToggle.setAttribute("aria-expanded", String(open));
      if (open) filterToggle.textContent = "Close actions";
      else filterToggle.textContent = count > 0 ? `Actions (${count})` : "Actions";
    };

    const setFiltersOpen = (open, persist = true) => {
      setModalOpen(controls, open);
      syncFilterToggle();
      if (!persist) return;
      userWantsFiltersOpen = !!open;
      writeUiPrefs({ filtersOpen: userWantsFiltersOpen });
    };

    const syncStickySearchOffset = () => {
      const rect = header.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, header.offsetHeight || 0));
      document.documentElement.style.setProperty("--sticky-search-top", `${Math.round(visible)}px`);
    };

    filterToggle.addEventListener("click", () => {
      const opening = controls.classList.contains("hidden");
      setFiltersOpen(opening);
      if (opening) {
        controls.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    const updateCompactMode = () => {
      const y = window.scrollY;
      const shouldCompact = y > 24 || window.innerHeight < 860;

      header.classList.toggle("compact", shouldCompact);
      syncStickySearchOffset();
    };

    let raf = 0;
    const queueUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateCompactMode();
      });
    };

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    setFiltersOpen(userWantsFiltersOpen, false);
    updateCompactMode();
    syncStickySearchOffset();
  }


  function isDebugMode() {
    if (debugModeCache !== null) return debugModeCache;
    try {
      const q = new URLSearchParams(window.location.search || "");
      debugModeCache = q.get("debug") === "1" || localStorage.getItem("batman-guide:debug") === "1";
      return debugModeCache;
    } catch {
      debugModeCache = false;
      return debugModeCache;
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
    const filterAvg = perfStats.filterSamples ? `${perfStats.filterAvgMs.toFixed(1)}ms` : "-";
    const renderAvg = perfStats.renderSamples ? `${perfStats.renderAvgMs.toFixed(1)}ms` : "-";
    box.innerHTML = `<strong>Debug health</strong> · ready: ${ready} · startup: ${escapeHtml(lastStep)} · ui: ${escapeHtml(lastUiStep)} · error: ${escapeHtml(err)} · avg(filter): ${filterAvg} · avg(render): ${renderAvg}`;
  }

  function populateEraFilter() {
    const select = $("eraFilter");
    if (!select) return;
    const selected = select.value || "";
    select.innerHTML = '<option value="">All eras</option>';
    for (const era of ERA_OPTIONS) {
      const opt = document.createElement("option");
      opt.value = era;
      opt.textContent = era;
      select.appendChild(opt);
    }
    select.value = ERA_OPTIONS.includes(selected) ? selected : "";
  }

  function syncQuickFilterChips() {
    const chipOpen = $("chipOpen");
    const chipRequired = $("chipRequired");
    const chipBook = $("chipBook");
    const chipFamily = $("chipFamily");
    if (chipOpen) chipOpen.classList.toggle("active", $("onlyRemaining").checked);
    if (chipRequired) chipRequired.classList.toggle("active", $("hideOptional").checked);
    if (chipBook) chipBook.classList.toggle("active", $("typeFilter").value === "book");
    if (chipFamily) chipFamily.classList.toggle("active", $("trackFilter").value === "batfamily");
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
      populateEraFilter();
      const savedFilters = readFilters();
      const urlFilters = readFiltersFromURL();
      const params = new URLSearchParams(window.location.search || "");
      const hasURLFilters = ["q", "type", "remaining", "required", "sort", "track", "status", "character", "era"].some((key) => params.has(key));
      const activeFilters = hasURLFilters ? Object.assign(savedFilters, urlFilters) : savedFilters;

      $("search").value = activeFilters.search || "";
      $("typeFilter").value = activeFilters.type || "";
      $("onlyRemaining").checked = !!activeFilters.onlyRemaining;
      $("hideOptional").checked = !!activeFilters.hideOptional;
      $("sortBy").value = activeFilters.sortBy || "order";
      $("trackFilter").value = activeFilters.track || "";
      $("statusFilter").value = activeFilters.status || "";
      $("characterFilter").value = activeFilters.character || "";
      $("eraFilter").value = ERA_OPTIONS.includes(activeFilters.era) ? activeFilters.era : "";
      syncQuickFilterChips();
      writeFilters();
      writeFiltersToURL();
    });

    runUIStep("coverEditorPrefs", () => {
      const prefs = readUiPrefs();
      const showToggle = $("showCoverEditor");
      if (showToggle) showToggle.checked = !!prefs.showCoverEditor;

      if (showToggle) {
        const onCoverToggle = () => {
          writeUiPrefs({ showCoverEditor: !!showToggle.checked });
          render();
        };
        showToggle.addEventListener("change", onCoverToggle);
        showToggle.addEventListener("input", onCoverToggle);
      }
    });

    runUIStep("advancedFilterPrefs", () => {
      const panel = $("advancedFiltersPanel");
      if (!panel) return;
      const prefs = readUiPrefs();
      const hasAdvancedFilters = !!($("trackFilter").value || $("statusFilter").value || $("characterFilter").value || $("eraFilter").value || ($("sortBy").value || "order") !== "order");
      panel.open = hasAdvancedFilters || !!prefs.advancedFiltersOpen;
      panel.addEventListener("toggle", () => {
        writeUiPrefs({ advancedFiltersOpen: panel.open });
      });
    });

    runUIStep("filterInputs", () => {
      const applyFilterInput = ({ debounce = false } = {}) => {
        writeFilters();
        writeFiltersToURL();
        syncQuickFilterChips();
        if (debounce) {
          if (filterInputTimer) clearTimeout(filterInputTimer);
          filterInputTimer = setTimeout(() => {
            filterInputTimer = null;
            render();
            syncEraToggleButton();
          }, FILTER_INPUT_DEBOUNCE_MS);
          return;
        }
        if (filterInputTimer) {
          clearTimeout(filterInputTimer);
          filterInputTimer = null;
        }
        render();
        syncEraToggleButton();
      };

      for (const id of ["search", "typeFilter", "onlyRemaining", "hideOptional", "sortBy", "trackFilter", "statusFilter", "characterFilter", "eraFilter"]) {
        const el = $(id);
        const shouldDebounce = id === "search";
        el.addEventListener("input", () => {
          applyFilterInput({ debounce: shouldDebounce });
        });
        el.addEventListener("change", () => {
          applyFilterInput({ debounce: false });
        });
      }
    });

    runUIStep("filterPresets", () => {
      const wrap = $("filterPresets");
      if (!wrap) return;
      wrap.querySelectorAll("[data-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const preset = btn.getAttribute("data-preset");
          if (preset === "resume") {
            $("onlyRemaining").checked = true;
            $("hideOptional").checked = false;
            $("typeFilter").value = "";
            $("trackFilter").value = "";
            $("statusFilter").value = "";
            $("characterFilter").value = "";
            $("eraFilter").value = "";
            $("sortBy").value = "recent";
          } else if (preset === "mainline") {
            $("onlyRemaining").checked = true;
            $("hideOptional").checked = true;
            $("typeFilter").value = "";
            $("trackFilter").value = "main";
            $("statusFilter").value = "";
            $("characterFilter").value = "";
            $("eraFilter").value = "";
            $("sortBy").value = "order";
          } else {
            $("search").value = "";
            $("onlyRemaining").checked = false;
            $("hideOptional").checked = false;
            $("typeFilter").value = "";
            $("trackFilter").value = "";
            $("statusFilter").value = "";
            $("characterFilter").value = "";
            $("eraFilter").value = "";
            $("sortBy").value = "order";
          }
          writeFilters();
          writeFiltersToURL();
          syncQuickFilterChips();
          render();
          syncEraToggleButton();
        });
      });
    });

    runUIStep("quickFilterChips", () => {
      const chipOpen = $("chipOpen");
      const chipRequired = $("chipRequired");
      const chipBook = $("chipBook");
      const chipFamily = $("chipFamily");
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
      if (chipFamily) {
        chipFamily.addEventListener("click", () => {
          $("trackFilter").value = $("trackFilter").value === "batfamily" ? "" : "batfamily";
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
      const clearFilters = () => {
        $("search").value = "";
        $("typeFilter").value = "";
        $("onlyRemaining").checked = false;
        $("hideOptional").checked = false;
        $("sortBy").value = "order";
        $("trackFilter").value = "";
        $("statusFilter").value = "";
        $("characterFilter").value = "";
        $("eraFilter").value = "";
        writeFilters();
        writeFiltersToURL();
        syncQuickFilterChips();
        render();
        syncEraToggleButton();
      };
      $("btnClearFilters").addEventListener("click", clearFilters);
      $("btnFooterClearFilters")?.addEventListener("click", clearFilters);
    });
    runUIStep("quickNav", () => {
      const performNavAction = (action) => {
        if (action === "next") {
          const next = nextUnread(getFiltered());
          if (next) scrollToEntry(next.id);
          return;
        }
        if (action === "random") {
          const random = randomUnread(getFiltered());
          if (!random) return;
          randomTargetId = random.id;
          render();
          scrollToEntry(random.id);
          return;
        }
        if (action === "continue") {
          const c = continueEntry(getFiltered());
          if (c) scrollToEntry(c.id);
        }
      };

      document.querySelectorAll("[data-nav-action]").forEach((button) => {
        button.addEventListener("click", () => performNavAction(button.dataset.navAction || ""));
      });

      const scrollTopBtn = $("btnScrollTop");
      const syncScrollTopVisibility = () => {
        if (!scrollTopBtn) return;
        scrollTopBtn.classList.toggle("hidden", window.scrollY <= 480);
      };
      scrollTopBtn?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      window.addEventListener("scroll", syncScrollTopVisibility, { passive: true });
      syncScrollTopVisibility();
    });

    runUIStep("shareView", () => {
      $("btnCopyView")?.addEventListener("click", async () => {
        const url = window.location.href;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            input.remove();
          }
          setSyncStatus("Current view link copied.");
        } catch {
          setSyncStatus("Could not copy the current view link.");
        }
      });
    });

	    runUIStep("modalControls", () => {
	      $("btnCloseFilters")?.addEventListener("click", () => {
	        setModalOpen($("headerControls"), false);
	        writeUiPrefs({ filtersOpen: false });
	        $("btnFilterMenu")?.setAttribute("aria-expanded", "false");
	        const activeCount = activeFilterCount();
	        if ($("btnFilterMenu")) $("btnFilterMenu").textContent = activeCount > 0 ? `Actions (${activeCount})` : "Actions";
	      });
      $("btnDoneFilters")?.addEventListener("click", () => {
        $("btnCloseFilters")?.click();
      });

      $("headerControls")?.addEventListener("click", (e) => {
        if (e.target === $("headerControls")) $("btnCloseFilters")?.click();
      });

      $("btnCloseCollectionModal")?.addEventListener("click", closeCollectionModal);
      $("collectionModal")?.addEventListener("click", (e) => {
        if (e.target === $("collectionModal")) closeCollectionModal();
      });

      $("btnCollectionMarkAll")?.addEventListener("click", () => {
        const entry = activeCollectionEntry();
        if (!entry) return;
        const st = ensureItemState(entry);
        collectionIssues(entry).forEach((issue) => {
          st.issueStates[issue.title] = true;
        });
        persistCollectionState(entry, st);
        renderCollectionModal(entry);
      });

      $("btnCollectionClear")?.addEventListener("click", () => {
        const entry = activeCollectionEntry();
        if (!entry) return;
        const st = ensureItemState(entry);
        collectionIssues(entry).forEach((issue) => {
          delete st.issueStates[issue.title];
        });
        persistCollectionState(entry, st);
        renderCollectionModal(entry);
      });

      window.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (!$("collectionModal")?.classList.contains("hidden")) {
          closeCollectionModal();
          return;
        }
        if (!$("headerControls")?.classList.contains("hidden")) {
          $("btnCloseFilters")?.click();
        }
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
        void pullCoversFromGitHub();
        if (!syncReady(nextCfg)) {
          setSyncStatus("Covers load automatically from GitHub source. Gist ID + token are only needed to save updates.");
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
      const dispatchNavAction = (action) => {
        const button = document.querySelector(`[data-nav-action="${action}"]`);
        if (button) button.click();
      };

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
          dispatchNavAction("random");
          return;
        }

        if ((e.key === "c" || e.key === "C") && !e.metaKey && !e.ctrlKey && !e.altKey) {
          if (isTyping) return;
          e.preventDefault();
          dispatchNavAction("continue");
          return;
        }

        if ((e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey && !e.altKey) {
          if (isTyping) return;
          e.preventDefault();
          dispatchNavAction("next");
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
      "chipOpen", "chipRequired", "chipBook", "chipFamily", "trackFilter", "characterFilter",
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

    const legacyHeaderBadges = document.querySelectorAll(".hero-partners, .hero-logos, .logo-chip, .dcui-mark");
    legacyHeaderBadges.forEach((node) => node.remove());
  }



  function applyBuildVersion() {
    const text = `Build ${APP_VERSION}`;
    const statusText = `Build ${APP_VERSION} • ready`;
    const inline = $("buildVersion");
    if (inline) inline.textContent = text;
    const sync = $("buildVersionSync");
    if (sync) sync.textContent = statusText;
  }

  function initPWA() {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
      .then((registration) => {
        const promoteUpdate = () => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        };

        if (registration.waiting) promoteUpdate();

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed") promoteUpdate();
          });
        });

        setInterval(() => {
          registration.update().catch(() => {});
        }, 60_000);
      })
      .catch(() => {});
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
    runStartupStep("applyBuildVersion", applyBuildVersion, false);

    if (!runStartupStep("render", render, true)) return;

    runStartupStep("bindUI", bindUI, false);
    setTimeout(() => { void pullCoversFromGitHub(); }, 120);
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
