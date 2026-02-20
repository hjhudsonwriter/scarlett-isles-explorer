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
// Map presets (loaded from /assets)
// -------------------------------
// IMPORTANT: Update file extensions if yours are .jpg instead of .png
// -------------------------------
// Map presets (loaded from /assets/maps)
// Your actual files are .jpg and some provinces are split into multiple maps.
// -------------------------------
const MAP_PRESETS = [
  { id: "eastern_province_north",  label: "Eastern Province (North)",  src: withBase("assets/maps/eastern_province_north.jpg") },
  { id: "eastern_province_south",  label: "Eastern Province (South)",  src: withBase("assets/maps/eastern_province_south.jpg") },

  { id: "midland_province",        label: "Midland Province",          src: withBase("assets/maps/midland_province.jpg") },

  { id: "northern_province_east",  label: "Northern Province (East)",  src: withBase("assets/maps/northern_province_east.jpg") },
  { id: "northern_province_west",  label: "Northern Province (West)",  src: withBase("assets/maps/northern_province_west.jpg") },

  { id: "southern_province_east",  label: "Southern Province (East)",  src: withBase("assets/maps/southern_province_east.jpg") },
  { id: "southern_province_west",  label: "Southern Province (West)",  src: withBase("assets/maps/southern_province_west.jpg") },

  { id: "the_east_isle",           label: "The East Isle",             src: withBase("assets/maps/the_east_isle.jpg") },
  { id: "the_north_isle",          label: "The North Isle",            src: withBase("assets/maps/the_north_isle.jpg") },

  { id: "western_province_south",  label: "Western Province (South)",  src: withBase("assets/maps/western_province_south.jpg") }
];

// Map -> Province for event grouping
function mapIdToProvinceId(mapId){
  // Isles map 1:1
  if (mapId === "the_north_isle") return "the_north_isle";
  if (mapId === "the_east_isle")  return "the_east_isle";

  // Split province maps map back to their main event bucket
  if (mapId.startsWith("northern_province")) return "northern_province";
  if (mapId.startsWith("midland_province"))  return "midland_province";
  if (mapId.startsWith("eastern_province"))  return "eastern_province";
  if (mapId.startsWith("southern_province")) return "southern_province";
  if (mapId.startsWith("western_province"))  return "western_province";

  // Fallback
  return "northern_province";
}
    // -------------------------------
// Explorer Events (data/events.json)
// -------------------------------
const EVENTS_URL = withBase("data/events.json");
    const MARKERS_URL = withBase("data/markers.json");
let MARKER_DB = null;

async function loadMarkerDb(){
  try{
    const res = await fetch(MARKERS_URL, { cache: "no-cache" });
    if(!res.ok) throw new Error(`Failed to load markers.json (${res.status})`);
    MARKER_DB = await res.json();
    return MARKER_DB;
  }catch(err){
    console.warn("Markers DB failed to load:", err);
    MARKER_DB = null;
    return null;
  }
}

    // -------------------------------
// Main Campaign (forced) events
// -------------------------------
const MAIN_EVENTS = [
  {
    id: "tide_remembers_prologue",
    title: "The Tide Remembers - Prologue",
    steps: [
      {
        id: "start",
        image: withBase("assets/main_events/tide_remembers_1.png"),
        text: "As you make your way through the Isles, a bird descends from the sky, swooping down towards your group.",
        choices: [{ label: "Continue", next: "step2" }]
      },
      {
        id: "step2",
        image: withBase("assets/main_events/tide_remembers_2.png"),
        text: "The bird slows its flight, wings flapping as it lands softly on Magnus' outstretched arm. A roll of parchment is fastened to the birds leg. You carefully remove it, and the bird takes flight.",
        choices: [{ label: "Continue", next: "step3" }]
      },
      {
        id: "step3",
        image: withBase("assets/main_events/tide_remembers_3.png"),
        text:
`You unroll the parchment, the message reads:

Friends of the East...
I will not ask you to act yet, but if you are as I remember you to be, you may want to stand witness to the turning of the tide.
And believe me, the tide is turning.
Will you go to it, or be carried by it?

- Maerys Vell, The Voice of The Tide`,
        choices: [{ label: "Close" }]
      }
    ]
  },
      {
    id: "turning_tide",
    title: "The Turning Tide",
    steps: [
      { id: "start", image: withBase("assets/main_events/turning_tide_1.png"), text: "", choices: [{ label: "Continue", next: "t2" }] },
      { id: "t2",    image: withBase("assets/main_events/turning_tide_2.png"), text: "", choices: [{ label: "Continue", next: "t3" }] },
      { id: "t3",    image: withBase("assets/main_events/turning_tide_3.png"), text: "", choices: [{ label: "Continue", next: "t4" }] },
      { id: "t4",    image: withBase("assets/main_events/turning_tide_4.png"), text: "", choices: [{ label: "Continue", next: "t5" }] },
      { id: "t5",    image: withBase("assets/main_events/turning_tide_5.png"), text: "", choices: [{ label: "Continue", next: "t6" }] },
      { id: "t6",    image: withBase("assets/main_events/turning_tide_6.png"), text: "", choices: [{ label: "Continue", next: "t7" }] },
      { id: "t7",    image: withBase("assets/main_events/turning_tide_7.png"), text: "", choices: [{ label: "Continue", next: "t8" }] },
      { id: "t8", image: withBase("assets/main_events/turning_tide_8.png"), text: "", choices: [{ label: "Close" }] }
    ]
  }
];

