// ======================
// DATI (MODIFICA TU)
// Catalogo: categorie -> rarità emoji -> lista items
// Preorder: categorie -> lista items (senza rarità)
// Ogni item: { name, number, note? }
// ======================

const catalog = {
  Funko:       { "🟥": [], "🟧": [], "🟨": [], "🟩": [], "◽": [] },
  Manga:       { "🟥": [], "🟧": [], "🟨": [], "🟩": [], "◽": [] },
  Figure:      { "🟥": [], "🟧": [], "🟨": [], "🟩": [], "◽": [] },
  WCF:         { "🟥": [], "🟧": [], "🟨": [], "🟩": [], "◽": [] },
  Videogiochi: { "🟥": [], "🟧": [], "🟨": [], "🟩": [], "◽": [] }
};

const preorder = {
  Funko: [],
  Manga: [],
  Figure: [],
  WCF: [],
  Videogiochi: []
};

// --- ESEMPI (puoi cancellarli)
catalog.Funko["🟥"].push({ name: "Esempio Funko", number: "92", note: "" });
catalog.Videogiochi["🟨"].push({ name: "Esempio Videogioco", number: "10", note: "Switch/PS5 ecc." });
preorder.Manga.push({ name: "Esempio Preorder Manga", number: "999", note: "In arrivo" });

// ======================
// CONFIG
// ======================
const RARITIES = ["🟥","🟧","🟨","🟩","◽"];
const CATALOG_CATS = ["Funko","Manga","Figure","WCF","Videogiochi"];

// MAPPATURA emoji -> nome cartella
const RARITY_FOLDER = {
  "🟥": "Rosso",
  "🟧": "Arancione",
  "🟨": "Giallo",
  "🟩": "Verde",
  "◽": "Bianco"
};

let currentView = "Funko";       // una categoria catalogo o "Preorder"
let currentRarity = "🟥";        // solo catalogo
let currentPreCat = "Funko";     // solo preorder
let query = "";

// ======================
// HELPERS
// ======================
const $ = (sel) => document.querySelector(sel);

