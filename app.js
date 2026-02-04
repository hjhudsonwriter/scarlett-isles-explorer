// safety checkpoint
(() => {
    // -------------------------------
  // GitHub Pages base-path helper
  // -------------------------------
  const BASE = (() => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.length ? `/${parts[0]}/` : "/";
  })();

  function withBase(url) {
    if (!url) return url;
    if (
      url.startsWith("http") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) return url;
    if (url.startsWith("/")) return BASE + url.slice(1);
    return BASE + url;
  }
  // Campaign Manager used #view — keep it
  const view = document.getElementById("view");
  if (!view) {
    alert("Explorer failed to mount: #view not found");
    return;
  }

  // If your Explorer code expects `view` globally:
  window.view = view;

  // ---- PASTE EXPLORER CODE BELOW THIS LINE ----
const EXPLORER_KEY = "scarlettIsles.explorer.v1";
    // -------------------------------
// Explorer Events (data/events.json)
// -------------------------------
const EVENTS_URL = withBase("data/events.json");

const PROVINCES = [
  { id: "northern_province", label: "Northern Province" },
  { id: "midland_province",  label: "Midland Province" },
  { id: "eastern_province",  label: "Eastern Province" },
  { id: "southern_province", label: "Southern Province" },
  { id: "western_province",  label: "Western Province" },
  { id: "the_north_isle",    label: "The North Isle" },
  { id: "the_east_isle",     label: "The East Isle" }
];

let EVENT_DB = null;

async function loadEventDb(){
  try{
    const res = await fetch(EVENTS_URL, { cache: "no-cache" });
    if(!res.ok) throw new Error(`Failed to load events.json (${res.status})`);
    const db = await res.json();
    EVENT_DB = db;
    return db;
  }catch(err){
    console.warn("Events DB failed to load:", err);
    EVENT_DB = null;
    return null;
  }
}

function provinceLabel(id){
  return PROVINCES.find(p => p.id === id)?.label || id || "Unknown";
}

function pickRandom(arr){
  if(!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
  // -------------------------------
// Explorer-local hero definitions
// -------------------------------
const HEROES = [
  { id: "kaelen", title: "Kaelen" },
  { id: "umbrys", title: "Umbrys" },
  { id: "magnus", title: "Magnus" },
  { id: "elara", title: "Elara" },
  { id: "charles", title: "Charles" }
];

function explorerUid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
function explorerClamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function explorerLoad() {
  try { return JSON.parse(localStorage.getItem(EXPLORER_KEY) || "{}"); }
  catch { return {}; }
}
function explorerSave(state) {
  localStorage.setItem(EXPLORER_KEY, JSON.stringify(state));
}
function explorerHeroInitial(title) {
  const t = String(title || "").trim();
  if (!t) return "?";
  // Prefer first letter of first word (Kaelen, Umbrys, Magnus, Elara, Charles)
  return t.split(/\s+/)[0].slice(0, 1).toUpperCase();
}
function explorerDefaultState() {
  // Normalised positions so fullscreen/resizes don’t break placement
  const tokens = HEROES.map((h, i) => ({
  id: h.id,
  name: h.title,
  initial: explorerHeroInitial(h.title),
  x: 0.12 + (i * 0.07),
  y: 0.18 + (i * 0.06),
  size: 46,
  groupId: null,
  milesUsed: 0
}));


  return {
    mapDataUrl: null,


    snap: {
      enabled: false
    },


    travel: {
  day: 1,
  milesUsed: 0,

  // NEW: which region we’re currently traveling in
  provinceId: "northern_province",

  // NEW: travel event rules (max 1 per day)
  travelEventDay: 0,          // day number we last triggered a travel event
  nextTravelEventAtMiles: 0   // random mileage threshold for today
},


    grid: {
      enabled: true,
      r: 38,
      offsetX: 0,
      offsetY: 0,
      opacity: 0.35
    },


    tokens
  };
}


function renderExplorer() {
  // If we previously mounted Explorer, clean up listeners to avoid stacking
  if (window.__explorerCleanup) {
    try { window.__explorerCleanup(); } catch {}
    window.__explorerCleanup = null;
  }


  // Build UI
  view.innerHTML = `
          <div class="explorer-head">
        <div class="explorer-brand">
          <img class="explorer-logo" src="assets/logo.png" alt="Scarlett Isles logo" />
          <div class="explorer-brandText">
            <h1 class="explorer-title">Scarlett Isles Explorer</h1>
            <p class="muted explorer-sub">
              Upload a map, align a hex grid, and drag your heroes around.
            </p>
          </div>
        </div>
      </div>


      <div class="explorer-fswrap" id="explorerFsWrap">
      <div class="explorer-controls">
        <label class="btn">
          Upload map
          <input id="explorerMapUpload" type="file" accept="image/*" hidden />
        </label>


        <button class="btn ghost" id="explorerClearMap" type="button">Clear map</button>
        <button class="btn ghost" id="explorerFullscreen" type="button">Fullscreen</button>
        <button class="btn ghost" id="explorerHideUi" type="button">Hide UI</button>


        <span class="explorer-divider"></span>


        <button class="btn" id="explorerGridToggle" type="button">Hex Grid: On</button>
        <button class="btn ghost" id="explorerSnapToggle" type="button">Snap: Off</button>


        <div class="explorer-group">
          <button class="btn ghost" id="explorerGridSm" type="button">Hex −</button>
          <button class="btn ghost" id="explorerGridLg" type="button">Hex +</button>
        </div>


        <div class="explorer-group">
          <button class="btn ghost" id="explorerGridLeft" type="button">◀</button>
          <button class="btn ghost" id="explorerGridUp" type="button">▲</button>
          <button class="btn ghost" id="explorerGridDown" type="button">▼</button>
          <button class="btn ghost" id="explorerGridRight" type="button">▶</button>
        </div>


        <div class="explorer-opacity">
          <span class="muted tiny">Grid opacity</span>
          <input id="explorerGridOpacity" type="range" min="0" max="1" step="0.05" />
        </div>


        <span class="explorer-divider"></span>


        <div class="explorer-group">
          <button class="btn ghost" id="explorerTokSm" type="button">Token −</button>
          <button class="btn ghost" id="explorerTokLg" type="button">Token +</button>
        </div>


        <div class="explorer-group">
          <button class="btn" id="explorerGroup" type="button">Group</button>
          <button class="btn ghost" id="explorerUngroup" type="button">Ungroup</button>
        </div>


        <div class="explorer-group">
  <span class="muted tiny">Region</span>
  <select id="explorerProvince" class="btn ghost" style="padding:8px 10px;border-radius:14px;">
    ${PROVINCES.map(p => `<option value="${p.id}">${p.label}</option>`).join("")}
  </select>
</div>

<span class="hint" id="explorerReadout">Hex: —</span>
      </div>


      <div class="explorer-stage" id="explorerStage">
        <div class="explorer-world" id="explorerWorld">
          <img id="explorerMap" class="explorer-map" alt="Map" />
          <canvas id="explorerGrid" class="explorer-grid"></canvas>
          <div id="explorerTokens" class="explorer-tokens"></div>
          <div id="explorerMarquee" class="explorer-marquee" hidden></div>
        </div>
      </div>


      <div class="hint" style="margin-top:10px">
  Tips: ...
</div>
<div class="explorer-travel" id="explorerTravel">
  <div class="explorer-travelRow">
    <div class="explorer-travelLeft">
      <div class="explorer-travelLine">
        <strong id="explorerDayLabel">Day 1</strong>
        <span class="muted tiny">•</span>
        <span class="tiny">Miles (selected): <strong id="explorerMilesUsed">0</strong>/30</span>
        <span class="muted tiny">•</span>
        <span class="tiny">Remaining: <strong id="explorerMilesLeft">30</strong></span>
      </div>


      <div class="explorer-travelLine tiny">
        <span class="muted">Mode:</span>
        <strong id="explorerMode">—</strong>
        <span class="muted">• Effects:</span>
        <span id="explorerEffects">—</span>
        <span class="muted">•</span>
        <span id="explorerNotice" class="tiny" style="opacity:.9"></span>
      </div>
      <div id="explorerMilesList" class="explorer-milesList"></div>
    </div>


    <div class="explorer-travelRight">
  <button class="btn ghost" id="explorerResetTravel" type="button">Reset Travel</button>
  <button class="btn" id="explorerMakeCamp" type="button">Make Camp</button>
</div>
  </div>
</div>
</div> <!-- end explorer-fswrap -->
<!-- Events modal -->
<div class="evModal" id="evModal" aria-hidden="true">
  <div class="evModal_backdrop" id="evBackdrop"></div>
  <div class="evModal_card" role="dialog" aria-modal="true" aria-labelledby="evTitle">
    <div class="evModal_top">
      <div>
        <div class="evModal_type" id="evMeta">Event</div>
        <h3 class="evModal_title" id="evTitle">—</h3>
      </div>
      <button class="btn ghost evModal_close" id="evClose" type="button">Close</button>
    </div>

    <div class="evModal_desc" id="evDesc">—</div>
    <div class="evModal_prompt" id="evPrompt" style="display:none;"></div>

    <div class="evChoices" id="evChoices"></div>
  </div>
</div>
</div> <!-- end explorer-wrap -->
  `;


  const root = view;
  const mapUpload = root.querySelector("#explorerMapUpload");
  const btnClear = root.querySelector("#explorerClearMap");
  const btnFs = root.querySelector("#explorerFullscreen");
  const btnHideUi = root.querySelector("#explorerHideUi");
  const btnSnapToggle = root.querySelector("#explorerSnapToggle");


const dayLabel = root.querySelector("#explorerDayLabel");
const milesUsedEl = root.querySelector("#explorerMilesUsed");
const milesLeftEl = root.querySelector("#explorerMilesLeft");
  const milesListEl = root.querySelector("#explorerMilesList");
const modeEl = root.querySelector("#explorerMode");
const effectsEl = root.querySelector("#explorerEffects");
const noticeEl = root.querySelector("#explorerNotice");
const btnMakeCamp = root.querySelector("#explorerMakeCamp");
  const btnResetTravel = root.querySelector("#explorerResetTravel");
  function setNotice(msg) {
  if (!noticeEl) return;
  noticeEl.textContent = msg || "";
}


  const btnGridToggle = root.querySelector("#explorerGridToggle");
  const btnGridSm = root.querySelector("#explorerGridSm");
  const btnGridLg = root.querySelector("#explorerGridLg");
  const btnGridLeft = root.querySelector("#explorerGridLeft");
  const btnGridRight = root.querySelector("#explorerGridRight");
  const btnGridUp = root.querySelector("#explorerGridUp");
  const btnGridDown = root.querySelector("#explorerGridDown");
  const gridOpacity = root.querySelector("#explorerGridOpacity");
  const readout = root.querySelector("#explorerReadout");
    const provinceSel = root.querySelector("#explorerProvince");

// Modal elements
const evModal = root.querySelector("#evModal");
const evBackdrop = root.querySelector("#evBackdrop");
const evClose = root.querySelector("#evClose");
const evMeta = root.querySelector("#evMeta");
const evTitle = root.querySelector("#evTitle");
const evDesc = root.querySelector("#evDesc");
const evPrompt = root.querySelector("#evPrompt");
const evChoices = root.querySelector("#evChoices");

function openEventModal(kind, event){
  if(!evModal) return;

  const prov = state.travel?.provinceId || "northern_province";
  const kindLabel = kind === "camp" ? "Campfire Event" : "Travel Event";

  evMeta.textContent = `${kindLabel} • ${provinceLabel(prov)} • ${event?.type || "—"}`;
  evTitle.textContent = event?.title || "Unknown Event";
  evDesc.textContent = event?.description || "—";

  if(event?.prompt){
    evPrompt.style.display = "block";
    evPrompt.textContent = event.prompt;
  } else {
    evPrompt.style.display = "none";
    evPrompt.textContent = "";
  }

  // choices
  evChoices.innerHTML = "";
  const choices = Array.isArray(event?.choices) ? event.choices : [];
  if(choices.length){
    choices.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = c;
      b.addEventListener("click", () => {
        setNotice(`Choice made: ${c}`);
        closeEventModal();
      });
      evChoices.appendChild(b);
    });
  } else {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn";
    b.textContent = "Continue";
    b.addEventListener("click", closeEventModal);
    evChoices.appendChild(b);
  }

  evModal.classList.add("isOpen");
  evModal.setAttribute("aria-hidden", "false");
}

function closeEventModal(){
  if(!evModal) return;
  evModal.classList.remove("isOpen");
  evModal.setAttribute("aria-hidden", "true");
}

// Close modal
evClose?.addEventListener("click", closeEventModal);
evBackdrop?.addEventListener("click", closeEventModal);


  const btnTokSm = root.querySelector("#explorerTokSm");
  const btnTokLg = root.querySelector("#explorerTokLg");
  const btnGroup = root.querySelector("#explorerGroup");
  const btnUngroup = root.querySelector("#explorerUngroup");


  const stage = root.querySelector("#explorerStage");
  const fsWrap = root.querySelector("#explorerFsWrap");
  const world = root.querySelector("#explorerWorld");
  const mapImg = root.querySelector("#explorerMap");
  const gridCanvas = root.querySelector("#explorerGrid");
  const tokenLayer = root.querySelector("#explorerTokens");
  tokenLayer.style.touchAction = "none";
stage.style.touchAction = "none";
  const marquee = root.querySelector("#explorerMarquee");


  // Load state (merge defaults)
  const saved = explorerLoad();
  const state = explorerDefaultState();


  if (typeof saved.mapDataUrl === "string") state.mapDataUrl = saved.mapDataUrl;
  if (saved.grid) state.grid = { ...state.grid, ...saved.grid };
  if (saved.snap) state.snap = { ...state.snap, ...saved.snap };
if (saved.travel) state.travel = { ...state.travel, ...saved.travel };


  if (Array.isArray(saved.tokens)) {
  // merge by id, keep defaults for any missing heroes
  const byId = new Map(saved.tokens.map(t => [t.id, t]));
  state.tokens = state.tokens.map(t => {
    const prev = byId.get(t.id);
    if (!prev) return t;
    return {
      ...t,
      x: Number.isFinite(prev.x) ? prev.x : t.x,
      y: Number.isFinite(prev.y) ? prev.y : t.y,
      size: Number.isFinite(prev.size) ? prev.size : t.size,
      groupId: prev.groupId || null,
      axial: prev.axial && Number.isFinite(prev.axial.q) && Number.isFinite(prev.axial.r)
        ? { q: prev.axial.q, r: prev.axial.r }
        : null
    };
  });
}


  // Selection state (not persisted)
  const selected = new Set();


  // Drag state must exist BEFORE first renderTokens() call
  let drag = null;
  let travelFocusId = state.tokens[0]?.id || null;


  function saveNow() {
    explorerSave({
  mapDataUrl: state.mapDataUrl,
  snap: state.snap,
  travel: state.travel,
  grid: state.grid,
  tokens: state.tokens
});
  }


  function stageDims() {
    return {
      w: stage.clientWidth || 1,
      h: stage.clientHeight || 1
    };
  }
  function normToPx(nx, ny) {
    const { w, h } = stageDims();
    return { x: nx * w, y: ny * h };
  }
  function pxToNorm(px, py) {
    const { w, h } = stageDims();
    return { x: px / w, y: py / h };
  }


  // ---------- Hex snap math (pointy-top axial coords) ----------
// Using grid.r as size and grid offsets as origin.
// Reference math is the standard axial conversion.
function hexSize() {
  return explorerClamp(Number(state.grid.r) || 38, 10, 220);
}
function gridOrigin() {
  return {
    ox: Number(state.grid.offsetX) || 0,
    oy: Number(state.grid.offsetY) || 0
  };
}
function pixelToAxial(px, py) {
  const s = hexSize();
  const { ox, oy } = gridOrigin();
  const x = px - ox;
  const y = py - oy;


  const q = (Math.sqrt(3)/3 * x - 1/3 * y) / s;
  const r = (2/3 * y) / s;
  return { q, r };
}
function axialToPixel(q, r) {
  const s = hexSize();
  const { ox, oy } = gridOrigin();
  const x = s * Math.sqrt(3) * (q + r/2) + ox;
  const y = s * (3/2) * r + oy;
  return { x, y };
}
function axialRound(aq, ar) {
  // Allow calling either axialRound({q,r}) OR axialRound(q,r)
  let q, r;
  if (typeof aq === "object" && aq) {
    q = Number(aq.q);
    r = Number(aq.r);
  } else {
    q = Number(aq);
    r = Number(ar);
  }


  // cube round then convert back
  let x = q;
  let z = r;
  let y = -x - z;


  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);


  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);


  if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
  else if (yDiff > zDiff) ry = -rx - rz;
  else rz = -rx - ry;


  return { q: rx, r: rz };
}
  
