const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const menu = document.querySelector('#pizza-menu');
const kitchen = document.querySelector('#kitchen-board');
const orderCount = document.querySelector('#order-count');
const streamButton = document.querySelector('#stream-menu');
const streamStatus = document.querySelector('#menu-stream-status');
const orders = [];
let pizzas = [];

loadMenu();
loadOrders();

async function loadMenu() {
  try {
    const response = await fetch('/api/pizzas');
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    pizzas = await response.json();
    renderMenu();
  } catch (error) {
    menu.innerHTML = '<p role="alert">Le menu est indisponible. Vérifie que l’application est démarrée, puis recharge la page.</p>';
    console.error('Impossible de charger le menu des pizzas.', error);
  }
}

async function loadOrders() {
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    orders.push(...await response.json());
    orders.reverse();
    renderOrders();
  } catch (error) {
    console.error('Impossible de charger les commandes.', error);
  }
}

function renderMenu() {
  menu.innerHTML = pizzas.map(renderPizza).join('');
}

function renderPizza(pizza) {
  return `
    <article class="pizza-card">
      <div class="pizza-card-top"><span class="pizza-emoji" aria-hidden="true">${pizza.emoji}</span><span class="pizza-price">${money.format(pizza.price)}</span></div>
      <h3>${pizza.name}</h3>
      <p>${pizza.description}</p>
      <button class="order-button" data-pizza="${pizza.id}">＋ Ajouter à la commande</button>
    </article>`;
}

streamButton.addEventListener('click', () => {
  menu.replaceChildren();
  streamButton.disabled = true;
  streamStatus.textContent = 'Les pizzas arrivent…';

  const source = new EventSource('/api/pizzas/stream');
  let received = 0;

  source.onmessage = (event) => {
    const pizza = JSON.parse(event.data);
    menu.insertAdjacentHTML('beforeend', renderPizza(pizza));
    received += 1;
    streamStatus.textContent = `${received} pizza${received === 1 ? '' : 's'} reçue${received === 1 ? '' : 's'}`;

    if (received === pizzas.length) {
      source.close();
      streamButton.disabled = false;
      streamStatus.textContent = 'Les trois pizzas sont arrivées.';
    }
  };

  source.onerror = () => {
    source.close();
    streamButton.disabled = false;
    streamStatus.textContent = 'Le flux SSE est interrompu. Recharge la page pour réessayer.';
  };
});

menu.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-pizza]');
  if (!button) return;

  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = 'Envoi…';

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pizzaId: button.dataset.pizza })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const order = await response.json();
    orders.unshift(order);
    renderOrders();
  } catch (error) {
    console.error('Impossible de créer la commande.', error);
    button.textContent = 'Réessayer';
    button.disabled = false;
    return;
  }

  button.textContent = originalText;
  button.disabled = false;
});

function renderOrders() {
  orderCount.textContent = `${orders.length} commande${orders.length === 1 ? '' : 's'}`;

  if (orders.length === 0) {
    kitchen.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon" aria-hidden="true">🍕</span>
        <h3>Le calme avant le rush</h3>
        <p>Aucune commande pour le moment.<br>Les prochaines pizzas apparaîtront ici.</p>
      </div>`;
    return;
  }

  kitchen.innerHTML = `<div class="order-list">${orders.map(({ id, pizza, status, createdAt }) => `
    <article class="order-card">
      <div><strong>Commande #${id.slice(0, 8)} · ${pizza.name}</strong><small>Reçue à ${new Date(createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${money.format(pizza.price)}</small></div>
      <span class="order-label">${status === 'RECEIVED' ? 'Reçue' : status}</span>
    </article>`).join('')}</div>`;
}
