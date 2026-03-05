// Lista delle estensioni supportate
const extensions = ['jpeg', 'jpg', 'png', 'webp'];

// Funzione che genera i candidati per l’immagine
function candidates(base) {
  return extensions.map(ext => `./${base}.${ext}`);
}
const MAX_ITEMS = 75;

const colors = [
  { name: "Rosso", emoji: "🟥" },
  { name: "Arancione", emoji: "🟧" },
  { name: "Giallo", emoji: "🟨" },
  { name: "Verde", emoji: "🟩" },
  { name: "Bianco", emoji: "◽" }
];

let currentCategory = null;
let currentColor = "Rosso";

const content = document.getElementById("content");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");

// Apri categoria
function openCategory(category){
  currentCategory = category;
  currentColor = "Rosso";
  render();
}

// Mostra rarità e immagini
function render(){
  content.innerHTML = "";

  // Barra rarità
  const rarityBar = document.createElement("div");
  rarityBar.className = "rarity";

  colors.forEach(c=>{
    const btn = document.createElement("button");
    btn.innerText = c.emoji;
    btn.onclick = ()=>{ currentColor = c.name; render(); };
    rarityBar.appendChild(btn);
  });

  content.appendChild(rarityBar);

  // Griglia immagini
  const grid = document.createElement("div");
  grid.className = "grid";

  for(let i=1;i<=MAX_ITEMS;i++){
   const baseName = `${currentCategory}${currentColor}${i}`;
const candidatesList = candidates(baseName); // tutti i formati
let loaded = false;

const card = document.createElement("div");
card.className = "card";

const img = document.createElement("img");
img.loading = "lazy";

function tryNext(){
  if(candidatesList.length === 0){
    card.remove(); // nessun formato trovato
    return;
  }
  img.src = candidatesList.shift();
}

img.onerror = tryNext;
tryNext(); // prova il primo formato

// clic per ingrandire
img.onclick = ()=>{ modal.style.display="flex"; modalImg.src=img.src; };

card.appendChild(img);
grid.appendChild(card);
    // Clic per ingrandire
    img.onclick = ()=>{ modal.style.display="flex"; modalImg.src=img.src; };

    card.appendChild(img);
    grid.appendChild(card);
  }

  content.appendChild(grid);
}

// Chiudi modal
function closeModal(){
  modal.style.display = "none";
}