function normalize(s){ return String(s || "").toLowerCase().trim(); }
function escapeHTML(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(str){ return escapeHTML(str); }

function matchesSearch(item){
  if(!query) return true;
  const q = normalize(query);
  return normalize(item.name).includes(q) || normalize(item.number).includes(q) || normalize(item.note).includes(q);
}

// Percorsi immagini: prova varie estensioni
function buildImageCandidatesForCatalog(category, rarityEmoji, number){
  const colorFolder = RARITY_FOLDER[rarityEmoji] || "Bianco";
  const base = `assets/catalog/${category}/${colorFolder}/${number}`;
  return [`${base}.jpeg`, `${base}.jpg`, `${base}.png`, `${base}.webp`];
}
function buildImageCandidatesForPreorder(preCat, number){
  const base = `assets/preorder/${preCat}/${number}`;
  return [`${base}.jpeg`, `${base}.jpg`, `${base}.png`, `${base}.webp`];
}

function imageTag(candidates, alt){
  return `
    <img
      src="${escapeAttr(candidates[0])}"
      data-fallback="${escapeAttr(candidates.slice(1).join("|"))}"
      alt="${escapeAttr(alt)}"
      loading="lazy"
    >
  `;
}

function enableImageFallback(){
  document.querySelectorAll("img[data-fallback]").forEach(img => {
    img.onerror = () => {
      const raw = img.getAttribute("data-fallback") || "";
      const list = raw.split("|").filter(Boolean);
      if(list.length === 0) return;
      img.src = list[0];
      const rest = list.slice(1);
      if(rest.length > 0) img.setAttribute("data-fallback", rest.join("|"));
      else img.removeAttribute("data-fallback");
    };
  });
}

function cardHTML({ name, number, note }, imgCandidates){
  const noteHTML = note ? `<div class="note">${escapeHTML(note)}</div>` : "";
  return `
    <article class="card">
      <div class="thumb">
        ${imageTag(imgCandidates, name)}
      </div>
      <div class="meta">
        <div class="title-row">
          <div class="name" title="${escapeAttr(name)}">${escapeHTML(name)}</div>
          <div class="number">${number ? `# ${escapeHTML(number)}` : ""}</div>
        </div>
        ${noteHTML}
      </div>
    </article>
  `;
}

// ======================
// TOOLBAR
// ======================
function renderToolbar(){
  const toolbar = $("#toolbar");

  if(currentView === "Preorder"){
    toolbar.innerHTML = `
      <div class="pills" role="list">
        ${CATALOG_CATS.map(c => `
          <button class="pill ${c===currentPreCat ? "is-active" : ""}" data-precat="${escapeAttr(c)}" role="listitem">
            ${escapeHTML(c)}
          </button>
        `).join("")}
      </div>
      <div class="stats" id="stats"></div>
    `;

    toolbar.querySelectorAll("[data-precat]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentPreCat = btn.getAttribute("data-precat");
        renderToolbar();
        renderContent();
      });
    });

    return;
  }

  toolbar.innerHTML = `
    <div class="pills" role="list">
      ${RARITIES.map(r => `
        <button class="pill ${r===currentRarity ? "is-active" : ""}" data-rarity="${escapeAttr(r)}" role="listitem">
          ${escapeHTML(r)}
        </button>
      `).join("")}
    </div>
    <div class="stats" id="stats"></div>
  `;

  toolbar.querySelectorAll("[data-rarity]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentRarity = btn.getAttribute("data-rarity");
      renderToolbar();
      renderContent();
    });
  });
}

// ======================
// CONTENUTO
// ======================
function renderContent(){
  const content = $("#content");
  const stats = $("#stats");

  if(currentView === "Preorder"){
    const list = (preorder[currentPreCat] || []).filter(matchesSearch);

    if(stats){
      stats.textContent = `Preorder • ${currentPreCat} • ${list.length} risultati` + (query ? ` • filtro: "${query}"` : "");
    }

    if(list.length === 0){
      content.innerHTML = `<div class="empty">Nessun preorder in <b>${escapeHTML(currentPreCat)}</b>.</div>`;
      return;
    }

    content.innerHTML = list.map(item => {
      const candidates = buildImageCandidatesForPreorder(currentPreCat, item.number);
      return cardHTML(item, candidates);
    }).join("");

    enableImageFallback();
    return;
  }

  const list = (catalog[currentView]?.[currentRarity] || []).filter(matchesSearch);

  if(stats){
    const folder = RARITY_FOLDER[currentRarity] || "";
    stats.textContent = `${currentView} • ${currentRarity} (${folder}) • ${list.length} risultati` + (query ? ` • filtro: "${query}"` : "");
  }

  if(list.length === 0){
    content.innerHTML = `<div class="empty">Nessun elemento in <b>${escapeHTML(currentView)}</b> ${escapeHTML(currentRarity)}.</div>`;
    return;
  }

  content.innerHTML = list.map(item => {
    const candidates = buildImageCandidatesForCatalog(currentView, currentRarity, item.number);
    return cardHTML(item, candidates);
  }).join("");

  enableImageFallback();
}

// ======================
// NAV TABS
// ======================
function setActiveTab(view){
  currentView = view;
  if(view !== "Preorder") currentRarity = "🟥";

  document.querySelectorAll(".tab").forEach(t => {
    const is = t.dataset.view === view;
    t.classList.toggle("is-active", is);
    t.setAttribute("aria-selected", is ? "true" : "false");
  });

  renderToolbar();
  renderContent();
}

// ======================
// INIT
// ======================
function init(){
  $("#year").textContent = new Date().getFullYear();

  document.querySelectorAll(".tab").forEach(t => {
    t.addEventListener("click", () => setActiveTab(t.dataset.view));
  });

  $("#searchInput").addEventListener("input", (e) => {
    query = e.target.value;
    renderContent();
  });

  setActiveTab("Funko");
}

init();
