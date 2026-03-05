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
    const imgName = `${currentCategory}${currentColor}${i}.jpeg`;

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = imgName;
    img.loading = "lazy"; // 👈 lazy loading

    // Se l'immagine non esiste
    img.onerror = function(){ card.remove(); };

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