function hexDistance(a, b) {
  // axial distance
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  const ds = (-a.q - a.r) - (-b.q - b.r);
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;
}


  function updateReadout() {
    const r = Number(state.grid.r) || 0;
    const w = Math.round(Math.sqrt(3) * r);
    btnGridToggle.textContent = `Hex Grid: ${state.grid.enabled ? "On" : "Off"}`;
    readout.textContent = r ? `Hex: r=${Math.round(r)}px (≈ ${w}px wide)` : "Hex: —";
  }


  function travelModeFromMiles(m) {
  if (m <= 0) return { mode: "—", effects: "—" };
  if (m <= 18) return { mode: "Slow (≤18 miles)", effects: "+Stealth • good foraging" };
  if (m <= 24) return { mode: "Normal (≤24 miles)", effects: "No effects" };
  return { mode: "Fast (≤30 miles)", effects: "−5 Passive Perception" };
}


function updateTravelUI() {
  const focus = state.tokens.find(t => t.id === travelFocusId) || state.tokens[0];


  const used = explorerClamp(Number(focus?.milesUsed) || 0, 0, 30);
  const left = 30 - used;


  if (dayLabel) dayLabel.textContent = `Day ${state.travel.day || 1}`;
  if (milesUsedEl) milesUsedEl.textContent = String(used);
  if (milesLeftEl) milesLeftEl.textContent = String(left);


  const t = travelModeFromMiles(used);
  if (modeEl) modeEl.textContent = t.mode;
  if (effectsEl) effectsEl.textContent = t.effects;


  // Render per-hero list
  if (milesListEl) {
    milesListEl.innerHTML = state.tokens.map(tok => {
      const u = explorerClamp(Number(tok.milesUsed) || 0, 0, 30);
      const isFocus = tok.id === travelFocusId;
      const done = u >= 30;


      return `
        <button type="button"
          class="milesPill ${isFocus ? "isFocus" : ""} ${done ? "isDone" : ""}"
          data-id="${tok.id}">
          ${tok.initial} <strong>${u}</strong>/30
        </button>
      `;
    }).join("");


    milesListEl.querySelectorAll(".milesPill").forEach(btn => {
      btn.addEventListener("click", () => {
        travelFocusId = btn.dataset.id;
        updateTravelUI();
      });
    });
  }


  // IMPORTANT: do NOT globally lock all tokens anymore
  tokenLayer.style.pointerEvents = "";
}


  function resizeGridCanvas() {
    const { w, h } = stageDims();
    const dpr = window.devicePixelRatio || 1;
    gridCanvas.width = Math.floor(w * dpr);
    gridCanvas.height = Math.floor(h * dpr);
    gridCanvas.style.width = `${w}px`;
    gridCanvas.style.height = `${h}px`;
    const ctx = gridCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }


  function drawHexGrid() {
  resizeGridCanvas();
  const ctx = gridCanvas.getContext("2d");
  const { w, h } = stageDims();


  ctx.clearRect(0, 0, w, h);
  if (!state.grid.enabled) return;


  const r = hexSize();
  const opacity = explorerClamp(Number(state.grid.opacity) || 0.35, 0, 1);


  ctx.globalAlpha = opacity;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(231,231,234,0.9)";


  // We will iterate axial coords that cover the visible area.
  // Convert viewport corners to axial range (with padding) and draw each hex by axialToPixel.
  const pad = 3;


  const aTL = pixelToAxial(0, 0);
  const aTR = pixelToAxial(w, 0);
  const aBL = pixelToAxial(0, h);
  const aBR = pixelToAxial(w, h);


  const rs = [aTL.r, aTR.r, aBL.r, aBR.r];
  const rMin = Math.floor(Math.min(...rs)) - pad;
  const rMax = Math.ceil(Math.max(...rs)) + pad;


  // q range is trickier because q shifts with r, so we overshoot a bit
  const qs = [aTL.q, aTR.q, aBL.q, aBR.q];
  const qMin0 = Math.floor(Math.min(...qs)) - pad - 6;
  const qMax0 = Math.ceil(Math.max(...qs)) + pad + 6;


  // draw function for a single hex at center (cx, cy)
  function strokeHex(cx, cy) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30); // pointy-top
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }


  for (let rr = rMin; rr <= rMax; rr++) {
    for (let qq = qMin0; qq <= qMax0; qq++) {
      const p = axialToPixel(qq, rr);
      // quick reject: if center is far offscreen, skip
      if (p.x < -2 * r || p.x > w + 2 * r || p.y < -2 * r || p.y > h + 2 * r) continue;
      strokeHex(p.x, p.y);
    }
  }


  ctx.globalAlpha = 1;
}


  function renderTokens() {
  tokenLayer.innerHTML = "";
  const { w, h } = stageDims();


  // Group tokens by hex when snap is on (using t.axial if present)
  const groups = new Map();
  if (state.snap.enabled) {
    state.tokens.forEach(t => {
      if (!t.axial) {
  const px = normToPx(t.x, t.y);
  const cx = px.x + t.size/2;
  const cy = px.y + t.size/2;
  t.axial = axialRound(pixelToAxial(cx, cy));
}
      const key = `${t.axial.q},${t.axial.r}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    });
  }


  state.tokens.forEach(t => {
    const token = document.createElement("div");
    token.className = "explorer-token";
    token.dataset.id = t.id;


    if (selected.has(t.id)) token.classList.add("isSelected");
    if (t.groupId) token.dataset.groupId = t.groupId;


    token.style.width = `${t.size}px`;
    token.style.height = `${t.size}px`;


    let x, y;


    // If snap is on and this token has an axial hex, draw it as a tight cluster INSIDE the hex
if (state.snap.enabled) {
  // Ensure axial exists (in case token came from old saves)
  if (!t.axial) {
    const px = normToPx(t.x, t.y);
    const cx = px.x + t.size/2;
    const cy = px.y + t.size/2;
    t.axial = axialRound(pixelToAxial(cx, cy));
  }
  const key = `${t.axial.q},${t.axial.r}`;
  const cluster = (groups.get(key) || [t]).slice();


  // Put the "anchor" token first if we are currently dragging
  const anchorId = drag?.anchorId || null;
  if (anchorId) {
    cluster.sort((a, b) => (a.id === anchorId ? -1 : b.id === anchorId ? 1 : 0));
  }


  const idx = cluster.findIndex(tt => tt.id === t.id);
  const n = Math.max(1, cluster.length);


  // Hex center in pixels
  const center = axialToPixel(t.axial.q, t.axial.r);


  // SAFE inner radius so tokens stay well inside the hex
  // hexSize() is vertex radius; inradius ≈ 0.86 * size
  const inRadius = hexSize() * 0.86;
  const tokenRadius = t.size / 2;


  // Tiny cluster radius (keeps them clearly inside the hex)
  // idx 0 sits in the centre, others orbit in a small ring
  const maxClusterR = Math.max(0, inRadius - tokenRadius - 6);
  const clusterR = Math.min(maxClusterR, 12); // <= 12px feels “neat”


  let cx = center.x;
  let cy = center.y;


  if (idx > 0) {
    const angle = (Math.PI * 2 * (idx - 1)) / Math.max(1, (n - 1));
    cx = center.x + Math.cos(angle) * clusterR;
    cy = center.y + Math.sin(angle) * clusterR;
  }


  x = cx - tokenRadius;
  y = cy - tokenRadius;
} else {
      // Normal rendering
      const px = normToPx(t.x, t.y);
      x = px.x;
      y = px.y;
    }


    // Clamp to stage
    x = explorerClamp(x, 0, Math.max(0, w - t.size));
    y = explorerClamp(y, 0, Math.max(0, h - t.size));


    token.style.left = `${x}px`;
    token.style.top = `${y}px`;


    token.innerHTML = `<span>${t.initial}</span>`;
    tokenLayer.appendChild(token);
  });
}


  function rerenderAll() {
    // Map
    if (state.mapDataUrl) {
      mapImg.src = state.mapDataUrl;
      mapImg.style.display = "block";
    } else {
      mapImg.removeAttribute("src");
      mapImg.style.display = "none";
    }


    // Grid UI
    gridOpacity.value = String(state.grid.opacity ?? 0.35);
    updateReadout();


    // Draw + tokens
    drawHexGrid();
    renderTokens();
    updateTravelUI();
  }


  // Initial render
  rerenderAll();
  // Load events in the background
loadEventDb();

// Province dropdown initial value + saving
if (provinceSel) {
  provinceSel.value = state.travel?.provinceId || "northern_province";

  provinceSel.addEventListener("change", () => {
    state.travel.provinceId = provinceSel.value;
    saveNow();
    setNotice(`Region set: ${provinceLabel(state.travel.provinceId)}`);
  });
}

  // ---------- Snap toggle ----------
function updateSnapButton() {
  btnSnapToggle.textContent = `Snap: ${state.snap.enabled ? "On" : "Off"}`;
}
updateSnapButton();


btnSnapToggle.addEventListener("click", () => {
  state.snap.enabled = !state.snap.enabled;


  // When enabling snap, assign axial coords to all tokens based on current position
  if (state.snap.enabled) {
    const { w, h } = stageDims();


    state.tokens.forEach(tok => {
      const px = normToPx(tok.x, tok.y);
      const cx = px.x + tok.size / 2;
      const cy = px.y + tok.size / 2;


      const a = axialRound(pixelToAxial(cx, cy));
      tok.axial = a;


      // OPTIONAL but recommended: pull token neatly onto the hex centre
      const p = axialToPixel(a.q, a.r);
      const topLeft = { x: p.x - tok.size / 2, y: p.y - tok.size / 2 };


      const clamped = {
        x: explorerClamp(topLeft.x, 0, Math.max(0, w - tok.size)),
        y: explorerClamp(topLeft.y, 0, Math.max(0, h - tok.size))
      };


      const n = pxToNorm(clamped.x, clamped.y);
      tok.x = n.x;
      tok.y = n.y;
    });
  }


  saveNow();
  updateSnapButton();
  rerenderAll();
});


  // ---------- Map upload / clear ----------
  function onMapUpload() {
    const file = mapUpload.files && mapUpload.files[0];
    if (!file) return;


    // localStorage is limited; warn early
    const maxBytes = 4 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert("That image is over ~4MB. Please use a smaller JPG if possible.");
      mapUpload.value = "";
      return;
    }


    const reader = new FileReader();
    reader.onload = () => {
      state.mapDataUrl = String(reader.result || "");
      saveNow();
      rerenderAll();
    };
    reader.readAsDataURL(file);
  }


  function onClearMap() {
    const ok = confirm("Clear the uploaded map? (Tokens/grid will remain.)");
    if (!ok) return;
    state.mapDataUrl = null;
    saveNow();
    rerenderAll();
  }


  mapUpload.addEventListener("change", onMapUpload);
  btnClear.addEventListener("click", onClearMap);


  // ---------- Fullscreen ----------
  function onFullscreen() {
  const target = root.querySelector("#explorerFsWrap");
  if (!target) {
    alert("Explorer fullscreen wrapper not found (explorerFsWrap).");
    return;
  }


  if (document.fullscreenElement) {
    document.exitFullscreen?.();
    return;
  }
  target.requestFullscreen?.();
}
  btnFs.addEventListener("click", onFullscreen);
  function setUiHidden(hidden) {
  const target = document.fullscreenElement || fsWrap;
  if (!target) return;


  target.classList.toggle("uiHidden", !!hidden);


  // Update button label
  const isHidden = target.classList.contains("uiHidden");
  if (btnHideUi) btnHideUi.textContent = isHidden ? "Show UI" : "Hide UI";
}
// Toggle when button clicked (only really relevant in fullscreen, but harmless outside)
btnHideUi?.addEventListener("click", () => {
  const target = document.fullscreenElement || fsWrap;
  if (!target) return;
  setUiHidden(!target.classList.contains("uiHidden"));
});


// Handy keyboard toggle while fullscreen: press H
function onKeyToggleUi(e) {
  if (e.key.toLowerCase() !== "h") return;
  if (!document.fullscreenElement) return;
  if (!fsWrap) return;
  setUiHidden(!fsWrap.classList.contains("uiHidden"));
}
window.addEventListener("keydown", onKeyToggleUi);


  // Redraw on resize/fullscreen changes
  const onResize = () => rerenderAll();
  window.addEventListener("resize", onResize);
  document.addEventListener("fullscreenchange", onResize);


  // ---------- Grid controls ----------
  btnGridToggle.addEventListener("click", () => {
    state.grid.enabled = !state.grid.enabled;
    saveNow();
    rerenderAll();
  });


  btnGridSm.addEventListener("click", () => {
    state.grid.r = explorerClamp((Number(state.grid.r) || 38) - 2, 10, 220);
    saveNow();
    rerenderAll();
  });
  btnGridLg.addEventListener("click", () => {
    state.grid.r = explorerClamp((Number(state.grid.r) || 38) + 2, 10, 220);
    saveNow();
    rerenderAll();
  });


  function nudge(dx, dy) {
    state.grid.offsetX = (Number(state.grid.offsetX) || 0) + dx;
    state.grid.offsetY = (Number(state.grid.offsetY) || 0) + dy;
    saveNow();
    rerenderAll();
  }
  btnGridLeft.addEventListener("click", () => nudge(-2, 0));
  btnGridRight.addEventListener("click", () => nudge(2, 0));
  btnGridUp.addEventListener("click", () => nudge(0, -2));
  btnGridDown.addEventListener("click", () => nudge(0, 2));


  gridOpacity.addEventListener("input", () => {
    state.grid.opacity = explorerClamp(Number(gridOpacity.value), 0, 1);
    saveNow();
    rerenderAll();
  });


  // ---------- Token size buttons ----------
  function changeSelectedTokenSize(delta) {
    const ids = selected.size ? Array.from(selected) : state.tokens.map(t => t.id);
    state.tokens = state.tokens.map(t => {
      if (!ids.includes(t.id)) return t;
      return { ...t, size: explorerClamp((Number(t.size) || 46) + delta, 24, 140) };
    });
    saveNow();
    rerenderAll();
  }
  btnTokSm.addEventListener("click", () => changeSelectedTokenSize(-2));
  btnTokLg.addEventListener("click", () => changeSelectedTokenSize(2));


  // ---------- Group / Ungroup ----------
  btnGroup.addEventListener("click", () => {
    if (selected.size < 2) {
      alert("Select 2+ tokens first (box select or Ctrl+click).");
      return;
    }
    const gid = explorerUid();
    const ids = new Set(selected);
    state.tokens = state.tokens.map(t => ids.has(t.id) ? { ...t, groupId: gid } : t);
    saveNow();
    rerenderAll();
  });


  btnUngroup.addEventListener("click", () => {
    if (!selected.size) {
      alert("Select grouped tokens first.");
      return;
    }
    const ids = new Set(selected);
    state.tokens = state.tokens.map(t => ids.has(t.id) ? { ...t, groupId: null } : t);
    saveNow();
    rerenderAll();
  });


  // ---------- Make Camp ----------
btnMakeCamp.addEventListener("click", () => {
  // CAMPFIRE EVENT
  const prov = state.travel?.provinceId || "northern_province";
  const db = EVENT_DB;

  if (db?.provinces?.[prov]?.campfire_events?.length) {
    const ev = pickRandom(db.provinces[prov].campfire_events);
    if (ev) openEventModal("camp", ev);
  }

  // Advance day + reset miles (your existing behaviour)
  state.travel.day = (Number(state.travel.day) || 1) + 1;

  // reset ALL heroes for the new day
  state.tokens.forEach(t => t.milesUsed = 0);

  // Prepare next random travel event threshold for the new day
  state.travel.nextTravelEventAtMiles = 6 + Math.floor(Math.random() * 19); // 6–24
  state.travel.travelEventDay = 0; // allow a travel event on the new day

  saveNow();
  setNotice("");
  updateTravelUI();
});


btnResetTravel?.addEventListener("click", () => {
  const ok = confirm("Reset travel back to Day 1 and clear miles for ALL heroes?");
  if (!ok) return;


  state.travel.day = 1;
  state.tokens.forEach(t => t.milesUsed = 0);


  setNotice("");
  saveNow();
  updateTravelUI();
});


  // ---------- Selection + dragging ----------
  function getTokenById(id) {
    return state.tokens.find(t => t.id === id);
  }
  function tokenIdsInGroup(groupId) {
    return state.tokens.filter(t => t.groupId === groupId).map(t => t.id);
  }


  // Ctrl+drag marquee selection on empty space
  let marqueeActive = false;
  let marqueeStart = null;


  function setMarquee(x1, y1, x2, y2) {
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);


    marquee.style.left = `${left}px`;
    marquee.style.top = `${top}px`;
    marquee.style.width = `${width}px`;
    marquee.style.height = `${height}px`;
  }


  function stagePointFromEvent(e) {
    const rect = stage.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }


  stage.addEventListener("pointerdown", (e) => {
    // If clicking on a token, token handler will manage it
    if (e.target.closest(".explorer-token")) return;


    marqueeActive = true;
    marquee.hidden = false;


    const p = stagePointFromEvent(e);
    marqueeStart = p;
    setMarquee(p.x, p.y, p.x, p.y);


    // If not holding Ctrl, start fresh selection (box select replaces)
    if (!e.ctrlKey) selected.clear();
    rerenderAll();
  });


  stage.addEventListener("pointermove", (e) => {
    if (!marqueeActive || !marqueeStart) return;
    const p = stagePointFromEvent(e);
    setMarquee(marqueeStart.x, marqueeStart.y, p.x, p.y);
  });


  stage.addEventListener("pointerup", (e) => {
    if (!marqueeActive || !marqueeStart) return;


    marqueeActive = false;
    marquee.hidden = true;


    const p = stagePointFromEvent(e);
    const left = Math.min(marqueeStart.x, p.x);
    const top = Math.min(marqueeStart.y, p.y);
    const right = Math.max(marqueeStart.x, p.x);
    const bottom = Math.max(marqueeStart.y, p.y);


    // Select tokens whose centers fall inside the marquee
    state.tokens.forEach(t => {
      const pos = normToPx(t.x, t.y);
      const cx = pos.x + (t.size / 2);
      const cy = pos.y + (t.size / 2);
      if (cx >= left && cx <= right && cy >= top && cy <= bottom) {
        selected.add(t.id);
      }
    });


    marqueeStart = null;
    rerenderAll();
  });


  // Drag tokens (moves selection)
  tokenLayer.addEventListener("pointerdown", (e) => {
    const elTok = e.target.closest(".explorer-token");
    if (!elTok) return;


    const id = elTok.dataset.id;
    const t = getTokenById(id);
    if (!t) return;


    // Selection rules:
    // - Ctrl toggles token selection
    // - Click (no ctrl) selects token or its group if grouped
    if (e.ctrlKey) {
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      rerenderAll();
      return; // Ctrl click is just selection toggle
    }


    // No ctrl: select group if exists, otherwise just this token
    selected.clear();
    if (t.groupId) {
      tokenIdsInGroup(t.groupId).forEach(x => selected.add(x));
    } else {
      selected.add(id);
    }
    rerenderAll();


    // Start drag for currently selected set
    const start = stagePointFromEvent(e);
    const dragIds = Array.from(selected);


    const startTokens = dragIds.map(tokId => {
      const tok = getTokenById(tokId);
      const px = normToPx(tok.x, tok.y);
      return { id: tokId, startX: px.x, startY: px.y, size: tok.size };
    });


    drag = { start, ids: dragIds, startTokens };
    drag.anchorId = id; // the token you grabbed
    travelFocusId = id;
    updateTravelUI();
// Always record starting axial coords for miles tracking (snap OR free)
drag.startAxial = null;
drag.startAxials = new Map();
drag.lastTargetAx = null;


const anchorTok = getTokenById(drag.anchorId);
if (anchorTok) {
  const anchorPx = normToPx(anchorTok.x, anchorTok.y);
  const anchorCenter = {
    x: anchorPx.x + anchorTok.size / 2,
    y: anchorPx.y + anchorTok.size / 2
  };
  drag.startAxial = axialRound(pixelToAxial(anchorCenter.x, anchorCenter.y));
}


// Record starting axial for every dragged token (used for snap-group movement)
drag.ids.forEach(tokId => {
  const tok = getTokenById(tokId);
  if (!tok) return;
  const px = normToPx(tok.x, tok.y);
  const c = { x: px.x + tok.size / 2, y: px.y + tok.size / 2 };
  drag.startAxials.set(tokId, axialRound(pixelToAxial(c.x, c.y)));
});
   try {
  // Pointer capture is helpful but can throw InvalidStateError in some cases.
  // If it fails, dragging still works because we also listen on window pointerup.
  elTok.setPointerCapture(e.pointerId);
} catch (err) {
  // ignore
}
  });


  tokenLayer.addEventListener("pointermove", (e) => {
  if (!drag) return;


  // If max travel reached, block movement
  const anchor = getTokenById(drag.anchorId);
if ((Number(anchor?.milesUsed) || 0) >= 30) return;


  const now = stagePointFromEvent(e);
  const { w, h } = stageDims();


  // SNAP MODE: move by whole hex deltas, preserving group formation in hex coords
  if (state.snap.enabled && drag.startAxial && drag.startAxials) {
    // Determine target axial for the anchor token based on pointer position
    // Use pointer position, but bias it slightly toward the anchor token centre for stability
const anchorTok = getTokenById(drag.anchorId);
let tx = now.x, ty = now.y;


if (anchorTok) {
  const aPx = normToPx(anchorTok.x, anchorTok.y);
  const acx = aPx.x + anchorTok.size / 2;
  const acy = aPx.y + anchorTok.size / 2;


  // 70% pointer, 30% current anchor centre
  tx = now.x * 0.7 + acx * 0.3;
  ty = now.y * 0.7 + acy * 0.3;
}


const targetAx = axialRound(pixelToAxial(tx, ty));
    // Don’t reapply positions if we’re still in the same target hex
if (drag.lastTargetAx && drag.lastTargetAx.q === targetAx.q && drag.lastTargetAx.r === targetAx.r) {
  return;
}
drag.lastTargetAx = targetAx;


    // Hex delta from start
    const dq = targetAx.q - drag.startAxial.q;
    const dr = targetAx.r - drag.startAxial.r;


    // Apply that delta to every dragged token based on its starting axial
    drag.ids.forEach(tokId => {
      const tok = getTokenById(tokId);
      const startA = drag.startAxials.get(tokId);
      if (!tok || !startA) return;


      
      const newA = { q: startA.q + dq, r: startA.r + dr };
tok.axial = newA;


      // Place token centered on hex center
      const centerPx = axialToPixel(newA.q, newA.r);
const topLeft = {
  x: centerPx.x - tok.size / 2,
  y: centerPx.y - tok.size / 2
};


      // Clamp to stage bounds
      const clamped = {
        x: explorerClamp(topLeft.x, 0, Math.max(0, w - tok.size)),
        y: explorerClamp(topLeft.y, 0, Math.max(0, h - tok.size))
      };


      const n = pxToNorm(clamped.x, clamped.y);
      tok.x = n.x;
      tok.y = n.y;
      tok.axial = newA;
    });


    renderTokens();
    return;
  }


  // FREE MODE (no snap): normal pixel dragging
  const dx = now.x - drag.start.x;
  const dy = now.y - drag.start.y;


  drag.startTokens.forEach(st => {
    const tok = getTokenById(st.id);
    if (!tok) return;


    const nxPx = explorerClamp(st.startX + dx, 0, Math.max(0, w - st.size));
    const nyPx = explorerClamp(st.startY + dy, 0, Math.max(0, h - st.size));
    const n = pxToNorm(nxPx, nyPx);


    tok.x = n.x;
    tok.y = n.y;
  });


  renderTokens();
});
  
  function onTokenPointerUp() {
  if (!drag) return;


  if (drag.startAxial) {
    const anchorTok = getTokenById(drag.anchorId);


    if (anchorTok) {
      const px = normToPx(anchorTok.x, anchorTok.y);
      const center = { x: px.x + anchorTok.size / 2, y: px.y + anchorTok.size / 2 };
      const endAx = axialRound(pixelToAxial(center.x, center.y));


      const hexesMoved = hexDistance(drag.startAxial, endAx);
      const milesMoved = Math.round(hexesMoved * 6);


      const movedIds = Array.isArray(drag?.ids) ? drag.ids : [anchorTok.id];


      // Check if any moved token would exceed 30
      let wouldExceed = false;
      for (const tokId of movedIds) {
        const tok = getTokenById(tokId);
        if (!tok) continue;
        const before = Number(tok.milesUsed) || 0;
        const after = before + milesMoved;
        if (after > 30) { wouldExceed = true; break; }
      }


      if (wouldExceed) {
        const { w, h } = stageDims();


        // Revert everyone in the move
        drag.startTokens.forEach(st => {
          const tok = getTokenById(st.id);
          if (!tok) return;


          const clampedX = explorerClamp(st.startX, 0, Math.max(0, w - st.size));
          const clampedY = explorerClamp(st.startY, 0, Math.max(0, h - st.size));
          const n = pxToNorm(clampedX, clampedY);
          tok.x = n.x;
          tok.y = n.y;


          const a = drag.startAxials?.get(st.id);
          if (a) tok.axial = { q: a.q, r: a.r };
        });


        setNotice("Too far. One or more heroes would exceed 30 miles. Make Camp to reset.");
        drag = null;
        rerenderAll();
        return;
      }


      // Commit miles to everyone who moved
      for (const tokId of movedIds) {
        const tok = getTokenById(tokId);
        if (!tok) continue;
        tok.milesUsed = (Number(tok.milesUsed) || 0) + milesMoved;
      }

        // TRAVEL EVENT (max once per day)
const dayNow = Number(state.travel.day) || 1;

// If no threshold exists for today, create one
if (!state.travel.nextTravelEventAtMiles || state.travel.nextTravelEventAtMiles <= 0) {
  state.travel.nextTravelEventAtMiles = 6 + Math.floor(Math.random() * 19); // 6–24
}

// Only trigger once per day
if (state.travel.travelEventDay !== dayNow) {
  const anchorNow = getTokenById(drag.anchorId);
  const milesNow = Number(anchorNow?.milesUsed) || 0;

  if (milesNow >= state.travel.nextTravelEventAtMiles) {
    const prov = state.travel?.provinceId || "northern_province";
    const db = EVENT_DB;

    if (db?.provinces?.[prov]?.travel_events?.length) {
      const ev = pickRandom(db.provinces[prov].travel_events);
      if (ev) {
        openEventModal("travel", ev);
        state.travel.travelEventDay = dayNow; // lock for the day
      }
    }
  }
}

      travelFocusId = anchorTok.id;


      // Optional notice if the anchor hits max
      if ((Number(anchorTok.milesUsed) || 0) >= 30) {
        setNotice(`${anchorTok.initial} has reached 30 miles. Make Camp to reset.`);
      }
    }
  }


  drag = null;
  saveNow();
  rerenderAll();
}


tokenLayer.addEventListener("pointerup", onTokenPointerUp);
window.addEventListener("pointerup", onTokenPointerUp);


  // Optional: mouse wheel to resize selected tokens (hover token)
  tokenLayer.addEventListener("wheel", (e) => {
    const elTok = e.target.closest(".explorer-token");
    if (!elTok) return;


    // Prevent page scroll while resizing
    e.preventDefault();


    const delta = (e.deltaY < 0) ? 2 : -2;
    changeSelectedTokenSize(delta);
  }, { passive: false });


  // Cleanup when navigating away
  // Cleanup when navigating away
window.__explorerCleanup = () => {
  window.removeEventListener("resize", onResize);
  document.removeEventListener("fullscreenchange", onResize);
  window.removeEventListener("keydown", onKeyToggleUi);
  window.removeEventListener("pointerup", onTokenPointerUp);
  tokenLayer.removeEventListener("pointerup", onTokenPointerUp);
};
}

// 🔴 ADD THIS LINE
renderExplorer();

})();
