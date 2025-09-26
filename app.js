import { API_URL, ADMIN_KEY } from "./config.js";

const MENU = [
  ["Margharita", "tomate, emmental", 7.50],
  ["Chasseur", "tomate, emmental, champignons", 8.50],
  ["Sicilienne", "tomate, emmental, anchois", 8.50],
  ["Napolitaine", "tomate, emmental, jambon", 9.00],
  ["Paysanne", "tomate, emmental, jambon, œuf", 9.50],
  ["Capri", "tomate, emmental, jambon, champignons", 9.50],
  ["Mozzarella", "tomate, emmental, mozzarella", 9.50],
  ["Quatre saisons", "tomate, emmental, oignons, champignons, poivrons, mozzarella", 9.50],
  ["Vénitienne", "tomate, emmental, roquefort, oignons, crème", 9.50],
  ["Oslo", "tomate, emmental, thon, champignons, crème", 10.00],
  ["Orientale", "tomate, emmental, merguez, poivrons", 10.00],
  ["Bolognaise", "tomate, emmental, viande hachée, crème, mozzarella", 10.00],
  ["Fermière", "tomate, emmental, œuf, lardons, champignons", 10.00],
  ["Miel", "crème, emmental, chèvre frais, miel", 10.50],
  ["Forestière", "tomate, emmental, poulet, champignons, crème", 10.50],
  ["Lyonnaise", "tomate, emmental, saint-marcellin, poulet, crème", 11.00],
  ["Quatre fromages", "tomate, emmental, chèvre, roquefort, mozzarella", 11.00],
  ["Paradoxe", "tomate, emmental, œuf, jambon, chorizo, mozzarella", 11.00],
  ["Boisée", "crème, emmental, pomme de terre, poulet, poivrons, sauce gruyère", 11.00],
  ["Savoyarde", "emmental, lardons, reblochon, pomme de terre, crème", 11.00],
  ["Carnivore", "tomate, emmental, viande hachée, merguez, œuf, mozzarella", 11.50],
  ["Norvégienne", "emmental, saumon fumé, mozzarella, crème", 11.50],
  ["Burger", "tomate, emmental, viande hachée, oignons, cheddar, tomate cerise, sauce burger", 12.00],
  ["Canette 33cl (choisie sur place)", "boisson — saveur choisie sur place", 1.50],
  ["Bouteille 50cl (choisie sur place)", "boisson — saveur choisie sur place", 3.00]
];

const SLOTS = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

const cart = {
  items: [],
  get total(){
    return this.items.reduce((sum, item) => sum + (item.price + item.suppl) * item.qty, 0);
  },
  add(row){
    const [name, desc, price] = row;
    const wantSuppl = window.confirm("Ajouter un supplément (+1 €) ?");
    const suppl = wantSuppl ? 1 : 0;
    const existingIndex = this.items.findIndex(item => item.name === name && item.suppl === suppl);
    if(existingIndex > -1){
      this.items[existingIndex].qty += 1;
    }else{
      this.items.push({ name, desc, price, suppl, qty: 1 });
    }
    updateBar();
  },
  inc(index){
    if(this.items[index]){
      this.items[index].qty += 1;
      updateBar();
    }
  },
  dec(index){
    if(!this.items[index]) return;
    this.items[index].qty -= 1;
    if(this.items[index].qty <= 0){
      this.items.splice(index, 1);
    }
    updateBar();
  },
  del(index){
    if(this.items[index]){
      this.items.splice(index, 1);
      updateBar();
    }
  },
  clear(){
    this.items.length = 0;
    updateBar();
  }
};

function formatPrice(value){
  return value.toFixed(2).replace('.', ',');
}

function renderMenu(){
  const host = document.getElementById('menu');
  if(!host) return;
  host.innerHTML = '';
  MENU.forEach(row => {
    const [name, desc, price] = row;
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `
      <div class="left">
        <div class="name">${name}</div>
        <div class="desc">${desc}</div>
      </div>
      <div class="right">
        <div class="price">${formatPrice(price)}</div>
        <button class="btn add" type="button">Ajouter</button>
      </div>
    `;
    item.querySelector('.add')?.addEventListener('click', () => cart.add(row));
    host.appendChild(item);
  });
  document.getElementById('warn')?.style.setProperty('display', host.children.length ? 'none' : 'block');
}

