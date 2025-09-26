import { API_URL, ADMIN_KEY } from "./config.js";

const MENU = [
  ["Margharita",7.50,"tomate, emmental"],
  ["Chasseur",8.50,"tomate, emmental, champignons"],
  ["Sicilienne",8.50,"tomate, emmental, anchois"],
  ["Napolitaine",9.00,"tomate, emmental, jambon"],
  ["Paysanne",9.50,"tomate, emmental, jambon, œuf"],
  ["Capri",9.50,"tomate, emmental, jambon, champignons"],
  ["Mozzarella",9.50,"tomate, emmental, mozzarella"],
  ["Quatre saisons",9.50,"tomate, emmental, oignons, champignons, poivrons, mozzarella"],
  ["Vénitienne",9.50,"tomate, emmental, roquefort, oignons, crème"],
  ["Oslo",10.00,"tomate, emmental, thon, champignons, crème"],
  ["Orientale",10.00,"tomate, emmental, merguez, poivrons"],
  ["Bolognaise",10.00,"tomate, emmental, viande hachée, crème, mozzarella"],
  ["Fermière",10.00,"tomate, emmental, œuf, lardons, champignons"],
  ["Miel",10.50,"crème, emmental, chèvre frais, miel"],
  ["Forestière",10.50,"tomate, emmental, poulet, champignons, crème"],
  ["Lyonnaise",11.00,"tomate, emmental, saint-marcellin, poulet, crème"],
  ["Quatre fromages",11.00,"tomate, emmental, chèvre, roquefort, mozzarella"],
  ["Paradoxe",11.00,"tomate, emmental, œuf, jambon, chorizo, mozzarella"],
  ["Boisée",11.00,"crème, emmental, pomme de terre, poulet, poivrons, sauce gruyère"],
  ["Savoyarde",11.00,"emmental, lardons, reblochon, pomme de terre, crème"],
  ["Carnivore",11.50,"tomate, emmental, viande hachée, merguez, œuf, mozzarella"],
  ["Norvégienne",11.50,"emmental, saumon fumé, mozzarella, crème"],
  ["Burger",12.00,"tomate, emmental, viande hachée, oignons, cheddar, tomate cerise, sauce burger"],
  ["Canette 33cl (choisie sur place)",1.50,"boisson — saveur choisie sur place"],
  ["Bouteille 50cl (choisie sur place)",3.00,"boisson — saveur choisie sur place"]
];

const cart = {
  items: [],
  add(name){
    const found = MENU.find(item => item[0] === name);
    if(!found) return;
    openAddModal(found[0], found[1]);
  },
  push(name, price, supp){
    const key = `${name}|${supp || 0}`;
    const existing = this.items.find(item => item.key === key);
    if(existing){
      existing.qty += 1;
    }else{
      this.items.push({ key, name, price, qty:1, supp:supp || 0 });
    }
    renderCartBar();
  },
  total(){
    return this.items.reduce((sum, item) => sum + (item.price + item.supp) * item.qty, 0);
  },
  clear(){
    this.items.length = 0;
    renderCartBar();
  },
  empty(){
    return this.items.length === 0;
  }
};

function formatEuro(value){
  return value.toFixed(2).replace('.', ',') + " €";
}

