import { API_URL, ADMIN_KEY } from "./config.js";

const MENU = [
  { n: "Margharita", p: 7.50, d: "tomate, emmental" },
  { n: "Chasseur", p: 8.50, d: "tomate, emmental, champignons" },
  { n: "Sicilienne", p: 8.50, d: "tomate, emmental, anchois" },
  { n: "Napolitaine", p: 9.00, d: "tomate, emmental, jambon" },
  { n: "Paysanne", p: 9.50, d: "tomate, emmental, jambon, œuf" },
  { n: "Capri", p: 9.50, d: "tomate, emmental, jambon, champignons" },
  { n: "Mozzarella", p: 9.50, d: "tomate, emmental, mozzarella" },
  { n: "Quatre saisons", p: 9.50, d: "tomate, emmental, oignons, champignons, poivrons, mozzarella" },
  { n: "Venitienne", p: 9.50, d: "tomate, emmental, roquefort, oignons, crème" },
  { n: "Oslo", p: 10.00, d: "tomate, emmental, thon, champignons, crème" },
  { n: "Orientale", p: 10.00, d: "tomate, emmental, merguez, poivrons" },
  { n: "Bolognaise", p: 10.00, d: "tomate, emmental, viande hachée, crème, mozzarella" },
  { n: "Fermière", p: 10.00, d: "tomate, emmental, œuf, lardons, champignons" },
  { n: "Miel", p: 10.50, d: "crème, emmental, chèvre, miel" },
  { n: "Forestière", p: 10.50, d: "tomate, emmental, poulet, champignons, crème" },
  { n: "Lyonnaise", p: 11.00, d: "tomate, emmental, saint-marcellin, poulet, crème" },
  { n: "Quatre fromages", p: 11.00, d: "tomate, emmental, chèvre, roquefort, mozzarella" },
  { n: "Paradoxe", p: 11.00, d: "tomate, emmental, œuf, jambon, chorizo, mozzarella" },
  { n: "Boisée", p: 11.00, d: "crème, emmental, pomme de terre, poulet, poivrons, sauce gruyère" },
  { n: "Savoyarde", p: 11.00, d: "tomate, emmental, lardons, reblochon, pomme de terre, crème" },
  { n: "Carnivore", p: 11.50, d: "tomate, emmental, viande hachée, merguez, œuf, mozzarella" },
  { n: "Norvégienne", p: 11.50, d: "emmental, saumon fumé, mozzarella, crème" },
  { n: "Burger", p: 12.00, d: "tomate, emmental, viande hachée, oignons, cheddar, tomate cerise, sauce burger" },
  { n: "Canette 33cl (choisie sur place)", p: 1.50, d: "boisson — saveur sur place" },
  { n: "Bouteille 50cl (choisie sur place)", p: 3.00, d: "boisson — saveur sur place" }
];

const € = value => (Number(value) || 0).toFixed(2).replace('.', ',') + " €";

function getCart(){
  try{
    const stored = JSON.parse(localStorage.getItem('cart') || '{}');
    if(stored && Array.isArray(stored.items)){
      return { items: stored.items.filter(item => item && item.name && Number(item.qty) > 0) };
    }
  }catch(error){
    console.warn('Cart parsing error', error);
  }
  return { items: [] };
}

function setCart(cart){
  try{
    localStorage.setItem('cart', JSON.stringify(cart));
  }catch(error){
    console.warn('Cart saving error', error);
  }
  renderCartBar();
  renderCheckout();
}

function addToCart(name, price){
  const cart = getCart();
  const found = cart.items.find(item => item.name === name);
  if(found){
    found.qty += 1;
  }else{
    cart.items.push({ name, price, qty: 1 });
  }
  setCart(cart);
}

