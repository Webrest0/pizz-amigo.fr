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
  const list = document.querySelector('#menu');
  if(!list) return;
  list.innerHTML = '';
  MENU.forEach(item => {
    const li = document.createElement('li');
    li.className = 'row';
    li.innerHTML = `
      <div>
        <div class="title">${item.n}</div>
        <div class="desc">${item.d}</div>
      </div>
      <div class="item-actions">
        <div class="price">${€(item.p)}</div>
        <button class="btn add" type="button">Ajouter</button>
      </div>`;
    li.querySelector('.add')?.addEventListener('click', () => addToCart(item.n, item.p));
    list.appendChild(li);
  });
}

function renderCartBar(){
  const bar = document.querySelector('#cart-bar');
  const list = bar?.querySelector('.cart-list');
  if(!bar || !list) return;

  const cart = getCart();
  const items = cart.items;
  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);

  list.innerHTML = items.length ? '' : '<em>Panier vide</em>';
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <span class="name">${item.name}</span>
      <div class="qty-controls">
        <button class="btn sm minus" type="button" aria-label="Retirer">−</button>
        <span class="qty">${item.qty}</span>
        <button class="btn sm plus" type="button" aria-label="Ajouter">+</button>
        <button class="btn sm danger trash" type="button" aria-label="Supprimer">🗑️</button>
      </div>`;

    row.querySelector('.minus')?.addEventListener('click', () => {
      item.qty = Math.max(1, (Number(item.qty) || 1) - 1);
      setCart(cart);
    });
    row.querySelector('.plus')?.addEventListener('click', () => {
      item.qty = (Number(item.qty) || 0) + 1;
      setCart(cart);
    });
    row.querySelector('.trash')?.addEventListener('click', () => {
      const index = cart.items.indexOf(item);
      if(index > -1){
        cart.items.splice(index, 1);
        setCart(cart);
      }
    });

    list.appendChild(row);
  });

  bar.style.display = items.length ? 'block' : 'none';
  document.querySelectorAll('.cart-total').forEach(node => {
    node.textContent = €(total);
  });
}

function openModal(){
  const dialog = document.getElementById('checkout');
  if(!dialog) return;

  const cart = getCart();
  const lines = cart.items.map(item => `• ${item.name} × ${item.qty}`).join('<br>');
  const total = cart.items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);

  const linesContainer = document.getElementById('ck-lines');
  const totalContainer = document.getElementById('ck-total');
  if(linesContainer) linesContainer.innerHTML = lines || '<em>Panier vide</em>';
  if(totalContainer) totalContainer.textContent = €(total);

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
  const slot = event.target.closest('.slot');
  if(!slot) return;
  const grid = document.getElementById('slot-grid');
  const input = document.getElementById('ck-slot');
  if(!grid || !input) return;
  grid.querySelectorAll('.slot').forEach(node => {
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
  const slot = event.target.closest('.slot');
  if(slot){
    handleSlotSelection({ target: slot });
  }
}

function bindEvents(){
  document.getElementById('btn-view')?.addEventListener('click', openModal);
  document.getElementById('btn-checkout')?.addEventListener('click', openModal);
  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-send')?.addEventListener('click', sendOrder);
  const slotGrid = document.getElementById('slot-grid');
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

window.addEventListener('storage', renderCartBar);