function renderMenu(){
  const list = document.getElementById('menu');
  if(!list) return;
  list.innerHTML = '';
  MENU.forEach(([name, price, desc]) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div>
        <div class="title">${name}</div>
        <div class="desc">${desc}</div>
      </div>
      <div class="item-actions">
        <span class="price">${formatEuro(price)}</span>
        <button class="btn add" type="button">Ajouter</button>
      </div>`;
    li.querySelector('.add').addEventListener('click', () => cart.add(name));
    list.appendChild(li);
  });
}

function renderCartBar(){
  const bar = document.getElementById('cartbar');
  const totalEl = document.getElementById('cartTotal');
  if(!bar || !totalEl) return;
  if(cart.empty()){
    bar.classList.add('show');
    totalEl.textContent = '0,00 €';
    return;
  }
  bar.classList.add('show');
  totalEl.textContent = formatEuro(cart.total());
}

function openAddModal(name, basePrice){
  const dialog = document.getElementById('checkout');
  if(!dialog) return;
  const head = dialog.querySelector('.modal-head');
  const body = dialog.querySelector('.modal-body');
  const foot = dialog.querySelector('.modal-foot');
  head.textContent = 'Ajouter au panier';
  body.innerHTML = `
    <div style="margin-bottom:6px"><strong>${name}</strong> — base ${formatEuro(basePrice)}</div>
    <div>Suppléments (+1 € chacun) :</div>
    <div class="supps" id="supps">
      <span class="pill" data-v="viande">viande</span>
      <span class="pill" data-v="poisson">poisson</span>
      <span class="pill" data-v="œuf">œuf</span>
      <span class="pill" data-v="fromage">fromage</span>
    </div>
    <small class="muted">Tu peux en choisir plusieurs.</small>
  `;
  foot.innerHTML = `
    <button class="btn secondary" type="button" data-action="close">Annuler</button>
    <button class="btn primary" id="btnAdd" type="button">Ajouter</button>
  `;
  body.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
    });
  });
  foot.querySelector('[data-action="close"]').addEventListener('click', closeModal);
  foot.querySelector('#btnAdd').addEventListener('click', () => {
    const count = body.querySelectorAll('.pill.active').length;
    cart.push(name, basePrice, count);
    closeModal();
  });
  dialog.showModal();
}

function openCheckoutModal(){
  if(cart.empty()){
    alert('Votre panier est vide.');
    return;
  }
  const dialog = document.getElementById('checkout');
  const head = dialog?.querySelector('.modal-head');
  const body = dialog?.querySelector('.modal-body');
  const foot = dialog?.querySelector('.modal-foot');
  if(!dialog || !head || !body || !foot) return;

  head.textContent = 'Finaliser la commande';
  body.innerHTML = `
    <div id="ckItems" style="line-height:1.7;margin-bottom:6px"></div>
    <div id="ckTotal" style="font-weight:800;margin-bottom:10px"></div>
    <div class="grid-2">
      <label>Nom*<input id="ckName" class="input" placeholder="Votre nom"></label>
      <label>Téléphone*<input id="ckPhone" class="input" placeholder="06…"></label>
    </div>
    <div class="grid-2" style="margin-top:6px">
      <label>Heure de retrait*<input id="ckSlot" class="input" value="19:00"></label>
      <label>Commentaire (optionnel)<input id="ckNote" class="input" placeholder="Sans olives, etc."></label>
    </div>
    <div class="times" id="slotGrid"></div>
    <small class="muted">Choisis un créneau, tu peux ajuster sur place.</small>
  `;
  foot.innerHTML = `
    <button class="btn secondary" type="button" data-action="close">Fermer</button>
    <button class="btn primary" id="btnSend" type="button">Envoyer la commande</button>
  `;

  const itemsContainer = body.querySelector('#ckItems');
  const totalContainer = body.querySelector('#ckTotal');
  const slotInput = body.querySelector('#ckSlot');
  const slotGrid = body.querySelector('#slotGrid');
  if(itemsContainer && totalContainer){
    const itemsHTML = cart.items.map(item => {
      const line = `${item.name}${item.supp ? ` (+${item.supp} suppl.)` : ''} × ${item.qty}`;
      const price = formatEuro((item.price + item.supp) * item.qty);
      return `• ${line} — ${price}`;
    }).join('<br>');
    itemsContainer.innerHTML = itemsHTML;
    totalContainer.textContent = 'Total : ' + formatEuro(cart.total());
  }

  if(slotGrid && slotInput){
    const slots = ['18:00','18:30','19:00','19:30','20:00','20:30'];
    slotGrid.innerHTML = '';
    slots.forEach((slot, index) => {
      const div = document.createElement('div');
      const isActive = slot === slotInput.value;
      div.className = 'time' + (isActive ? ' active' : '');
      div.dataset.s = slot;
      div.tabIndex = isActive || index === 0 ? 0 : -1;
      div.textContent = slot;
      div.addEventListener('click', () => {
        slotInput.value = slot;
        slotGrid.querySelectorAll('.time').forEach(el => el.classList.remove('active'));
        div.classList.add('active');
      });
      div.addEventListener('keydown', event => {
        if(event.key === ' ' || event.key === 'Enter'){
          event.preventDefault();
          div.click();
        }
      });
      slotGrid.appendChild(div);
    });
  }

  foot.querySelector('[data-action="close"]').addEventListener('click', closeModal);
  foot.querySelector('#btnSend').addEventListener('click', sendOrder);

  dialog.showModal();
}

function closeModal(){
  document.getElementById('checkout')?.close();
}

document.addEventListener('keydown', event => {
  if(event.key === 'Escape'){
    const dialog = document.getElementById('checkout');
    if(dialog?.open){
      event.preventDefault();
      closeModal();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  renderCartBar();

  document.getElementById('btnView')?.addEventListener('click', openCheckoutModal);
  document.getElementById('btnCheckout')?.addEventListener('click', openCheckoutModal);

  const dialog = document.getElementById('checkout');
  dialog?.addEventListener('cancel', event => {
    event.preventDefault();
    closeModal();
  });
});

async function sendOrder(){
  const name = document.getElementById('ckName')?.value.trim();
  const phone = document.getElementById('ckPhone')?.value.trim();
  const slot = document.getElementById('ckSlot')?.value.trim();
  const note = document.getElementById('ckNote')?.value.trim();

  if(!name || !phone || !slot){
    alert('Merci de compléter nom, téléphone et horaire.');
    return;
  }

  const payload = {
    name,
    phone,
    slot,
    note: note || '',
    items: cart.items.map(item => ({ name: item.name, qty: item.qty, price: item.price, supp: item.supp })),
    total: Number(cart.total().toFixed(2)),
    source: 'site'
  };

  if(!API_URL){
    cart.clear();
    closeModal();
    alert('Commande enregistrée (simulation). Merci !');
    return;
  }

  try{
    const url = API_URL + (ADMIN_KEY ? `?key=${encodeURIComponent(ADMIN_KEY)}` : '');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    let data;
    try{
      data = JSON.parse(text);
    }catch(error){
      data = { ok:false, error:'bad_json', raw:text };
    }
    if(!res.ok || !data.ok){
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    cart.clear();
    closeModal();
    alert('Commande enregistrée. Merci !');
  }catch(error){
    console.error(error);
    alert("Impossible d'envoyer la commande. Merci de réessayer.");
  }
}
