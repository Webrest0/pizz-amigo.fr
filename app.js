import { API_URL, ADMIN_KEY } from "./config.js";

/* === Carte PIZZ'AMIGO === */
const MENU = [
  { name:"Margharita", price:7.50, desc:"tomate, emmental" },
  { name:"Chasseur",   price:8.50, desc:"tomate, emmental, champignons" },
  { name:"Sicilienne", price:8.50, desc:"tomate, emmental, anchois" },
  { name:"Napolitaine",price:9.00, desc:"tomate, emmental, jambon" },
  { name:"Canette 33cl (choisie sur place)", price:1.50, desc:"boisson servie sur place" },
  { name:"Bouteille 50cl (choisie sur place)", price:3.00, desc:"boisson servie sur place" }
];

const cart = {
  items: [],
  get total(){ return this.items.reduce((s,i)=>s+i.price*i.qty,0); },
  add(name){
    const m = MENU.find(x=>x.name===name);
    if(!m) return;
    const it = cart.items.find(i=>i.name===name);
    if(it) it.qty++; else cart.items.push({name:m.name, qty:1, price:m.price});
    renderCartBar();
  },
  clear(){ this.items.length=0; renderCartBar(); }
};

function formatPrice(v){ return v.toFixed(2).replace(".", ","); }

/* === Rendu menu === */
window.renderMenu = function(){
  const list=document.querySelector("#menu-list");
  list.innerHTML="";
  for(const p of MENU){
    const li=document.createElement("li");
    li.className="menu-item";
    li.innerHTML=`
      <div class="mi-left">
        <div class="mi-title">${p.name}</div>
        <div class="mi-desc">${p.desc}</div>
      </div>
      <div class="mi-right">
        <div class="mi-price">${formatPrice(p.price)} €</div>
        <button class="btn add">Ajouter</button>
      </div>`;
    li.querySelector(".add").addEventListener("click",()=>cart.add(p.name));
    list.appendChild(li);
  }
};

/* === Rendu panier === */
window.renderCartBar=function(){
  const bar=document.querySelector("#cart-bar");
  bar.querySelector(".cart-total").textContent=formatPrice(cart.total);
  bar.classList.toggle("hidden",cart.items.length===0);
};

function openModal(){
  const m=document.querySelector("#checkout");
  const list=m.querySelector(".ck-items");
  list.innerHTML=cart.items.map(i=>`• ${i.name} × ${i.qty} — ${formatPrice(i.price)} €`).join("<br>");
  m.showModal();
}
function closeModal(){ document.querySelector("#checkout")?.close(); }

/* === Envoi API === */
async function sendOrder(){
  const url = API_URL + (ADMIN_KEY?`?key=${encodeURIComponent(ADMIN_KEY)}`:"");
  const name=document.querySelector("#ck-name").value.trim();
  const phone=document.querySelector("#ck-phone").value.trim();
  const slot=document.querySelector("#ck-slot").value.trim();
  const note=document.querySelector("#ck-note").value.trim();
  if(!name||!phone||!slot||cart.items.length===0){
    alert("Merci de remplir tous les champs + panier.");
    return;
  }
  const payload={name,phone,slot,note,items:cart.items,total:cart.total,source:"site"};
  try{
    const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await res.json();
    if(!data.ok) throw new Error(data.error||"api");
    cart.clear(); closeModal();
    alert("Commande enregistrée. Merci !");
  }catch(e){
    alert("Impossible d'envoyer la commande. Merci de réessayer.");
    console.error(e);
  }
}

/* === Hooks === */
window.addEventListener("DOMContentLoaded",()=>{
  renderMenu(); renderCartBar();
  document.querySelector("#btn-view").addEventListener("click",openModal);
  document.querySelector("#btn-checkout").addEventListener("click",openModal);
  document.querySelector("#btn-send").addEventListener("click",sendOrder);
  document.querySelector("#close-modal").addEventListener("click",closeModal);
});
