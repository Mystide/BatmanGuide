/* Batman Guide app.js — build 2026-03-03.11-clean-sync-ui */
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
