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
  { name: "Vénitienne", price: 9.50, desc: "tomate, emmental, roquefort, oignons, crème" },
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

const SLOTS = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

const cart = {
  items: [],
  get total(){
    return this.items.reduce((sum, item) => sum + item.qty * (item.price + (item.suppl || 0)), 0);
  }
};

const formatEUR = value => value.toFixed(2).replace(".", ",");

function renderMenu(){
  const host = document.getElementById("menu");
  if(!host) return;

  host.innerHTML = "";
  MENU.forEach(product => {
    const node = document.createElement("div");
    node.className = "item";
    node.innerHTML = `
      <div>
        <div class="it-name">${product.name}</div>
        <div class="it-desc">${product.desc}</div>
      </div>
      <div class="right">
        <div class="price">${formatEUR(product.price)}<span class="eur">€</span></div>
        <button class="btn" type="button" data-add="${product.name}">Ajouter</button>
      </div>
    `;
    host.appendChild(node);
  });
}

function refreshBar(){
  const totalButton = document.getElementById("cart-total");
  const viewButton = document.getElementById("btn-view-cart");
  const checkoutButton = document.getElementById("btn-checkout");

  if(totalButton){
    totalButton.innerHTML = `Panier • ${formatEUR(cart.total)}&nbsp;€`;
    totalButton.disabled = true;
    totalButton.setAttribute("aria-disabled", cart.items.length === 0 ? "true" : "false");
  }

  const disabled = cart.items.length === 0;
  [viewButton, checkoutButton].forEach(button => {
    if(button){
      button.disabled = disabled;
    }
  });
}

function addItem(name){
  const product = MENU.find(item => item.name === name);
  if(!product) return;

  const existing = cart.items.find(item => item.name === product.name && (item.suppl || 0) === 0);
  if(existing){
    existing.qty += 1;
  }else{
    cart.items.push({ name: product.name, price: product.price, qty: 1, suppl: 0 });
  }

  refreshBar();
}

