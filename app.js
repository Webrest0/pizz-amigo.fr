import { API_URL, ADMIN_KEY } from "./config.js";

const MENU = [
  { name: "Margharita", price: 7.50, desc: "tomate, emmental" },
  { name: "Chasseur", price: 8.50, desc: "tomate, emmental, champignons" },
  { name: "Sicilienne", price: 8.50, desc: "tomate, emmental, anchois" },
  { name: "Napolitaine", price: 9.00, desc: "tomate, emmental, jambon" },
  { name: "Paysanne", price: 9.50, desc: "tomate, emmental, jambon, œuf" },
  { name: "Capri", price: 9.50, desc: "tomate, emmental, jambon, champignons" },
  { name: "Mozzarella", price: 9.50, desc: "tomate, emmental, mozzarella" },
  { name: "Quatre saisons", price: 9.50, desc: "tomate, emmental, oignons, champignons, poivrons, mozzarella" },
  { name: "Venitienne", price: 9.50, desc: "tomate, emmental, roquefort, oignons, crème" },
  { name: "Oslo", price: 10.00, desc: "tomate, emmental, thon, champignons, crème" },
  { name: "Orientale", price: 10.00, desc: "tomate, emmental, merguez, poivrons" },
  { name: "Bolognaise", price: 10.00, desc: "tomate, emmental, viande hachée, crème, mozzarella" },
  { name: "Fermière", price: 10.00, desc: "tomate, emmental, œuf, lardons, champignons" },
  { name: "Miel", price: 10.50, desc: "crème, emmental, chèvre frais, miel" },
  { name: "Forestière", price: 10.50, desc: "tomate, emmental, poulet, champignons, crème" },
  { name: "Lyonnaise", price: 11.00, desc: "tomate, emmental, saint-marcellin, poulet, crème" },
  { name: "Quatre fromages", price: 11.00, desc: "tomate, emmental, chèvre, roquefort, mozzarella" },
  { name: "Paradoxe", price: 11.00, desc: "tomate, emmental, œuf, jambon, chorizo, mozzarella" },
  { name: "Boisée", price: 11.00, desc: "crème, emmental, pomme de terre, poulet, poivrons, sauce gruyère" },
  { name: "Savoyarde", price: 11.00, desc: "tomate, emmental, lardons, reblochon, pomme de terre, crème" },
  { name: "Carnivore", price: 11.50, desc: "tomate, emmental, viande hachée, merguez, œuf, mozzarella" },
  { name: "Norvégienne", price: 11.50, desc: "emmental, saumon fumé, mozzarella, crème" },
  { name: "Burger", price: 12.00, desc: "tomate, emmental, viande hachée, oignons, cheddar, tomate cerise, sauce burger" },
  { name: "Canette 33cl (choisie sur place)", price: 1.50, desc: "boisson — saveur choisie sur place" },
  { name: "Bouteille 50cl (choisie sur place)", price: 3.00, desc: "boisson — saveur choisie sur place" }
];

const SUPPS = ["viande", "poisson", "œuf", "fromage"];
const SLOTS = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

const cart = {
  items: [],
  get total(){
    return this.items.reduce((sum, item) => sum + (item.price + (item.supp || 0)) * item.qty, 0);
  }
};

function formatEUR(value){
  return value.toFixed(2).replace(".", ",");
}

function cssEscape(value){
  return value.replace(/["\\]/g, "");
}

function addToCart(name){
  const product = MENU.find(item => item.name === name);
  if(!product) return;

  const wrapper = document.querySelector(`[data-prod="${cssEscape(name)}"]`);
  let suppCount = 0;
  if(wrapper){
    wrapper.querySelectorAll(".supp .chip.active").forEach(() => {
      suppCount += 1;
    });
  }
  const extra = suppCount * 1.00;

  const existing = cart.items.find(item => item.name === name && (item.supp || 0) === extra);
  if(existing){
    existing.qty += 1;
  }else{
    cart.items.push({ name: product.name, price: product.price, supp: extra, qty: 1 });
  }

  renderCartBar();
}

function inc(index){
  if(!cart.items[index]) return;
  cart.items[index].qty += 1;
  renderBasket();
  renderCartBar();
}

function dec(index){
  if(!cart.items[index]) return;
  cart.items[index].qty -= 1;
  if(cart.items[index].qty <= 0){
    cart.items.splice(index, 1);
  }
  renderBasket();
  renderCartBar();
}

function del(index){
  if(!cart.items[index]) return;
  cart.items.splice(index, 1);
  renderBasket();
  renderCartBar();
}

function resetCart(){
  cart.items.length = 0;
  renderBasket();
  renderCartBar();
}

function renderMenu(){
  const root = document.getElementById("menu");
  if(!root) return;
  root.innerHTML = "";

  MENU.forEach(product => {
    const row = document.createElement("div");
    row.className = "item";
    row.dataset.prod = product.name;
    row.innerHTML = `
      <div>
        <div class="name">${product.name}</div>
        <div class="desc">${product.desc}</div>
        <div class="supp">
          ${SUPPS.map(supp => `<span class="chip" data-s="${supp}">+1€ ${supp}</span>`).join("")}
        </div>
      </div>
      <div>
        <div class="price"><span>${formatEUR(product.price)}</span><span class="eur">€</span></div>
        <div class="actions-add">
          <button class="btn btn-pill" type="button">Ajouter</button>
        </div>
      </div>
    `;

    row.querySelector(".btn-pill")?.addEventListener("click", () => addToCart(product.name));
    row.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("active");
      });
    });

    root.appendChild(row);
  });
}

