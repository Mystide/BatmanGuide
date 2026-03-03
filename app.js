/* BATCOMPUTER app.js — build 2026-03-03.2-debug */
(() => {
  "use strict";

  const BUILD_ID = "2026-03-03.3-debug";
  const BASE = [{"id": "E1-01", "era": "Era 1 — Golden Age (1939–1956)", "type": "book", "title": "Batman: The Golden Age Vol. 1", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-the-golden-age-vol-1/91031541-9328-474c-9d6d-a67d249b6783", "optional": false}, {"id": "E1-02", "era": "Era 1 — Golden Age (1939–1956)", "type": "book", "title": "Batman: The Golden Age Vol. 2", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-the-golden-age-vol-2/933f327e-71b1-4838-bd9e-440859e8d012", "optional": false}, {"id": "E1-03", "era": "Era 1 — Golden Age (1939–1956)", "type": "book", "title": "Batman: The Golden Age Vol. 3", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-the-golden-age-vol-3/be41fa4e-998b-4d0d-b440-6d6e55e57d3a", "optional": false}, {"id": "E1-04", "era": "Era 1 — Golden Age (1939–1956)", "type": "book", "title": "Batman: The Golden Age Vol. 4", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-the-golden-age-vol-4/97b32ff3-fa49-4745-ade0-61ad1db164df", "optional": false}, {"id": "E1-05", "era": "Era 1 — Golden Age (1939–1956)", "type": "book", "title": "Batman: The Golden Age Vol. 5", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-the-golden-age-vol-5/9a319085-3586-413b-9c59-e54845d2514b", "optional": false}, {"id": "E1-06", "era": "Era 1 — Golden Age (1939–1956)", "type": "book", "title": "Batman: The Golden Age Vol. 6", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-the-golden-age-vol-6/75ee0e49-bb8f-436e-b912-c76e0724f725", "optional": false}, {"id": "E1-07", "era": "Era 1 — Golden Age (1939–1956)", "type": "book", "title": "Batman in the Fifties", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-in-the-fifties/2f00984e-20e7-4976-9518-89e379a858d4", "optional": false}, {"id": "E2-01", "era": "Era 2 — Silver Age (1956–1970)", "type": "collection", "title": "Batman: The Silver Age (Collection — read everything inside)", "url": "https://www.dcuniverseinfinite.com/collections/edt-silver-age-batman", "optional": false}, {"id": "E3-01", "era": "Era 3 — Bronze Age (1970–1986)", "type": "collection", "title": "Batman: The Bronze Age (Collection — read everything inside)", "url": "https://www.dcuniverseinfinite.com/collections/edt-bronze-age-batman", "optional": false}, {"id": "E3-02", "era": "Era 3 — Bronze Age (1970–1986)", "type": "book", "title": "Batman: Tales of the Demon", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-tales-of-the-demon/7760d676-d0dd-425a-b864-7f4118616320/c", "optional": false}, {"id": "E3-03", "era": "Era 3 — Bronze Age (1970–1986)", "type": "collection", "title": "Batman: Strange Apparitions", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-strange-apparitions", "optional": false}, {"id": "E3-04", "era": "Era 3 — Bronze Age (1970–1986)", "type": "collection", "title": "Batman: Where Were You The Night Batman Died?", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-thenightbatmandied", "optional": false}, {"id": "E4-00", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Crisis on Infinite Earths (Checkpoint)", "url": "https://www.dcuniverseinfinite.com/collections/edt-crisis-on-infinite-earths", "optional": false}, {"id": "E4-01", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "book", "title": "Batman: Year One (Deluxe Edition)", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-year-one-deluxe-edition/d6e52627-ebab-4b6e-9c59-175d60923237", "optional": false}, {"id": "E4-02", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "book", "title": "Batman: Year Two (30th Anniversary Deluxe Edition)", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-year-two-30th-anniversary-deluxe-edition/e8f30a67-c2f3-4357-9fb3-a927255018e9", "optional": false}, {"id": "E4-02A", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "book", "title": "Batman: Year Three (Deluxe Edition)", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-year-three-the-deluxe-edition/ef52dadf-1727-4512-b348-fec7b3b91188", "optional": false}, {"id": "E4-03", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Shaman (LOTDK #1–5)", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-shaman", "optional": false}, {"id": "E4-03A", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Prey", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-prey", "optional": false}, {"id": "E4-03B", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Legends of the Dark Knight: Gothic", "url": "https://www.dcuniverseinfinite.com/collections/story-legendsofdarkknight-gothic", "optional": false}, {"id": "E4-03C", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Venom", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-venom", "optional": false}, {"id": "E4-04", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "book", "title": "Legends of the Dark Knight: Matt Wagner (Monster Men + Mad Monk + more)", "url": "https://www.dcuniverseinfinite.com/comics/book/legends-of-the-dark-knight-matt-wagner/f2a3bcf5-ecc4-494c-88bd-7e44f303dba5/c", "optional": false}, {"id": "E4-05", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "book", "title": "Batman: The Man Who Laughs (Deluxe Edition)", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-the-man-who-laughs-the-deluxe-edition/2dfa7e71-3882-41ab-8dee-1c1e4d6273f0", "optional": false}, {"id": "E4-06", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Haunted Knight", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-haunted-knight", "optional": false}, {"id": "E4-07", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: The Long Halloween", "url": "https://www.dcuniverseinfinite.com/collections/batman-halloween", "optional": false}, {"id": "E4-08", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Dark Victory", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-dark-victory", "optional": false}, {"id": "E4-11", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "book", "title": "Batman: The Killing Joke (Deluxe)", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-the-killing-joke-deluxe/9e4a9aea-d63a-42d6-a033-d4f84a9ca95c", "optional": false}, {"id": "E4-12", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: A Death in the Family", "url": "https://www.dcuniverseinfinite.com/collections/batman-death-family", "optional": false}, {"id": "E4-14", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Knightfall Saga", "url": "https://www.dcuniverseinfinite.com/collections/edt-bm-knightfall-saga", "optional": false}, {"id": "E4-20", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: No Man's Land", "url": "https://www.dcuniverseinfinite.com/collections/story-no-mans-land", "optional": false}, {"id": "E4-25", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Hush", "url": "https://www.dcuniverseinfinite.com/collections/batman-hush", "optional": false}, {"id": "E4-27", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Under the Hood", "url": "https://www.dcuniverseinfinite.com/collections/under-the-hood", "optional": false}, {"id": "E4-29", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Batman & Son", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-and-son", "optional": false}, {"id": "E4-31", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Final Crisis", "url": "https://www.dcuniverseinfinite.com/collections/story-final-crisis", "optional": false}, {"id": "E4-35", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Batman: Black Mirror", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-black-mirror", "optional": false}, {"id": "E4-36", "era": "Era 4 — Post‑Crisis (1986–2011)", "type": "collection", "title": "Flashpoint (Checkpoint → leads into New 52)", "url": "https://www.dcuniverseinfinite.com/collections/flashpoint-collection", "optional": false}, {"id": "E5-01", "era": "Era 5 — New 52 Batman (2011–2016)", "type": "collection", "title": "Batman: Court of Owls", "url": "https://www.dcuniverseinfinite.com/collections/batman-court-owls", "optional": false}, {"id": "E5-04", "era": "Era 5 — New 52 Batman (2011–2016)", "type": "collection", "title": "Batman: Death of the Family", "url": "https://www.dcuniverseinfinite.com/collections/story-batman-death-family", "optional": false}, {"id": "E5-06", "era": "Era 5 — New 52 Batman (2011–2016)", "type": "collection", "title": "Batman: Endgame", "url": "https://www.dcuniverseinfinite.com/collections/story-bm-endgame", "optional": false}, {"id": "E5-10", "era": "Era 5 — New 52 Batman (2011–2016)", "type": "series", "title": "Batman Eternal (2014–2015) — read issues oldest→newest", "url": "https://www.dcuniverseinfinite.com/comics/series/batman-eternal-2014-2015/b719a4b3-b8fd-4e47-9a7c-530a5bad62e9", "optional": false}, {"id": "E6-01", "era": "Era 6 — Rebirth (2016–2020)", "type": "book", "title": "Batman Vol. 1: I Am Gotham", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-vol-1-i-am-gotham/cd659884-4ca7-4d6a-a17c-f955f61da19c", "optional": false}, {"id": "E6-06", "era": "Era 6 — Rebirth (2016–2020)", "type": "book", "title": "Batman Vol. 4: The War of Jokes and Riddles", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-vol-4-the-war-of-jokes-and-riddles/4a807fd7-2b31-4d70-a077-de12a7dc77e7", "optional": false}, {"id": "E6-14", "era": "Era 6 — Rebirth (2016–2020)", "type": "book", "title": "Batman: City of Bane — The Complete Collection", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-city-of-bane-the-complete-collection/0479de1c-9fc3-4ee4-8f81-fed9dfafae7e", "optional": false}, {"id": "E6-15", "era": "Era 6 — Rebirth (2016–2020)", "type": "book", "title": "The Joker War Saga (full crossover book)", "url": "https://www.dcuniverseinfinite.com/comics/book/the-joker-war-saga/03247bfb-3037-4a10-88fa-2395d9604cdb", "optional": false}, {"id": "E7-02", "era": "Era 7 — Infinite Frontier / Dawn of DC (2021–present)", "type": "book", "title": "Batman: Fear State Saga (full crossover book)", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-fear-state-saga/049e526a-07f9-4678-bed9-a3dc6d1e7909/c", "optional": false}, {"id": "E7-03", "era": "Era 7 — Infinite Frontier / Dawn of DC (2021–present)", "type": "book", "title": "Batman Vol. 1: Failsafe", "url": "https://www.dcuniverseinfinite.com/comics/book/batman-vol-1-failsafe/618cd2a7-45cb-4519-b0f1-c43527dab5f7", "optional": false}, {"id": "E7-05", "era": "Era 7 — Infinite Frontier / Dawn of DC (2021–present)", "type": "collection", "title": "Batman/Catwoman: The Gotham War", "url": "https://www.dcuniverseinfinite.com/collections/story-bm-cw-gotham-war", "optional": false}];
  const LIST_VERSION = "batman_dcui_build_" + BUILD_ID;
  const STORAGE_KEY = "batcomputer:state:v1";
  const GIST_CFG_KEY = "batcomputer:gist:v1";
  const ERA_OPEN_KEY = "batcomputer:eraOpen:v1";

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
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return { items:{}, lastTouchedId:null, updatedAt:null };
      const st = JSON.parse(raw);
      if(!st.items) st.items = {};
      return st;
    }catch{
      return { items:{}, lastTouchedId:null, updatedAt:null };
    }
  }
  let state = loadState();

  let autoSyncTimer = null;
  function scheduleAutoSync(){
    const cfg = loadCfg();
    if(!cfg.auto || !ready(cfg)) return;
    if(autoSyncTimer) clearTimeout(autoSyncTimer);
    autoSyncTimer = setTimeout(async ()=>{
      try{ await gistPush(cfg); }catch{ setSyncStatus("Auto-sync failed"); }
    }, 1200);
  }

  function saveState(){
    state.updatedAt = nowISO();
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
    try{ return JSON.parse(localStorage.getItem(ERA_OPEN_KEY) || "{}"); }catch{ return {}; }
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

  // Tools overlay
  const toolsOverlay = $("toolsOverlay");
  function openTools(){ toolsOverlay.classList.add("open"); toolsOverlay.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; }
  function closeTools(){ toolsOverlay.classList.remove("open"); toolsOverlay.setAttribute("aria-hidden","true"); document.body.style.overflow=""; }

  $("btnTools").addEventListener("click", openTools);
  $("fabTools").addEventListener("click", openTools);
  $("btnCloseTools").addEventListener("click", closeTools);
  toolsOverlay.addEventListener("click", (e)=>{ if(e.target === toolsOverlay) closeTools(); });

  // Header buttons
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

  // Sync via Gist
  function loadCfg(){
    try{
      const raw = localStorage.getItem(GIST_CFG_KEY);
      if(!raw) return { gistId:"", gistFile:"batcomputer_progress.json", token:"", auto:false };
      const c = JSON.parse(raw);
      return {
        gistId: (c.gistId||"").trim(),
        gistFile: (c.gistFile||"batcomputer_progress.json").trim() || "batcomputer_progress.json",
        token: (c.token||"").trim(),
        auto: !!c.auto
      };
    }catch{
      return { gistId:"", gistFile:"batcomputer_progress.json", token:"", auto:false };
    }
  }
  function saveCfg(cfg){ localStorage.setItem(GIST_CFG_KEY, JSON.stringify(cfg)); }
  function setSyncStatus(t){ $("syncStatus").textContent = t; }
  function cfgFromUI(){
    return {
      gistId: ($("gistId").value||"").trim(),
      gistFile: ($("gistFile").value||"batcomputer_progress.json").trim() || "batcomputer_progress.json",
      token: ($("gistToken").value||"").trim(),
      auto: $("autoSync").checked
    };
  }
  function cfgToUI(c){
    $("gistId").value = c.gistId || "";
    $("gistFile").value = c.gistFile || "batcomputer_progress.json";
    $("gistToken").value = c.token || "";
    $("autoSync").checked = !!c.auto;
  }
  function ready(c){ return !!(c.gistId && c.gistFile && c.token); }

  async function ghFetch(cfg, method, url, body){
    const headers = {
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cfg.token}`
    };
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if(!res.ok){
      const t = await res.text().catch(()=> "");
      throw new Error(`GitHub API error ${res.status}: ${t.slice(0,200)}`);
    }
    return res.json();
  }


  async function getGistFileText(cfg){
    const data = await ghFetch(cfg, "GET", `https://api.github.com/gists/${cfg.gistId}`);
    const files = data.files || {};
    const f = files[cfg.gistFile];
    if(!f) throw new Error(`Gist file not found: ${cfg.gistFile}`);
    if(typeof f.content === "string" && f.truncated){
      if(!f.raw_url) throw new Error("Gist content is truncated and raw_url is missing.");
      const res = await fetch(f.raw_url, { headers: { "Accept": "application/json" }});
      const txt = await res.text();
      return txt;
    }
    if(typeof f.content !== "string") throw new Error("Gist file has no text content.");
    return f.content;
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

    // Friendly handling for blank / placeholder files
    const trimmed = (content || "").trim();
    if(!trimmed || trimmed === "{}" || trimmed === "[]"){
      throw new Error("Gist file is empty/placeholder. Press PUSH once on a device to create the first save, then pull on other devices.");
    }

    const res = importPayload(trimmed);
    if(!res.ok) throw new Error(res.err || "Invalid export JSON. Press PUSH once to overwrite the gist with a valid save.");
    setSyncStatus("Pulled ✓ " + new Date().toLocaleString());
    render();
  }

  async function gistPush(cfg){
    setSyncStatus("Pushing…");
    const payload = exportPayload();
    await ghFetch(cfg, "PATCH", `https://api.github.com/gists/${cfg.gistId}`, {
      files: { [cfg.gistFile]: { content: payload } }
    });
    setSyncStatus("Pushed ✓ " + new Date().toLocaleString());
  }

  function parseISO(iso){ const t = Date.parse(iso||""); return isNaN(t) ? 0 : t; }

  async function gistSync(cfg){
    setSyncStatus("Syncing…");
    let content = null;
    try{
      content = await getGistFileText(cfg);
    }catch(e){
      // If file missing, create it
      await gistPush(cfg);
      setSyncStatus("Synced ✓ (created gist save)");
      return;
    }

    const trimmed = (content || "").trim();
    if(!trimmed || trimmed === "{}" || trimmed === "[]"){
      // remote empty -> push local
      await gistPush(cfg);
      setSyncStatus("Synced ✓ (initialized remote)");
      return;
    }

    let remote = null;
    try{ remote = JSON.parse(trimmed); }catch{ remote = null; }
    if(!remote || !remote.state){
      // remote not an export -> push local to fix
      await gistPush(cfg);
      setSyncStatus("Synced ✓ (fixed remote format)");
      return;
    }

    const remoteUpdated = parseISO(remote?.state?.updatedAt);
    const localUpdated = parseISO(state?.updatedAt);
    if(remoteUpdated > localUpdated){
      const res = importPayload(trimmed);
      if(!res.ok) throw new Error(res.err);
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
  $("siteUrl").value = location.href;
  $("copySiteUrl").addEventListener("click", ()=> navigator.clipboard?.writeText(location.href).catch(()=>{}));
  ["gistId","gistFile","gistToken","autoSync"].forEach(id=> $(id).addEventListener("change", ()=>{ const c = cfgFromUI(); saveCfg(c); setSyncStatus(ready(c) ? "Sync ready" : "Sync not configured"); }));

  $("gistPull").addEventListener("click", async ()=>{ const c = cfgFromUI(); saveCfg(c); if(!ready(c)) return alert("Fill Gist ID + file + token first."); try{ await gistPull(c); }catch(e){ alert(String(e.message||e)); setSyncStatus("Pull failed"); }});
  $("gistPush").addEventListener("click", async ()=>{ const c = cfgFromUI(); saveCfg(c); if(!ready(c)) return alert("Fill Gist ID + file + token first."); try{ await gistPush(c); }catch(e){ alert(String(e.message||e)); setSyncStatus("Push failed"); }});
  $("gistSync").addEventListener("click", async ()=>{ const c = cfgFromUI(); saveCfg(c); if(!ready(c)) return alert("Fill Gist ID + file + token first."); try{ await gistSync(c); }catch(e){ alert(String(e.message||e)); setSyncStatus("Sync failed"); }});

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