function getMainEventById(id){
  return MAIN_EVENTS.find(e => e.id === id) || null;
}

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
// Weather Events (table roll input)
// Max 1 every 3 days (cooldown)
// -------------------------------
const WEATHER_EVENTS = [
  {
    id: "white_blizzard",
    title: "White Blizzard",
    kind: "blizzard",
    intro:
      "Snow comes suddenly, swallowing colour and distance. The world becomes a white corridor, and every breath feels borrowed.",
    mechanic: {
      label: "Group DC 13 Constitution Save",
      dc: 13,
      options: null // no choice
    },
    resolve(roll){
      if (roll >= 13) {
        return {
          headline: "Success",
          text: "You keep blood moving and breath steady. The blizzard bites, but takes nothing.",
          effect: "No effect."
        };
      }
      return {
        headline: "Failure",
        text: "Cold seeps into joints and resolve. The day costs more than it should.",
        effect: "Each character gains 1 level of Exhaustion."
      };
    }
  },

  {
    id: "black_storm",
    title: "Black Storm",
    kind: "storm",
    intro:
      "A storm front rolls over the Isles like a closing fist. Wind lashes the grass flat, and thunder prowls just beyond the hills.",
    mechanic: {
      label: "DC 14 Save (choose one)",
      dc: 14,
      options: [
        { id: "wis", label: "Wisdom Save (hold your nerve)" },
        { id: "dex", label: "Dexterity Save (dodge debris/mud)" }
      ]
    },
    resolve(roll){
      if (roll >= 14) {
        return {
          headline: "Success",
          text: "You ride the chaos instead of being ridden by it. Adrenaline turns into focus.",
          effect: "Gain Inspiration (for the next day)."
        };
      }
      return {
        headline: "Failure",
        text: "The thunder gets under your skin. Every snap of wind feels like an ambush.",
        effect: "Rattled: no Reactions or Opportunity Attacks in the next day’s first combat encounter."
      };
    }
  },

  {
    id: "cold_rain",
    title: "Cold Downpour",
    kind: "rain",
    intro:
      "Rain needles through seams and straps. The road slicks, sounds carry oddly, and your pace becomes a negotiation.",
    mechanic: {
      label: "DC 12 Survival Check",
      dc: 12,
      options: null
    },
    resolve(roll){
      if (roll >= 17) {
        return {
          headline: "Great Success",
          text: "You find a dry pocket of ground and a forgotten cache tucked beneath roots and stone.",
          effect: "Dry Cache: roll on a minor loot table."
        };
      }
      if (roll >= 12) {
        return {
          headline: "Success",
          text: "You keep gear dry enough and spirits steady. Miserable, but manageable.",
          effect: "No effect."
        };
      }
      return {
        headline: "Failure",
        text: "Everything is damp. Bowstrings slacken, armour sticks, and boots feel like anchors.",
        effect: "Soggy Gear: Disadvantage on Initiative rolls for the next day."
      };
    }
  },

  {
    id: "sun_heatwave",
    title: "Sun & Heatwave",
    kind: "sun_heat",
    intro:
      "The sun presses down like a weight. Water warms, tempers shorten, and the road shimmers ahead in wavering ribbons.",
    mechanic: {
      label: "DC 13 Check/Save (choose one)",
      dc: 13,
      options: [
        { id: "ath", label: "Athletics (push through the heat)" },
        { id: "con", label: "Constitution Save (endure and pace yourself)" }
      ]
    },
    resolve(roll){
      if (roll >= 13) {
        return {
          headline: "Success",
          text: "You find shade and a cooler draft, maybe even a thin spring trickling through stone.",
          effect: "No effect."
        };
      }
      return {
        headline: "Failure",
        text: "The heat steals distance and sharpness. Every mile feels doubled.",
        effect: "Lethargy: limit travel to 2 hexes (12 miles) today."
      };
    }
  }
];