function renderMenu(){
  const list = document.querySelector('#menu-list');
  if(!list) return;
  list.innerHTML = '';
  MENU.forEach(item => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div class="left">
        <div class="name">${item.n}</div>
        <div class="desc">${item.d}</div>
      </div>
      <div class="right">
        <div class="price">${€(item.p)}</div>
        <button class="btn add" type="button">Ajouter</button>
      </div>`;
    li.querySelector('.add')?.addEventListener('click', () => addToCart(item.n, item.p));
    list.appendChild(li);
  });
}

function renderCartBar(){
  const bar = document.getElementById('cart-bar');
  const totalNode = document.getElementById('cart-total');
  if(!bar || !totalNode) return;

  const cart = getCart();
  const items = cart.items;
  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);

  totalNode.textContent = €(total);
  bar.classList.toggle('hidden', items.length === 0);
}

function renderCheckout(){
  const linesContainer = document.getElementById('cart-lines');
  const totalContainer = document.getElementById('ck-total');
  if(!linesContainer || !totalContainer) return;

  const cart = getCart();
  const items = cart.items;
  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);

  linesContainer.innerHTML = '';

  if(!items.length){
    const empty = document.createElement('li');
    empty.className = 'cart-line empty';
    empty.textContent = 'Votre panier est vide.';
    linesContainer.appendChild(empty);
  }else{
    items.forEach((item, index) => {
      const line = document.createElement('li');
      line.className = 'cart-line';
      const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
      line.innerHTML = `
        <span class="count">${index + 1}</span>
        <div class="line-name">${item.name}</div>
        <div class="line-total">${€(lineTotal)}</div>
        <div class="qtybox">
          <button class="minus" type="button" aria-label="Retirer">−</button>
          <span class="qty">${item.qty}</span>
          <button class="plus" type="button" aria-label="Ajouter">+</button>
        </div>
        <button class="remove" type="button" aria-label="Supprimer">✕</button>
      `;

      line.querySelector('.minus')?.addEventListener('click', () => {
        item.qty = Math.max(1, (Number(item.qty) || 1) - 1);
        setCart(cart);
      });
      line.querySelector('.plus')?.addEventListener('click', () => {
        item.qty = (Number(item.qty) || 0) + 1;
        setCart(cart);
      });
      line.querySelector('.remove')?.addEventListener('click', () => {
        const indexInCart = cart.items.indexOf(item);
        if(indexInCart > -1){
          cart.items.splice(indexInCart, 1);
          setCart(cart);
        }
      });

      linesContainer.appendChild(line);
    });
  }

  totalContainer.textContent = €(total);
}

function openModal(){
  const dialog = document.getElementById('checkout');
  if(!dialog) return;

  renderCheckout();
  dialog.showModal();
}

function closeModal(){
  document.getElementById('checkout')?.close();
}

async function sendOrder(){
  const name = document.getElementById('ck-name')?.value.trim();
  const phone = document.getElementById('ck-phone')?.value.trim();
  const slot = document.getElementById('ck-slot')?.value.trim();
  const note = document.getElementById('ck-note')?.value.trim();
  const cart = getCart();

  const items = cart.items.map(item => ({
    name: item.name,
    qty: Number(item.qty) || 1,
    price: Number(item.price) || 0
  }));
  const total = Number(items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2));

  if(!name || !phone || !slot || !items.length){
    alert('Merci de compléter nom, téléphone, horaire et panier.');
    return;
  }

  if(!API_URL){
    alert('API non configurée.');
    return;
  }

  const payload = { name, phone, slot, note, items, total, source: 'site' };
  const url = API_URL + (ADMIN_KEY ? `?key=${encodeURIComponent(ADMIN_KEY)}` : '');

  try{
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    let data;
    try{
      data = JSON.parse(raw);
    }catch(error){
      data = { ok: false, error: 'bad_json', raw };
    }

    if(!response.ok || !data || data.ok !== true){
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    setCart({ items: [] });
    closeModal();
    alert('Commande enregistrée. Merci !');
  }catch(error){
    console.error(error);
    alert("Impossible d'envoyer la commande. Merci de réessayer.");
  }
}

function handleSlotSelection(event){
  const slot = event.target.closest('.time');
  if(!slot) return;
  const grid = document.getElementById('times');
  const input = document.getElementById('ck-slot');
  if(!grid || !input) return;
  grid.querySelectorAll('.time').forEach(node => {
    node.classList.remove('active');
    node.removeAttribute('aria-selected');
    node.tabIndex = -1;
  });
  slot.classList.add('active');
  slot.setAttribute('aria-selected', 'true');
  slot.tabIndex = 0;
  input.value = slot.textContent.trim();
  slot.focus();
}

function handleSlotKeydown(event){
  if(event.key !== 'Enter' && event.key !== ' '){
    return;
  }
  event.preventDefault();
  const slot = event.target.closest('.time');
  if(slot){
    handleSlotSelection({ target: slot });
  }
}

function bindEvents(){
  document.getElementById('btn-view')?.addEventListener('click', openModal);
  document.getElementById('btn-checkout')?.addEventListener('click', openModal);
  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-send')?.addEventListener('click', sendOrder);
  const slotGrid = document.getElementById('times');
  slotGrid?.addEventListener('click', handleSlotSelection);
  slotGrid?.addEventListener('keydown', handleSlotKeydown);

  const dialog = document.getElementById('checkout');
  dialog?.addEventListener('cancel', event => {
    event.preventDefault();
    closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCartBar();
  bindEvents();
});

window.addEventListener('storage', () => {
  renderCartBar();
  renderCheckout();
});
