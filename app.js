// Lista estensioni
const extensions = ['jpeg','jpg','png','webp'];
function candidates(base){ return extensions.map(ext=>`./${base}.${ext}`); }

const MAX_ITEMS = 75;

const colors = [
  { name:"Rosso", emoji:"🟥" },
  { name:"Arancione", emoji:"🟧" },
  { name:"Giallo", emoji:"🟨" },
  { name:"Verde", emoji:"🟩" },
  { name:"Bianco", emoji:"◽" }
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

// Render generico
function render(){
  content.innerHTML = "";

  if(currentCategory==="Preorder"){ renderPreorder(); return; }

  // Barra rarità
  const rarityBar = document.createElement("div");
  rarityBar.className = "rarity";
  colors.forEach(c=>{
    const btn = document.createElement("button");
    btn.innerText = c.emoji;
    btn.onclick = ()=>{ currentColor=c.name; render(); };
    rarityBar.appendChild(btn);
  });
  content.appendChild(rarityBar);

  // Griglia immagini
  const grid = document.createElement("div");
  grid.className="grid";

  for(let i=1;i<=MAX_ITEMS;i++){
    const baseName=`${currentCategory}${currentColor}${i}`;
    const candidateList=candidates(baseName);
    const card=document.createElement("div");
    card.className="card";
    const img=document.createElement("img");
    img.loading="lazy";
    function tryNext(){
      if(candidateList.length===0){ card.remove(); return; }
      img.src=candidateList.shift();
    }
    img.onerror=tryNext;
    tryNext();
    img.onclick=()=>{ modal.style.display="flex"; modalImg.src=img.src; };
    card.appendChild(img);
    grid.appendChild(card);
  }
  content.appendChild(grid);
}

// Render Preorder
function renderPreorder(){
  const subCategories=['Funko','Manga','Wcf','Figure'];
  subCategories.forEach(subCat=>{
    const title=document.createElement("h2");
    title.style.textAlign="center";
    title.style.marginTop="20px";
    title.innerText=subCat;
    content.appendChild(title);

    const grid=document.createElement("div");
    grid.className="grid";

    for(let i=1;i<=MAX_ITEMS;i++){
      const baseName=`Preorder${subCat}${i}`;
      const candidateList=candidates(baseName);
      const card=document.createElement("div");
      card.className="card";
      const img=document.createElement("img");
      img.loading="lazy";
      function tryNext(){
        if(candidateList.length===0){ card.remove(); return; }
        img.src=candidateList.shift();
      }
      img.onerror=tryNext;
      tryNext();
      img.onclick=()=>{ modal.style.display="flex"; modalImg.src=img.src; };
      card.appendChild(img);
      grid.appendChild(card);
    }
    content.appendChild(grid);
  });
}

// Chiudi modal
function closeModal(){ modal.style.display="none"; }