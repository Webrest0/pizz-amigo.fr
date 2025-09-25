import { API_URL, ADMIN_KEY } from "./config.js";

/* --- Carte (items) --- */
const MENU = [
  { name:"Margharita", price:7.50, desc:"tomate, emmental" },
  { name:"Chasseur",   price:8.50, desc:"tomate, emmental, champignons" },
  { name:"Sicilienne", price:8.50, desc:"tomate, emmental, anchois" },
  { name:"Napolitaine",price:9.00, desc:"tomate, emmental, jambon" },
  { name:"Canette 33cl (choisie sur place)",   price:1.50, desc:"boisson servie sur place" },
  { name:"Bouteille 50cl (choisie sur place)", price:3.00, desc:"boisson servie sur place" }
];

/* --- Panier --- */
const cart = {
  items: [], // {name, qty, price}
  get total(){ return this.items.reduce((s,i)=>s + i.price * i.qty, 0); },
  add(name){
    const m = MENU.find(x => x.name === name);
    if(!m) return;
    const it = this.items.find(i => i.name === name);
    if(it) it.qty++; else this.items.push({ name:m.name, qty:1, price:m.price });
    renderCartBar();
  },
  clear(){ this.items.length = 0; renderCartBar(); }
};

function €(n){ return n.toFixed(2).replace(".", ","); }

/* --- Rendu de la carte --- */
window.renderMenu = function(){
  const list = document.querySelector("#menu-list");
  list.innerHTML = "";
  for(const p of MENU){
    const li = document.createElement("li");
    li.className = "menu-item";
    li.innerHTML = `
      <div class="mi-left">
        <div class="mi-title">${p.name}</div>
        <div class="mi-desc">${p.desc}</div>
      </div>
      <div class="mi-right">
        <div class="mi-price">${€(p.price)} €</div>
        <button class="btn add">Ajouter</button>
      </div>`;
    li.querySelector(".add").addEventListener("click", ()=>cart.add(p.name));
    list.appendChild(li);
  }
};

/* --- Barre panier --- */
window.renderCartBar = function(){
  const bar = document.querySelector("#cart-bar");
  bar.querySelector(".cart-total").textContent = €(cart.total);
  bar.classList.toggle("hidden", cart.items.length === 0);
};

/* --- Popup --- */
function openModal(){
  const m = document.querySelector("#checkout");
  const list = m.querySelector(".ck-items");
  list.innerHTML = cart.items.map(i => `• ${i.name} × ${i.qty} — ${€(i.price)} €`).join("<br>");
  m.showModal();
}
function closeModal(){ document.querySelector("#checkout")?.close(); }

/* --- Envoi API --- */
async function sendOrder(){
  const name  = document.querySelector("#ck-name").value.trim();
  const phone = document.querySelector("#ck-phone").value.trim();
  const slot  = document.querySelector("#ck-slot").value.trim();
  const note  = document.querySelector("#ck-note").value.trim();
  if(!name || !phone || !slot || cart.items.length === 0){
    alert("Merci de remplir Nom, Téléphone, Heure de retrait et d’ajouter au moins un article.");
    return;
  }

  const url = API_URL + (ADMIN_KEY ? `?key=${encodeURIComponent(ADMIN_KEY)}` : "");
  const payload = {
    name, phone, slot, note,
    items: cart.items.map(i => ({ name:i.name, qty:i.qty, price:i.price })),
    total: Number(cart.total.toFixed(2)),
    source: "site"
  };

  try{
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    let data; try{ data = JSON.parse(txt); }catch{ data = { ok:false, error:"bad_json", raw:txt }; }

    if(!res.ok || !data.ok){
      console.error("API error:", res.status, data);
      alert("Impossible d'envoyer la commande. Merci de réessayer.");
      return;
    }

    cart.clear();
    closeModal();
    alert("Commande enregistrée. Merci !");
  }catch(err){
    console.error(err);
    alert("Impossible d'envoyer la commande. Merci de réessayer.");
  }
}

/* --- Hooks --- */
window.addEventListener("DOMContentLoaded", () =>{
  renderMenu(); renderCartBar();
  document.querySelector("#btn-view").addEventListener("click", openModal);
  document.querySelector("#btn-checkout").addEventListener("click", openModal);
  document.querySelector("#btn-send").addEventListener("click", sendOrder);
  document.querySelector("#close-modal").addEventListener("click", closeModal);
});