function renderCartBar(){
  const bar = document.getElementById("cartBar");
  const totalNode = document.getElementById("cartTotal");
  if(!bar || !totalNode) return;

  totalNode.textContent = formatEUR(cart.total);
  if(cart.items.length === 0){
    bar.classList.add("hidden");
  }else{
    bar.classList.remove("hidden");
  }
}

function renderBasket(){
  const box = document.getElementById("basket");
  if(!box) return;

  if(cart.items.length === 0){
    box.innerHTML = `<div class="hint">Votre panier est vide.</div>`;
    return;
  }

  const rows = cart.items.map((item, index) => {
    const extra = (item.supp || 0) > 0 ? `<span class="hint">(+${formatEUR(item.supp)} € suppl.)</span>` : "";
    const unit = item.price + (item.supp || 0);
    return `
      <div class="row">
        <div><strong>${item.name}</strong> ${extra}</div>
        <div class="qty">
          <button type="button" data-action="dec" data-index="${index}">−</button>
          <div>${item.qty}</div>
          <button type="button" data-action="inc" data-index="${index}">+</button>
        </div>
        <div class="line-total">${formatEUR(unit * item.qty)} €</div>
        <button class="trash" type="button" data-action="del" data-index="${index}">Suppr.</button>
      </div>
    `;
  }).join("");

  box.innerHTML = `${rows}
    <div class="total"><span>Total :</span> <span>${formatEUR(cart.total)} €</span></div>`;

  box.querySelectorAll("button[data-action]").forEach(button => {
    button.addEventListener("click", handleBasketAction);
  });
}

function handleBasketAction(event){
  const target = event.currentTarget;
  const index = Number(target.dataset.index);
  const action = target.dataset.action;
  if(Number.isNaN(index) || !action) return;

  if(action === "inc") inc(index);
  else if(action === "dec") dec(index);
  else if(action === "del") del(index);
}

function openModal(){
  const modal = document.getElementById("cartModal");
  if(!modal) return;
  renderBasket();
  modal.showModal();
}

function buildTimeGrid(){
  const grid = document.getElementById("timeGrid");
  const input = document.getElementById("ckSlot");
  if(!grid || !input) return;

  const current = input.value.trim();
  grid.innerHTML = "";

  SLOTS.forEach(slot => {
    const node = document.createElement("div");
    node.className = "time" + (slot === current ? " active" : "");
    node.textContent = slot;
    node.tabIndex = 0;
    node.setAttribute("role", "option");
    if(slot === current){
      node.setAttribute("aria-selected", "true");
    }
    node.addEventListener("click", () => selectSlot(slot));
    node.addEventListener("keydown", event => {
      if(event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectSlot(slot);
    });
    grid.appendChild(node);
  });
}

function selectSlot(slot){
  const grid = document.getElementById("timeGrid");
  const input = document.getElementById("ckSlot");
  if(!grid || !input) return;

  input.value = slot;
  grid.querySelectorAll(".time").forEach(node => {
    const active = node.textContent.trim() === slot;
    node.classList.toggle("active", active);
    if(active){
      node.setAttribute("aria-selected", "true");
    }else{
      node.removeAttribute("aria-selected");
    }
  });
}

function genId(){
  const now = new Date();
  const pad = value => String(value).padStart(2, "0");
  return `PZ-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function sendOrder(){
  if(cart.items.length === 0){
    window.alert("Panier vide.");
    return;
  }

  const name = document.getElementById("ckName")?.value.trim();
  const phone = document.getElementById("ckPhone")?.value.trim();
  const slot = document.getElementById("ckSlot")?.value.trim();
  const note = document.getElementById("ckNote")?.value.trim();

  if(!name || !phone || !slot){
    window.alert("Merci de compléter nom, téléphone et horaire.");
    return;
  }

  if(!API_URL){
    window.alert("API non configurée.");
    return;
  }

  const payload = {
    name,
    phone,
    slot,
    note,
    items: cart.items.map(item => ({
      name: item.name,
      qty: item.qty,
      price: Number((item.price + (item.supp || 0)).toFixed(2))
    })),
    total: Number(cart.total.toFixed(2)),
    source: "site",
    id: genId()
  };

  const endpoint = ADMIN_KEY ? `${API_URL}?key=${encodeURIComponent(ADMIN_KEY)}` : API_URL;

  try{
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    let data;
    try{
      data = JSON.parse(raw);
    }catch(error){
      data = { ok: false, error: "bad_json", raw };
    }

    if(!response.ok || !data?.ok){
      console.error("API error", response.status, data);
      window.alert("Impossible d'envoyer la commande. Merci de réessayer.");
      return;
    }

    resetCart();
    document.getElementById("cartModal")?.close();
    window.alert("Commande enregistrée. Merci !");
  }catch(error){
    console.error(error);
    window.alert("Impossible d'envoyer la commande. Merci de réessayer.");
  }
}

function bindUi(){
  document.getElementById("btnView")?.addEventListener("click", openModal);
  document.getElementById("btnCheckout")?.addEventListener("click", openModal);
  document.getElementById("btnClose")?.addEventListener("click", () => document.getElementById("cartModal")?.close());
  document.getElementById("btnSend")?.addEventListener("click", sendOrder);

  const modal = document.getElementById("cartModal");
  modal?.addEventListener("cancel", event => {
    event.preventDefault();
    modal.close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  renderCartBar();
  buildTimeGrid();
  bindUi();
});
