import { API_URL, ADMIN_KEY } from "./config.js";

/* ====== Données du menu ====== */
const MENU = [
  { name:"Margharita", price:7.50, desc:"tomate, emmental" },
  { name:"Chasseur", price:8.50, desc:"tomate, emmental, champignons" },
  { name:"Sicilienne", price:8.50, desc:"tomate, emmental, anchois" },
  { name:"Napolitaine", price:9.00, desc:"tomate, emmental, jambon" },
  { name:"Capri", price:9.50, desc:"tomate, emmental, jambon, champignons" },
  { name:"Carnivore", price:11.50, desc:"tomate, emmental, viande hachée, merguez, œuf" },
  { name:"Savoyarde", price:11.00, desc:"tomate, emmental, lardons, reblochon, PDT, crème" },
  { name:"Norvégienne", price:11.50, desc:"tomate, emmental, saumon fumé, mozzarella" },
  /* Boissons (payées en ligne, saveur choisie sur place) */
  { name:"Canette 33cl (boisson - choix sur place)", price:1.50, desc:"Saveur choisie sur place" },
  { name:"Bouteille 50cl (boisson - choix sur place)", price:3.00, desc:"Saveur choisie sur place" },
];

const cart = {
  items: [], // {name, qty, price}
  get total(){ return this.items.reduce((s,i)=>s+i.price*i.qty,0); },
  add(name){
    const m = MENU.find(x=>x.name===name);
    if(!m) return;
    const it = this.items.find(i=>i.name===name);
    if(it) it.qty += 1; else this.items.push({name:m.name, qty:1, price:m.price});
    renderCartBar();
  },
  remove(name){
    const i = this.items.findIndex(x=>x.name===name);
    if(i>=0){ this.items.splice(i,1); renderCartBar(); }
  },
  clear(){ this.items.length = 0; renderCartBar(); }
};

function €(v){ return v.toFixed(2).replace(".", ","); }

/* ====== Rendu carte ====== */
export function renderMenu(){
  const list = document.querySelector("#menu-list");
  if(!list) return;
  list.innerHTML = "";
  MENU.forEach(p=>{
    const li = document.createElement("li");
    li.className = "menu-item";
    li.innerHTML = `
      <div class="mi-left">
        <div class="mi-title">${p.name}</div>
        <div class="mi-desc">${p.desc}</div>
      </div>
      <div class="mi-right">
        <div class="mi-price">${€(p.price)} €</div>
        <button class="btn add" aria-label="Ajouter ${p.name}">Ajouter</button>
      </div>`;
    li.querySelector(".add").addEventListener("click", ()=>cart.add(p.name));
    list.appendChild(li);
  });
}

/* ====== Barre panier ====== */
export function renderCartBar(){
  const bar = document.querySelector("#cart-bar");
  const total = bar?.querySelector(".cart-total");
  if(!bar || !total) return;
  total.textContent = €(cart.total);
  bar.classList.toggle("hidden", cart.items.length===0);
}

/* ====== Modal & interactions ====== */
function openModal(){
  const dlg = document.querySelector("#checkout");
  if(!dlg) return;
  const items = dlg.querySelector(".ck-items");
  items.innerHTML = cart.items.map(i=>`• ${i.name} × ${i.qty} — ${€(i.price)} €`).join("<br>");
  dlg.showModal();
}
function closeModal(){ document.querySelector("#checkout")?.close(); }

/* ID lisible côté client */
function genLocalId(){
  const d=new Date(); const pad=n=>String(n).padStart(2,"0");
  return `PZ-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}

/* ====== Envoi API ====== */
async function sendOrder(){
  const url = API_URL + (ADMIN_KEY?`?key=${encodeURIComponent(ADMIN_KEY)}`:"");

  const name  = document.querySelector("#ck-name").value.trim();
  const phone = document.querySelector("#ck-phone").value.trim();
  const slot  = document.querySelector("#ck-slot").value.trim();
  const note  = document.querySelector("#ck-note").value.trim();
  const pay   = document.querySelector('input[name="paymode"]:checked')?.value || "sur_place";

  if(!name || !phone || !slot || cart.items.length===0){
    alert("Merci de compléter nom, téléphone, heure et panier.");
    return;
  }

  const payload = {
    id: genLocalId(),
    name, phone, slot, note, paymode: pay,
    items: cart.items.map(i=>({name:i.name, qty:i.qty, price:i.price})),
    total: Number(cart.total.toFixed(2)),
    source: "site"
  };

  try{
    const res = await fetch(url, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    const txt = await res.text();
    let data; try{ data = JSON.parse(txt); }catch{ data = {ok:false, error:"bad_json", raw:txt}; }

    if(!res.ok || !data || data.ok!==true){
      console.error("API response", res.status, data);
      alert("Impossible d'envoyer la commande. Merci de réessayer ou de contacter le food-truck.");
      return;
    }

    cart.clear();
    closeModal();
    alert("Commande enregistrée (simulation). Merci !");
  }catch(err){
    console.error(err);
    alert("Impossible d'envoyer la commande. Merci de réessayer ou de contacter le food-truck.");
  }
}

/* ====== Hooks ====== */
window.addEventListener("DOMContentLoaded", ()=>{
  renderMenu(); renderCartBar();

  document.querySelector("#btn-view")?.addEventListener("click", openModal);
  document.querySelector("#btn-checkout")?.addEventListener("click", openModal);
  document.querySelector("#btn-send")?.addEventListener("click", sendOrder);
  document.querySelector("#close-modal")?.addEventListener("click", closeModal);
});