function updateBar(){
  const bar = document.getElementById('bar');
  const totalNode = document.getElementById('tot');
  if(!bar || !totalNode) return;
  if(cart.items.length === 0){
    bar.classList.add('hidden');
    totalNode.textContent = '0,00';
    return;
  }
  bar.classList.remove('hidden');
  totalNode.textContent = formatPrice(cart.total);
}

function openCart(){
  const resume = document.getElementById('resume');
  const sum = document.getElementById('sum');
  if(!resume || !sum) return;
  const lines = cart.items.map(item => {
    const suppl = item.suppl ? ' (+1 suppl.)' : '';
    return `• ${item.name} × ${item.qty}${suppl}`;
  }).join('<br>');
  resume.innerHTML = lines || 'Panier vide.';
  sum.textContent = `Total : ${formatPrice(cart.total)} €`;
  document.getElementById('dlg')?.showModal();
}

function buildSlots(){
  const grid = document.getElementById('slot-grid');
  if(!grid) return;
  grid.innerHTML = '';
  const input = document.getElementById('c-slot');
  const current = input?.value.trim();
  SLOTS.forEach(slot => {
    const button = document.createElement('div');
    button.className = 'slot';
    button.textContent = slot;
    button.setAttribute('role', 'option');
    button.tabIndex = -1;
    button.addEventListener('click', () => selectSlot(slot, button));
    if(slot === current){
      button.classList.add('active');
      button.tabIndex = 0;
      button.setAttribute('aria-selected', 'true');
    }
    grid.appendChild(button);
  });
}

function selectSlot(slot, node){
  const grid = document.getElementById('slot-grid');
  const input = document.getElementById('c-slot');
  if(!grid || !input) return;
  grid.querySelectorAll('.slot').forEach(el => {
    el.classList.remove('active');
    el.tabIndex = -1;
    el.removeAttribute('aria-selected');
  });
  node?.classList.add('active');
  if(node){
    node.tabIndex = 0;
    node.setAttribute('aria-selected', 'true');
    node.focus();
  }
  input.value = slot;
}

function handleSlotKeydown(event){
  if(event.key !== 'Enter' && event.key !== ' '){
    return;
  }
  event.preventDefault();
  const target = event.target.closest('.slot');
  if(target){
    selectSlot(target.textContent.trim(), target);
  }
}

function genId(){
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `PZ-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function sendOrder(){
  if(cart.items.length === 0){
    window.alert('Panier vide.');
    return;
  }
  const name = document.getElementById('c-name')?.value.trim();
  const phone = document.getElementById('c-phone')?.value.trim();
  const slot = document.getElementById('c-slot')?.value.trim();
  const note = document.getElementById('c-note')?.value.trim();
  if(!name || !phone || !slot){
    window.alert('Merci de compléter nom, téléphone et horaire.');
    return;
  }

  if(!API_URL){
    window.alert('API non configurée.');
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
      price: item.price,
      suppl: item.suppl
    })),
    total: Number(cart.total.toFixed(2)),
    source: 'site',
    id: genId()
  };

  const endpoint = ADMIN_KEY ? `${API_URL}?key=${encodeURIComponent(ADMIN_KEY)}` : API_URL;

  try{
    const response = await fetch(endpoint, {
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

    if(!response.ok || !data?.ok){
      console.error('API error', response.status, data);
      window.alert("Impossible d'envoyer la commande. Merci de réessayer.");
      return;
    }

    cart.clear();
    document.getElementById('dlg')?.close();
    updateBar();
    window.alert('Commande enregistrée. Merci !');
  }catch(error){
    console.error(error);
    window.alert("Impossible d'envoyer la commande. Merci de réessayer.");
  }
}

function bindEvents(){
  document.getElementById('view')?.addEventListener('click', openCart);
  document.getElementById('checkout')?.addEventListener('click', openCart);
  document.getElementById('close')?.addEventListener('click', () => document.getElementById('dlg')?.close());
  document.getElementById('send')?.addEventListener('click', sendOrder);
  document.getElementById('dlg')?.addEventListener('cancel', event => {
    event.preventDefault();
    document.getElementById('dlg')?.close();
  });
  document.getElementById('slot-grid')?.addEventListener('keydown', handleSlotKeydown);
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  buildSlots();
  updateBar();
  bindEvents();
});