function openCart(){
  const modal = document.getElementById("dlg-cart");
  const host = document.getElementById("cart-lines");
  if(!modal || !host) return;

  host.innerHTML = "";
  if(cart.items.length === 0){
    host.innerHTML = `<div class="small">Panier vide.</div>`;
  }else{
    cart.items.forEach((item, index) => {
      const line = document.createElement("div");
      line.className = "cart-line";
      line.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <div class="small">Suppléments : ${(item.suppl || 0).toFixed(0)} € (par pizza)</div>
        </div>
        <div>
          <div class="qty">
            <span class="chip" data-action="minus" data-index="${index}">−</span>
            <span>${item.qty}</span>
            <span class="chip" data-action="plus" data-index="${index}">+</span>
          </div>
          <div class="suppl mt8">
            <span class="chip" data-action="suppl-minus" data-index="${index}">−</span>
            <span>+${(item.suppl || 0).toFixed(0)} €</span>
            <span class="chip" data-action="suppl-plus" data-index="${index}">+</span>
          </div>
        </div>
        <button class="btn trash" type="button" data-action="delete" data-index="${index}">🗑</button>
      `;
      host.appendChild(line);
    });
  }

  if(!modal.open){
    modal.showModal();
  }
}

function mutateCart(event){
  const target = event.target;
  if(!(target instanceof HTMLElement)) return;
  const action = target.getAttribute("data-action");
  if(!action) return;

  const index = Number(target.getAttribute("data-index"));
  if(Number.isNaN(index) || !cart.items[index]) return;

  const item = cart.items[index];
  switch(action){
    case "plus":
      item.qty += 1;
      break;
    case "minus":
      item.qty -= 1;
      if(item.qty <= 0){
        cart.items.splice(index, 1);
      }
      break;
    case "suppl-plus":
      item.suppl = Math.min((item.suppl || 0) + 1, 5);
      break;
    case "suppl-minus":
      item.suppl = Math.max((item.suppl || 0) - 1, 0);
      break;
    case "delete":
      cart.items.splice(index, 1);
      break;
    default:
      return;
  }

  refreshBar();
  openCart();
}

function resetCart(){
  cart.items.length = 0;
  refreshBar();
}

function openCheckout(){
  if(cart.items.length === 0){
    openCart();
    return;
  }

  const modal = document.getElementById("dlg-ck");
  const summary = document.getElementById("ck-summary");
  if(!modal || !summary) return;

  const lines = cart.items.map(item => {
    const extra = item.suppl ? ` (+${item.suppl.toFixed(0)} € / pizza)` : "";
    return `• ${item.name} × ${item.qty}${extra}`;
  });
  lines.push(`<br><strong>Total : ${formatEUR(cart.total)} €</strong>`);
  summary.innerHTML = lines.join("<br>");

  buildSlotList();
  modal.showModal();
}

function buildSlotList(){
  const container = document.getElementById("slot-list");
  const input = document.getElementById("ck-slot");
  if(!container || !(input instanceof HTMLInputElement)) return;

  const current = input.value.trim();
  container.innerHTML = "";

  SLOTS.forEach(slot => {
    const node = document.createElement("div");
    node.className = "slot" + (slot === current ? " active" : "");
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

    container.appendChild(node);
  });
}

function selectSlot(slot){
  const container = document.getElementById("slot-list");
  const input = document.getElementById("ck-slot");
  if(!container || !(input instanceof HTMLInputElement)) return;

  input.value = slot;
  container.querySelectorAll(".slot").forEach(node => {
    const active = node.textContent?.trim() === slot;
    node.classList.toggle("active", active);
    if(active){
      node.setAttribute("aria-selected", "true");
    }else{
      node.removeAttribute("aria-selected");
    }
  });
}

function buildPayload(){
  return {
    name: document.getElementById("ck-name")?.value.trim() || "",
    phone: document.getElementById("ck-phone")?.value.trim() || "",
    slot: document.getElementById("ck-slot")?.value.trim() || "",
    note: document.getElementById("ck-note")?.value.trim() || "",
    items: cart.items.map(item => ({
      name: item.name,
      qty: item.qty,
      price: Number(item.price.toFixed(2)),
      suppl: Number((item.suppl || 0).toFixed(2))
    })),
    total: Number(cart.total.toFixed(2)),
    source: "site"
  };
}

async function sendOrder(){
  if(cart.items.length === 0){
    window.alert("Panier vide.");
    return;
  }

  const payload = buildPayload();
  if(!payload.name || !payload.phone || !payload.slot){
    window.alert("Merci de compléter nom, téléphone et horaire.");
    return;
  }

  if(!API_URL){
    window.alert("API non configurée.");
    return;
  }

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
    document.getElementById("dlg-ck")?.close();
    document.getElementById("dlg-cart")?.close();
    window.alert("Commande enregistrée. Merci !");
  }catch(error){
    console.error(error);
    window.alert("Impossible d'envoyer la commande. Merci de réessayer.");
  }
}

function bindEvents(){
  document.getElementById("menu")?.addEventListener("click", event => {
    const target = event.target;
    if(!(target instanceof HTMLElement)) return;
    const name = target.getAttribute("data-add");
    if(name){
      addItem(name);
    }
  });

  document.getElementById("btn-view-cart")?.addEventListener("click", openCart);
  document.getElementById("btn-checkout")?.addEventListener("click", openCheckout);
  document.getElementById("cart-lines")?.addEventListener("click", mutateCart);
  document.getElementById("close-cart")?.addEventListener("click", () => document.getElementById("dlg-cart")?.close());
  document.getElementById("go-checkout")?.addEventListener("click", () => {
    document.getElementById("dlg-cart")?.close();
    openCheckout();
  });
  document.getElementById("close-ck")?.addEventListener("click", () => document.getElementById("dlg-ck")?.close());
  document.getElementById("send-order")?.addEventListener("click", sendOrder);
}

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  refreshBar();
  bindEvents();
});