function pickRandomWeather(){
  return WEATHER_EVENTS[Math.floor(Math.random() * WEATHER_EVENTS.length)];
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
      freeMove: false,
    // Either a preset map (mapSrc) or an uploaded map (mapDataUrl)
    mapSrc: null,
    mapPresetId: null,
    mapDataUrl: null,


    snap: {
      enabled: false
    },


    travel: {
  day: 1,
  milesUsed: 0,
  forcedMainEvent: null, // { id: string, dueDay: number }
  forcedMainEventFired: false,

  // NEW: which region we’re currently traveling in
  provinceId: "northern_province",

  // NEW: travel event rules (max 1 per day)
  travelEventDay: 0,          // day number we last triggered a travel event
  nextTravelEventAtMiles: 0,   // random mileage threshold for today
      
  lastWeatherDay: -999,        // cooldown tracking
  activeWeather: null,         // { kind:"rain"|"storm"|"blizzard", day:number }
  weatherEventDay: 0           // day number weather last triggered (extra safety)
},


      grid: {
      enabled: true,
      r: 38,
      offsetX: 0,
      offsetY: 0,
      opacity: 0.35
    },


    fog: {
  enabled: false,
  // revealedByMapKey: { [mapKey]: { "q,r": true, ... } }
  revealedByMapKey: {}
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
        <div class="explorer-group">
  <span class="muted tiny">Map</span>
  <select id="explorerMapPreset" class="btn ghost" style="padding:8px 10px;border-radius:14px;">
    <option value="">(choose)</option>
    ${MAP_PRESETS.map(m => `<option value="${m.id}">${m.label}</option>`).join("")}
  </select>
  <button class="btn" id="explorerLoadPreset" type="button">Load</button>
</div>

<label class="btn">
  Upload map
  <input id="explorerMapUpload" type="file" accept="image/*" hidden />
</label>


        <button class="btn ghost" id="explorerClearMap" type="button">Clear map</button>
        <button class="btn ghost" id="explorerFullscreen" type="button">Fullscreen</button>
        <button class="btn ghost" id="explorerHideUi" type="button">Hide UI</button>


        <span class="explorer-divider"></span>


        <button class="btn" id="explorerGridToggle" type="button">Hex Grid: On</button>
        <button class="btn ghost" id="explorerFogToggle" type="button">Fog of War: Off</button>
        <button class="btn ghost" id="explorerFogReset" type="button">Reset Fog</button>
        <button class="btn ghost" id="explorerSnapToggle" type="button">Snap: Off</button>
        <span class="explorer-divider"></span>
<button class="btn ghost" id="explorerExportSave" type="button">Export Save</button>
<button class="btn ghost" id="explorerImportSave" type="button">Import Save</button>
<input id="explorerImportFile" type="file" accept="application/json" hidden />



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
          <div id="explorerMarkers" class="explorer-markers"></div>
<canvas id="explorerFog" class="explorer-fog"></canvas>
<video id="explorerWeatherVideo" class="explorer-weatherVideo" muted playsinline loop></video>
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

        <span class="muted">• Gold:</span>
        <strong id="explorerGold">0</strong>

        <span class="muted">•</span>
        <span id="explorerNotice" class="tiny" style="opacity:.9"></span>
      </div>
      <div id="explorerMilesList" class="explorer-milesList"></div>
    </div>


   <div class="explorer-travelRight">
  <button class="btn ghost" id="explorerResetTravel" type="button">Reset Travel</button>
  <button class="btn ghost" id="explorerFreeMove" type="button">Free Move: OFF</button>
  <button class="btn" id="explorerMakeCamp" type="button">Make Camp</button>
  <div class="explorer-mainEventTools">
  <select id="explorerMainEventSelect" class="explorer-mainEventSelect">
    <option value="">Force Main Campaign Event…</option>
  </select>
  <button class="btn" id="explorerQueueMainEvent" type="button">Queue</button>
</div>
</div>
  </div>
</div>
<!-- Events modal (lives INSIDE #explorerFsWrap for fullscreen safety) -->
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

    <div class="evModal_media" id="evMedia" style="display:none;"></div>
<div class="evModal_desc" id="evDesc">—</div>
<div class="evModal_prompt" id="evPrompt" style="display:none;"></div>
<div class="evChoices" id="evChoices"></div>
  </div>
</div>

<!-- Submap (clickable marker) modal -->
<div class="mkModal" id="mkModal" aria-hidden="true">
  <div class="mkModal_backdrop" id="mkBackdrop"></div>

  <div class="mkModal_card" role="dialog" aria-modal="true" aria-labelledby="mkTitle">
    <div class="mkModal_top">
      <div>
        <div class="mkModal_type" id="mkMeta">Location</div>
        <h3 class="mkModal_title" id="mkTitle">—</h3>
      </div>
      <button class="btn ghost mkModal_close" id="mkClose" type="button">Close</button>
    </div>

    <div class="mkModal_media" id="mkMedia"></div>
    <div class="mkModal_desc" id="mkDesc"></div>
  </div>
</div>

</div> <!-- end explorer-fswrap -->
</div> <!-- end explorer-wrap -->
  `;


  const root = view;
  const mapUpload = root.querySelector("#explorerMapUpload");
  const mapPresetSel = root.querySelector("#explorerMapPreset");
  const btnLoadPreset = root.querySelector("#explorerLoadPreset");  
  const btnClear = root.querySelector("#explorerClearMap");
  const btnFs = root.querySelector("#explorerFullscreen");
  const btnHideUi = root.querySelector("#explorerHideUi");
  const btnSnapToggle = root.querySelector("#explorerSnapToggle");
  const btnExportSave = root.querySelector("#explorerExportSave");
  const btnImportSave = root.querySelector("#explorerImportSave");
  const importFile = root.querySelector("#explorerImportFile");
  


const dayLabel = root.querySelector("#explorerDayLabel");
const milesUsedEl = root.querySelector("#explorerMilesUsed");
const milesLeftEl = root.querySelector("#explorerMilesLeft");
  const milesListEl = root.querySelector("#explorerMilesList");
const modeEl = root.querySelector("#explorerMode");
const effectsEl = root.querySelector("#explorerEffects");
const goldEl = root.querySelector("#explorerGold");
const noticeEl = root.querySelector("#explorerNotice");
const btnMakeCamp = root.querySelector("#explorerMakeCamp");
  const mainEventSel = root.querySelector("#explorerMainEventSelect");
  const btnQueueMainEvent = root.querySelector("#explorerQueueMainEvent");
  const btnFreeMove = root.querySelector("#explorerFreeMove");

    // Populate forced-event dropdown
if (mainEventSel) {
  MAIN_EVENTS.forEach(ev => {
    const opt = document.createElement("option");
    opt.value = ev.id;
    opt.textContent = ev.title;
    mainEventSel.appendChild(opt);
  });
}

function queueMainEvent(id){
  const ev = getMainEventById(id);
  if (!ev) return;

  // Fire instantly
  openEventModal("main", ev);

  // Clear any previously queued main event state (keeps things tidy)
  if (state.travel) {
    state.travel.forcedMainEvent = null;
    state.travel.forcedMainEventFired = false;
  }

  saveNow();
  setNotice("Main Campaign event triggered.");
}

btnQueueMainEvent?.addEventListener("click", () => {
  const id = String(mainEventSel?.value || "").trim();
  if (!id) {
    alert("Select a Main Campaign event first.");
    return;
  }
  queueMainEvent(id);
});

function updateFreeMoveUI(){
  if(!btnFreeMove) return;
  btnFreeMove.textContent = state.freeMove ? "Free Move: ON" : "Free Move: OFF";
}
btnFreeMove?.addEventListener("click", () => {
  state.freeMove = !state.freeMove;
  saveNow();
  updateFreeMoveUI();
  setNotice(state.freeMove ? "Free Move enabled: miles/events paused." : "Free Move disabled.");
});
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
const evMedia = root.querySelector("#evMedia");
const evPrompt = root.querySelector("#evPrompt");
const evChoices = root.querySelector("#evChoices");

// Marker modal elements
const mkModal = root.querySelector("#mkModal");
const mkBackdrop = root.querySelector("#mkBackdrop");
const mkClose = root.querySelector("#mkClose");
const mkMeta = root.querySelector("#mkMeta");
const mkTitle = root.querySelector("#mkTitle");
const mkDesc = root.querySelector("#mkDesc");
const mkMedia = root.querySelector("#mkMedia");    

  function stripAmbientLine(text){
  if(!text) return text;
  return String(text).replace(/\s*The air carries cold pines, crags, old stone roads, watchposts, buckbear heraldry\.\s*/g, " ").trim();
}
    
  function applyOutcome(outcome){
  if(!outcome) return;

  // Safe state bucket
  if(!state.trackers || typeof state.trackers !== "object"){
    state.trackers = { gold: 0, log: [] };
  }
  if(!Number.isFinite(state.trackers.gold)) state.trackers.gold = 0;
  if(!Array.isArray(state.trackers.log)) state.trackers.log = [];

  // Numbers
  if(Number.isFinite(outcome.gold)) state.trackers.gold += outcome.gold;

  // Log / note
  const note = outcome.note ? String(outcome.note) : "";
  if(note.trim()){
    const stamp = `Day ${Number(state.travel?.day)||1}`;
    state.trackers.log.unshift(`${stamp}: ${note.trim()}`);
  }

  // Show a visible outcome summary (so it doesn't feel like nothing happened)
const parts = [];
if (Number.isFinite(outcome.gold) && outcome.gold !== 0) parts.push(`${outcome.gold > 0 ? "+" : ""}${outcome.gold} gold`);
if (Number.isFinite(outcome.rations) && outcome.rations !== 0) parts.push(`${outcome.rations > 0 ? "+" : ""}${outcome.rations} rations`);
if (outcome.note && String(outcome.note).trim()) parts.push(String(outcome.note).trim());

if (parts.length) {
  setNotice(`Outcome: ${parts.join(" • ")}`);
}
  saveNow();
}

function openEventModal(kind, event){
  if(!evModal) return;

  const prov = state.travel?.provinceId || "northern_province";
const kindLabel =
  kind === "main" ? "Main Campaign"
: kind === "camp" ? "Campfire Event"
: kind === "weather" ? "Weather"
: "Travel Event";

  evMeta.textContent = `${kindLabel} • ${provinceLabel(prov)} • ${event?.type || "—"}`;
  evTitle.textContent = event?.title || "Unknown Event";
    evModal.classList.toggle("isMain", kind === "main");

  // ------- NEW: steps support (backwards compatible) -------
  const hasSteps = Array.isArray(event?.steps) && event.steps.length;

  // Helper to render a single step (new format)
  function renderStep(stepId){
  const steps = event.steps;
  const step = steps.find(s => s.id === stepId) || steps[0];

  // Media (optional)
if (evMedia) {
  const imgSrc = step?.image ? String(step.image) : "";
  if (imgSrc) {
    evMedia.style.display = "block";
    evMedia.innerHTML = `<img src="${imgSrc}" alt="">`;
  } else {
    evMedia.style.display = "none";
    evMedia.innerHTML = "";
  }
}
  evDesc.textContent = stripAmbientLine(step?.text || "—");

  // No separate prompt field in step format (text is the content)
  evPrompt.style.display = "none";
  evPrompt.textContent = "";

  evChoices.innerHTML = "";

  const choices = Array.isArray(step?.choices) ? step.choices : [];

  // If a step somehow has no choices, just provide a Close button.
  if(!choices.length){
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn";
    b.textContent = "Close";
    b.addEventListener("click", closeEventModal);
    evChoices.appendChild(b);
    return;
  }

  // Normal choices
  choices.forEach((ch) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn";
    b.textContent = ch?.label || "Continue";

    b.addEventListener("click", () => {
      // next step
      if (ch && ch.next) {
        renderStep(String(ch.next));
        return;
      }

      // outcome: apply, then show a readable result screen (do NOT auto-close)
      if (ch && ch.outcome) {
        const o = ch.outcome;

        applyOutcome(o);

        // Render an "Outcome" view inside the same modal
        evMeta.textContent = "Outcome";
        evTitle.textContent = "Result";

        const resultText =
          (o && o.text) ? String(o.text)
          : (o && o.note) ? String(o.note)
          : "The moment passes, leaving only the road ahead.";

        evDesc.textContent = resultText;

        evPrompt.style.display = "none";
        evPrompt.textContent = "";

        evChoices.innerHTML = "";
        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "btn";
        closeBtn.textContent = "Close";
        closeBtn.addEventListener("click", closeEventModal);
        evChoices.appendChild(closeBtn);

        return;
      }

      // no outcome, no next: just close
      closeEventModal();
    });

    evChoices.appendChild(b);
  });
}

  if(hasSteps){
    // Start at step 0 or "start" if present
    const startId = event.steps.some(s => s.id === "start") ? "start" : String(event.steps[0].id || "start");
    renderStep(startId);
  } else {
    // ------- OLD FORMAT (unchanged) -------
    if (evMedia) {
  evMedia.style.display = "none";
  evMedia.innerHTML = "";
}
evDesc.textContent = stripAmbientLine(event?.description || "—");

    if(event?.prompt){
      evPrompt.style.display = "block";
      evPrompt.textContent = event.prompt;
    } else {
      evPrompt.style.display = "none";
      evPrompt.textContent = "";
    }

    evChoices.innerHTML = "";
    const choices = Array.isArray(event?.choices) ? event.choices : [];
    if(choices.length){
      choices.forEach((c) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.textContent = String(c);
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
  }

  evModal.classList.add("isOpen");
  evModal.setAttribute("aria-hidden", "false");
}

  function openWeatherModal(wev){
  const dayNow = Number(state.travel?.day) || 1;

  // Build clear mechanic text for the modal body
  const mech = wev?.mechanic || {};
  const dc = Number(mech.dc) || 0;
  const mechLine = mech.label ? `${mech.label}` : (dc ? `DC ${dc}` : "Roll at the table");

  // Open as a WEATHER modal (not travel)
  openEventModal("weather", {
    title: wev.title,
    steps: [
      {
        id: "start",
        image: "", // overlay is the visual
        text:
`${wev.intro}

ROLL: ${mechLine}

Enter the final table roll result below to resolve the weather’s effect.`,
        choices: [] // we will provide our own single Resolve button
      }
    ]
  });

  // Inject a single, unambiguous roll control into evPrompt
  if (!evPrompt) return;

  const hasOptions = Array.isArray(mech.options) && mech.options.length > 0;

  evPrompt.style.display = "block";
  evPrompt.innerHTML = `
    <div class="evRollRow" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
      ${hasOptions ? `
        <select id="weatherRollType"
          style="min-width:260px; padding:10px 12px; border-radius:12px; border:1px solid rgba(212,175,55,.25); background:rgba(0,0,0,.35); color:rgba(245,242,234,.95); font-size:16px;">
          ${mech.options.map(o => `<option value="${o.id}">${o.label}</option>`).join("")}
        </select>
      ` : ``}

      <label class="muted" for="weatherRollInput" style="font-size:16px;">Roll (d20):</label>

      <input id="weatherRollInput" type="number" inputmode="numeric"
        style="width:140px; padding:10px 12px; border-radius:12px; border:1px solid rgba(212,175,55,.25); background:rgba(0,0,0,.35); color:rgba(245,242,234,.95); font-size:18px;">

      <button class="btn" id="weatherRollResolve" type="button">Resolve</button>
    </div>

    <div class="muted" style="margin-top:10px; font-size:15px;">
      Tip: Roll at the table, then type the final result here (after modifiers).
    </div>
  `;

  const input = evPrompt.querySelector("#weatherRollInput");
  const sel = evPrompt.querySelector("#weatherRollType");
  const resolveBtn = evPrompt.querySelector("#weatherRollResolve");

  const resolveRoll = () => {
    const roll = Number(input?.value);
    if (!Number.isFinite(roll)) {
      alert("Enter a valid roll number.");
      return;
    }

    // Apply overlay for remainder of THIS day
    state.travel.activeWeather = { kind: wev.kind, day: dayNow };
    saveNow();
    applyWeatherOverlay();

    // Resolve outcome text
    const result = wev.resolve ? wev.resolve(roll, sel ? String(sel.value) : null) : null;

    const headline = result?.headline ? String(result.headline) : "Result";
    const body = result?.text ? String(result.text) : "The weather passes.";
    const effect = result?.effect ? String(result.effect) : "";

    evMeta.textContent = `Weather • ${provinceLabel(state.travel?.provinceId || "northern_province")}`;
    evTitle.textContent = `${wev.title} (${headline})`;

    evDesc.textContent = effect ? `${body}\n\nEFFECT: ${effect}` : body;

    // Hide roll prompt after resolving
    evPrompt.style.display = "none";
    evPrompt.innerHTML = "";

    // One clear close button
    evChoices.innerHTML = "";
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn";
    b.textContent = "Close";
    b.addEventListener("click", closeEventModal);
    evChoices.appendChild(b);
  };

  resolveBtn?.addEventListener("click", resolveRoll);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") resolveRoll();
  });
}

  function closeEventModal(){
  if(!evModal) return;
  evModal.classList.remove("isOpen");
  evModal.setAttribute("aria-hidden", "true");
}

    function openMarkerModal(marker){
  if(!mkModal) return;

  mkMeta.textContent = "Location";
  mkTitle.textContent = marker?.label || "Location";
  mkDesc.textContent = marker?.description ? String(marker.description) : "";

  const img = marker?.submapImage ? String(marker.submapImage) : "";
  if (mkMedia) {
    mkMedia.innerHTML = img ? `<img src="${withBase(img)}" alt="">` : "";
  }

  mkModal.classList.add("isOpen");
  mkModal.setAttribute("aria-hidden", "false");
}

function closeMarkerModal(){
  if(!mkModal) return;
  mkModal.classList.remove("isOpen");
  mkModal.setAttribute("aria-hidden", "true");
}

// Close modal
evClose?.addEventListener("click", closeEventModal);
evBackdrop?.addEventListener("click", closeEventModal);
mkClose?.addEventListener("click", closeMarkerModal);
mkBackdrop?.addEventListener("click", closeMarkerModal);    


  const btnTokSm = root.querySelector("#explorerTokSm");
  const btnTokLg = root.querySelector("#explorerTokLg");
  const btnGroup = root.querySelector("#explorerGroup");
  const btnUngroup = root.querySelector("#explorerUngroup");


  const stage = root.querySelector("#explorerStage");
  const fsWrap = root.querySelector("#explorerFsWrap");
  const world = root.querySelector("#explorerWorld");
  const mapImg = root.querySelector("#explorerMap");
    const markerLayer = root.querySelector("#explorerMarkers");
  const gridCanvas = root.querySelector("#explorerGrid");
  const tokenLayer = root.querySelector("#explorerTokens");
  tokenLayer.style.touchAction = "none";
stage.style.touchAction = "none";
    const weatherVideo = root.querySelector("#explorerWeatherVideo");
  const marquee = root.querySelector("#explorerMarquee");
    const fogCanvas = root.querySelector("#explorerFog");
const btnFogToggle = root.querySelector("#explorerFogToggle");
    const btnFogReset = root.querySelector("#explorerFogReset");


  // Load state (merge defaults)
  const saved = explorerLoad();
  const state = explorerDefaultState();


  if (typeof saved.mapSrc === "string") state.mapSrc = saved.mapSrc;
  if (typeof saved.mapPresetId === "string") state.mapPresetId = saved.mapPresetId;
  if (typeof saved.mapDataUrl === "string") state.mapDataUrl = saved.mapDataUrl;
  if (saved.grid) state.grid = { ...state.grid, ...saved.grid };
  if (saved.snap) state.snap = { ...state.snap, ...saved.snap };
    if (typeof saved.freeMove === "boolean") state.freeMove = saved.freeMove;
if (saved.travel) state.travel = { ...state.travel, ...saved.travel };
    if (saved.fog) state.fog = { ...state.fog, ...saved.fog };


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
  freeMove: state.freeMove,
  mapSrc: state.mapSrc,
  mapPresetId: state.mapPresetId,
  mapDataUrl: state.mapDataUrl,
  snap: state.snap,
  travel: state.travel,
  grid: state.grid,
fog: state.fog,
tokens: state.tokens
});
  }
// -------------------------------
// Export / Import Save (JSON)
// -------------------------------
function buildSavePayload(){
  // IMPORTANT: keep identical to what saveNow() persists
  return {
    freeMove: state.freeMove,
    mapSrc: state.mapSrc,
    mapPresetId: state.mapPresetId,
    mapDataUrl: state.mapDataUrl,
    snap: state.snap,
    travel: state.travel,
    grid: state.grid,
    fog: state.fog,
    tokens: state.tokens
  };
}

function downloadJson(filename, obj){
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function safeParseJson(text){
  try { return JSON.parse(text); } catch { return null; }
}

function looksLikeExplorerSave(obj){
  if(!obj || typeof obj !== "object") return false;
  // Minimal shape checks (don’t be strict, just safe)
  if(!("grid" in obj)) return false;
  if(!("tokens" in obj) || !Array.isArray(obj.tokens)) return false;
  if(!("travel" in obj)) return false;
  return true;
}

btnExportSave?.addEventListener("click", () => {
  // ensure latest is saved
  saveNow();

  const payload = buildSavePayload();
  const day = Number(payload?.travel?.day) || 1;
  const map = payload.mapPresetId || "custom";
  const stamp = new Date().toISOString().slice(0,10);
  downloadJson(`scarlett_isles_explorer_save_${map}_day${day}_${stamp}.json`, payload);

  setNotice("Save exported.");
});

btnImportSave?.addEventListener("click", () => {
  importFile?.click();
});

importFile?.addEventListener("change", async () => {
  const file = importFile.files && importFile.files[0];
  if(!file) return;

  const text = await file.text();
  const obj = safeParseJson(text);

  if(!looksLikeExplorerSave(obj)){
    alert("That file doesn’t look like a Scarlett Isles Explorer save JSON.");
    importFile.value = "";
    return;
  }

  // Overwrite localStorage save
  explorerSave(obj);

  // Easiest + safest: hard reload to rebuild state cleanly
  setNotice("Save imported. Reloading…");
  setTimeout(() => location.reload(), 250);
});


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


  // ---------- Fog of War (radius 2, persistent per map) ----------
function hashStringDJB2(str){
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function currentMapKey(){
  if (state.mapPresetId) return `preset:${state.mapPresetId}`;
  if (state.mapSrc) return `src:${state.mapSrc}`;
  if (state.mapDataUrl) return `upload:${hashStringDJB2(state.mapDataUrl)}`;
  return "none";
}

function ensureFogStore(){
  if (!state.fog || typeof state.fog !== "object") {
    state.fog = { enabled:false, revealedByMapKey:{} };
  }
  if (!state.fog.revealedByMapKey || typeof state.fog.revealedByMapKey !== "object") {
    state.fog.revealedByMapKey = {};
  }
  const key = currentMapKey();
  if (!state.fog.revealedByMapKey[key]) state.fog.revealedByMapKey[key] = {};
  return state.fog.revealedByMapKey[key];
}

function revealAxialRadius(center, radius = 2){
  if (!center || !Number.isFinite(center.q) || !Number.isFinite(center.r)) return;
  const store = ensureFogStore();
  for (let dq = -radius; dq <= radius; dq++){
    for (let dr = -radius; dr <= radius; dr++){
      const q = center.q + dq;
      const r = center.r + dr;
      const cand = { q, r };
      if (hexDistance(center, cand) <= radius){
        store[`${q},${r}`] = true;
      }
    }
  }
}

function resizeFogCanvas(){
  if (!fogCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  const { w, h } = stageDims();
  fogCanvas.width = Math.floor(w * dpr);
  fogCanvas.height = Math.floor(h * dpr);
  fogCanvas.style.width = `${w}px`;
  fogCanvas.style.height = `${h}px`;
  const ctx = fogCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function fillHexPath(ctx, cx, cy, r){
  ctx.beginPath();
  for (let i = 0; i < 6; i++){
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawFog(){
  if (!fogCanvas) return;
  resizeFogCanvas();

  const ctx = fogCanvas.getContext("2d");
  const { w, h } = stageDims();
  ctx.clearRect(0, 0, w, h);

  if (!state.fog?.enabled) return;

  const key = currentMapKey();
  const store = ensureFogStore();
  const r = hexSize();

  // 1) paint full fog
  ctx.globalAlpha = 0.86;
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, w, h);

  // 2) punch holes for revealed hexes
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-out";

  // Only iterate visible range (same style as your grid draw)
  const pad = 3;
  const aTL = pixelToAxial(0, 0);
  const aTR = pixelToAxial(w, 0);
  const aBL = pixelToAxial(0, h);
  const aBR = pixelToAxial(w, h);

  const rs = [aTL.r, aTR.r, aBL.r, aBR.r];
  const rMin = Math.floor(Math.min(...rs)) - pad;
  const rMax = Math.ceil(Math.max(...rs)) + pad;

  const qs = [aTL.q, aTR.q, aBL.q, aBR.q];
  const qMin0 = Math.floor(Math.min(...qs)) - pad - 6;
  const qMax0 = Math.ceil(Math.max(...qs)) + pad + 6;

  for (let rr = rMin; rr <= rMax; rr++){
    for (let qq = qMin0; qq <= qMax0; qq++){
      if (!store[`${qq},${rr}`]) continue;

      const p = axialToPixel(qq, rr);
      if (p.x < -2 * r || p.x > w + 2 * r || p.y < -2 * r || p.y > h + 2 * r) continue;

      fillHexPath(ctx, p.x, p.y, r * 0.98);
      ctx.fill();
    }
  }

  ctx.globalCompositeOperation = "source-over";
}

function updateFogFromFocus(){
  if (!state.fog?.enabled) return;

  const focus = state.tokens.find(t => t.id === travelFocusId) || state.tokens[0];
  if (!focus) return;

  // Even if not snapped, round the token centre into an axial coord
  const { w, h } = stageDims();
  const px = (focus.x * w) + (focus.size / 2);
  const py = (focus.y * h) + (focus.size / 2);
  const a = axialRound(pixelToAxial(px, py));

  revealAxialRadius(a, 2);
  saveNow();
  drawFog();
}

    function updateFogToggleUI(){
  if (!btnFogToggle) return;
  btnFogToggle.textContent = `Fog of War: ${state.fog?.enabled ? "On" : "Off"}`;
  btnFogToggle.classList.toggle("ghost", !state.fog?.enabled);
}

btnFogToggle?.addEventListener("click", () => {
  if (!state.fog) state.fog = { enabled:false, revealedByMapKey:{} };
  state.fog.enabled = !state.fog.enabled;
  updateFogToggleUI();

  // If turning on, reveal immediately from current position
  if (state.fog.enabled) updateFogFromFocus();
  else drawFog();

  saveNow();
});
    
    btnFogReset?.addEventListener("click", () => {
  const key = currentMapKey();

  if (!state.fog) state.fog = { enabled:false, revealedByMapKey:{} };
  if (!state.fog.revealedByMapKey) state.fog.revealedByMapKey = {};

  // Clear just the current map’s fog memory
  state.fog.revealedByMapKey[key] = {};

  // If fog is on, immediately re-reveal around current position
  if (state.fog.enabled) {
    updateFogFromFocus();
  } else {
    drawFog();
    saveNow();
  }

  setNotice("Fog reset for this map.");
});

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
    // Trackers (safe defaults)
if (!state.trackers || typeof state.trackers !== "object") {
  state.trackers = { gold: 0, log: [] };
}
if (!Number.isFinite(state.trackers.gold)) state.trackers.gold = 0;
if (!Array.isArray(state.trackers.log)) state.trackers.log = [];

if (goldEl) goldEl.textContent = String(state.trackers.gold);



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
      drawFog();
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


  function applyWeatherOverlay(){
  if(!weatherVideo) return;

  const aw = state.travel?.activeWeather;
  const dayNow = Number(state.travel?.day) || 1;

  // If overlay is from a previous day, clear it
  if (aw && Number(aw.day) !== dayNow) {
    state.travel.activeWeather = null;
    saveNow();
  }

  const active = state.travel?.activeWeather;
  if(!active){
    weatherVideo.pause?.();
    weatherVideo.removeAttribute("src");
    weatherVideo.style.display = "none";
    return;
  }

  // Map kind to MP4
  const src =
  active.kind === "blizzard"  ? withBase("assets/overlays/blizzard_overlay.mp4") :
  active.kind === "storm"     ? withBase("assets/overlays/storm_overlay.mp4") :
  active.kind === "rain"      ? withBase("assets/overlays/rain_overlay.mp4") :
  active.kind === "sun_heat"  ? withBase("assets/overlays/sun_heat_overlay.mp4") :
  null;

  if(!src){
    weatherVideo.style.display = "none";
    return;
  }

  if (weatherVideo.getAttribute("src") !== src) {
    weatherVideo.setAttribute("src", src);
    weatherVideo.load?.();
  }

  weatherVideo.style.display = "block";

  // autoplay safely
  const p = weatherVideo.play?.();
  if(p && typeof p.catch === "function") p.catch(()=>{ /* ignore autoplay restrictions */ });
}

    function renderMarkers(){
  if(!markerLayer) return;

  markerLayer.innerHTML = "";

  const mapId = state.mapPresetId || "";
  if(!mapId) return; // only show markers on preset maps (safe & simple)

  const list = MARKER_DB?.markersByMapId?.[mapId];
  if(!Array.isArray(list) || !list.length) return;

  list.forEach(m => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "explorer-markerBtn";
    btn.style.left = `${(Number(m.x) || 0) * 100}%`;
    btn.style.top  = `${(Number(m.y) || 0) * 100}%`;

    const thumb = m.thumb ? withBase(String(m.thumb)) : "";
    btn.innerHTML = thumb ? `<img src="${thumb}" alt="">` : `<span style="font-size:28px;">✦</span>`;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openMarkerModal(m);
    });

    markerLayer.appendChild(btn);
  });
}
    function rerenderAll() {
    // Map
    // Map: uploaded map overrides preset map
if (state.mapDataUrl) {
  mapImg.src = state.mapDataUrl;
  mapImg.style.display = "block";
} else if (state.mapSrc) {
  mapImg.src = state.mapSrc;
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
    renderMarkers();    
    renderTokens();
    updateTravelUI();
    applyWeatherOverlay();    
  }


  // Initial render
  rerenderAll();
    updateFreeMoveUI();
  // Load events in the background
loadEventDb();
    loadMarkerDb().then(() => renderMarkers());

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
        updateFogFromFocus();


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
  // Upload overrides preset
  state.mapDataUrl = String(reader.result || "");
  state.mapSrc = null;
  state.mapPresetId = null;

  saveNow();
  rerenderAll();
};
    reader.readAsDataURL(file);
  }


  function onClearMap() {
    const ok = confirm("Clear the uploaded map? (Tokens/grid will remain.)");
    if (!ok) return;
    state.mapDataUrl = null;
    state.mapSrc = null;
    state.mapPresetId = null;  
    saveNow();
    rerenderAll();
  }


  function loadPresetMapById(mapId){
  const preset = MAP_PRESETS.find(m => m.id === mapId);
  if(!preset){
    alert("Preset map not found. Check MAP_PRESETS list in app.js.");
    return;
  }

  state.mapPresetId = preset.id;
  state.mapSrc = preset.src;

  // Clear uploaded map (so preset is used)
  state.mapDataUrl = null;

  // Auto-set province for events
  state.travel.provinceId = mapIdToProvinceId(preset.id);

  saveNow();
  rerenderAll();
  setNotice(`Map loaded: ${preset.id} • Events: ${state.travel.provinceId}`);
}
  mapUpload.addEventListener("change", onMapUpload);
  btnClear.addEventListener("click", onClearMap);
    // Preset dropdown init + Load button
if(mapPresetSel){
  mapPresetSel.value = state.mapPresetId || "";
}
btnLoadPreset?.addEventListener("click", () => {
  const id = mapPresetSel?.value;
  if(!id){
    alert("Pick a map from the dropdown first.");
    return;
  }
  loadPresetMapById(id);
});


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


  function maybeTriggerForcedMainEvent(){
  const queued = state.travel?.forcedMainEvent;
  if (!queued || state.travel?.forcedMainEventFired) return false;

  const dayNow = Number(state.travel?.day) || 1;
  const dueDay = Number(queued.dueDay) || (dayNow + 1);

  // Only trigger on/after due day
  if (dayNow < dueDay) return false;

  const ev = getMainEventById(queued.id);
  if (!ev) return false;

  openEventModal("main", ev);

  state.travel.forcedMainEventFired = true;
  state.travel.forcedMainEvent = null;
  saveNow();

  return true;
}

    // ---------- Make Camp ----------
btnMakeCamp.addEventListener("click", () => {
  // CAMPFIRE EVENT
  const prov = state.travel?.provinceId || "northern_province";
  const db = EVENT_DB;

  // If a forced main event is due, it replaces the campfire event.
if (!maybeTriggerForcedMainEvent()) {
  if (db?.provinces?.[prov]?.campfire_events?.length) {
    const ev = pickRandom(db.provinces[prov].campfire_events);
    if (ev) openEventModal("camp", ev);
  }
}

  // Advance day + reset miles (your existing behaviour)
state.travel.day = (Number(state.travel.day) || 1) + 1;
    // Clear any weather overlay from the previous day (weather lasts only "the remainder of that day")
if (state.travel.activeWeather) {
  state.travel.activeWeather = null;
}
    // ---------- Weather Event (max 1 every 3 days) ----------
const dayNow = Number(state.travel.day) || 1;
const last = Number(state.travel.lastWeatherDay) || -999;
const COOLDOWN_DAYS = 3;

// Optional chance so it doesn't happen exactly on cooldown every time
const WEATHER_CHANCE = 0.45;

if ((dayNow - last) >= COOLDOWN_DAYS && Math.random() < WEATHER_CHANCE) {
  const wev = pickRandomWeather();
  if (wev) {
    // Open a weather modal requiring a manual roll input
    openWeatherModal(wev);
    state.travel.lastWeatherDay = dayNow;
    state.travel.weatherEventDay = dayNow;
  }
}

/* NEW: every 7 days, reset per-player trackers + show bastion prompt */
if ((Number(state.travel.day) || 1) % 7 === 1) {
  // ensure trackers exist
  if (!state.trackers) state.trackers = { gold: 0, log: [] };
  if (!Number.isFinite(state.trackers.gold)) state.trackers.gold = 0;
  if (!Array.isArray(state.trackers.log)) state.trackers.log = [];

  // reset weekly (per-player)
  state.trackers.gold = 0;

  // optional: keep log, or clear it
  // state.trackers.log = [];

  // show prompt in the same modal style
  openEventModal("camp", {
    title: "Bastion Turn",
    steps: [{
      id: "start",
      text: "The Ironbow awaits your orders.",
      choices: [{
        label: "Close",
        outcome: { gold: 0, rations: 0, note: "Bastion turn prompt (weekly).", text: "The Ironbow awaits your orders." }
      }]
    }]
  });
}


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
if (!state.freeMove && (Number(anchor?.milesUsed) || 0) >= 30) return;


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

// ✅ Fog reveal should update live while dragging (NO save spam)
if (state.fog?.enabled) {
  revealAxialRadius(targetAx, 2);
  drawFog();
}

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
      // ✅ Fog reveal while free-dragging (NO save spam)
if (state.fog?.enabled) {
  const focus = state.tokens.find(t => t.id === travelFocusId) || state.tokens[0];
  if (focus) {
    const { w, h } = stageDims();
    const px = (focus.x * w) + (focus.size / 2);
    const py = (focus.y * h) + (focus.size / 2);
    const a = axialRound(pixelToAxial(px, py));
    revealAxialRadius(a, 2);
    drawFog();
  }
}
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
        // FREE MOVE: allow repositioning without miles/events/time changes
if (state.freeMove) {
  setNotice("Free Move: repositioned without spending miles.");
  drag = null;
  saveNow();
  rerenderAll();
  return;
}


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

  // If forced main event is due, it replaces the travel event.
  if (maybeTriggerForcedMainEvent()) {
    state.travel.travelEventDay = dayNow; // still counts as the day's travel event
  } else {
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
