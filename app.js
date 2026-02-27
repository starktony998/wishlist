// ======================
// AUTO-SLOT (NO CARTELLE)
// - Genera fino a 50 immagini per ogni bucket:
//   Catalogo: Categoria + Colore
//   Preorder: Categoria
// - Mostra SOLO se trova un file nella root
// - Click foto => lightbox (ingrandita)
// ======================

const MAX_PER_BUCKET = 50;

const CATALOG_CATS = ["Funko","Manga","Figure","WCF","Videogiochi"];
const PREORDER_CATS = ["Funko","Manga","Figure","WCF","Videogiochi"];

const RARITIES = ["🟥","🟧","🟨","🟩","◽"];
const RARITY_NAME = {
  "🟥": "Rosso",
  "🟧": "Arancione",
  "🟨": "Giallo",
  "🟩": "Verde",
  "◽": "Bianco"
};

let currentView = "Funko";   // Catalog cat or "Preorder"
let currentRarity = "🟥";    // only for catalog
let currentPreCat = "Funko"; // only for preorder
let query = "";

// DOM
const $ = (sel) => document.querySelector(sel);

// Lightbox DOM
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxCaption = $("#lightboxCaption");

function escapeHTML(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function normalize(s){ return String(s || "").toLowerCase().trim(); }

// Candidate extensions
function candidates(base){
  return [`${base}.jpeg`, `${base}.jpg`, `${base}.png`, `${base}.webp`];
}

// Base file names in ROOT (no folders)
function baseNameForCatalog(category, rarityEmoji, index){
  // es: FunkoRosso1
  const color = RARITY_NAME[rarityEmoji] || "Bianco";
  return `${category}${color}${index}`;
}
function baseNameForPreorder(category, index){
  // es: PreorderFunko1
  return `Preorder${category}${index}`;
}

// Build <img> with fallback
function imgHTML(cands, alt, caption){
  return `
    <img
      class="slot-img"
      src="${escapeHTML(cands[0])}"
      data-fallback="${escapeHTML(cands.slice(1).join("|"))}"
      data-caption="${escapeHTML(caption)}"
      alt="${escapeHTML(alt)}"
      loading="lazy"
    >
  `;
}

// Wire fallback + remove card if nothing found
function wireImageFallbackAndZoom(){
  // fallback + remove card
  document.querySelectorAll("img[data-fallback]").forEach(img => {
    img.onerror = () => {
      const raw = img.getAttribute("data-fallback") || "";
      const list = raw.split("|").filter(Boolean);

      if(list.length === 0){
        const card = img.closest(".card");
        if(card) card.remove();
        return;
      }

      img.src = list[0];
      const rest = list.slice(1);
      if(rest.length > 0) img.setAttribute("data-fallback", rest.join("|"));
      else img.removeAttribute("data-fallback");
    };
  });

  // click => lightbox (event delegation)
  const content = $("#content");
  content.onclick = (e) => {
    const img = e.target.closest("img.slot-img");
    if(!img) return;
    openLightbox(img.currentSrc || img.src, img.getAttribute("data-caption") || "");
  };
}

// Search
function matchesSearch(text){
  if(!query) return true;
  const q = normalize(query);
  return normalize(text).includes(q);
}

// Card
function card(slotTitle, slotNumberText, imgCandidates){
  const caption = `${slotTitle} • ${slotNumberText}`;
  return `
    <article class="card">
      <div class="thumb" title="Clicca per ingrandire">
        ${imgHTML(imgCandidates, slotTitle, caption)}
      </div>
      <div class="meta">
        <div class="title-row">
          <div class="name" title="${escapeHTML(slotTitle)}">${escapeHTML(slotTitle)}</div>
          <div class="number">${escapeHTML(slotNumberText)}</div>
        </div>
        <div class="note">Click sulla foto per zoom</div>
      </div>
    </article>
  `;
}

// Toolbar
function renderToolbar(){
  const toolbar = $("#toolbar");

  if(currentView === "Preorder"){
    toolbar.innerHTML = `
      <div class="pills" role="list">
        ${PREORDER_CATS.map(c => `
          <button class="pill ${c===currentPreCat ? "is-active" : ""}" data-precat="${escapeHTML(c)}" role="listitem">
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
        <button class="pill ${r===currentRarity ? "is-active" : ""}" data-rarity="${escapeHTML(r)}" role="listitem">
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

function renderContent(){
  const content = $("#content");
  const stats = $("#stats");

  let html = "";

  if(currentView === "Preorder"){
    for(let i=1; i<=MAX_PER_BUCKET; i++){
      const base = baseNameForPreorder(currentPreCat, i);
      const cands = candidates(base);

      const slotTitle = `Preorder ${currentPreCat}`;
      const slotNumber = `#${i}`;

      if(matchesSearch(`${slotTitle} ${slotNumber}`)){
        html += card(`${slotTitle}`, slotNumber, cands);
      }
    }

    content.innerHTML = html || `<div class="empty">Carica immagini tipo <b>Preorder${escapeHTML(currentPreCat)}1.jpeg</b> nella stessa cartella di index.html</div>`;
    wireImageFallbackAndZoom();

    if(stats){
      stats.textContent = `Preorder • ${currentPreCat} • slot 1-${MAX_PER_BUCKET}` + (query ? ` • filtro: "${query}"` : "");
    }
    return;
  }

  // Catalogo
  const colorName = RARITY_NAME[currentRarity] || "Bianco";
  for(let i=1; i<=MAX_PER_BUCKET; i++){
    const base = baseNameForCatalog(currentView, currentRarity, i);
    const cands = candidates(base);

    const slotTitle = `${currentView} ${colorName}`;
    const slotNumber = `#${i}`;

    if(matchesSearch(`${slotTitle} ${slotNumber}`)){
      html += card(slotTitle, slotNumber, cands);
    }
  }

  content.innerHTML = html || `<div class="empty">Carica immagini tipo <b>${escapeHTML(currentView)}${escapeHTML(colorName)}1.jpeg</b> nella stessa cartella di index.html</div>`;
  wireImageFallbackAndZoom();

  if(stats){
    stats.textContent = `${currentView} • ${currentRarity} (${colorName}) • slot 1-${MAX_PER_BUCKET}` + (query ? ` • filtro: "${query}"` : "");
  }
}

// Tabs
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

// Lightbox controls
function openLightbox(src, caption){
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  lightboxImg.src = src;
  lightboxImg.alt = caption || "Anteprima";
  lightboxCaption.textContent = caption || "";
  document.body.style.overflow = "hidden";
}
function closeLightbox(){
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  lightboxCaption.textContent = "";
  document.body.style.overflow = "";
}

// Close on click backdrop / X
lightbox.addEventListener("click", (e) => {
  if(e.target && e.target.getAttribute("data-close") === "1") closeLightbox();
});

// Close on ESC
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
});

// Init
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
