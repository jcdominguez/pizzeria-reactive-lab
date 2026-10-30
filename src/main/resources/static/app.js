const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const menu = document.querySelector('#pizza-menu');
const kitchen = document.querySelector('#kitchen-board');
const orderCount = document.querySelector('#order-count');
const streamButton = document.querySelector('#stream-menu');
const streamStatus = document.querySelector('#menu-stream-status');
const rushStart = document.querySelector('#rush-start');
const rushStop = document.querySelector('#rush-stop');
const rushRate = document.querySelector('#rush-rate');
const rushStatus = document.querySelector('#rush-status');
const backpressureStart = document.querySelector('#backpressure-start');
const backpressureStatus = document.querySelector('#backpressure-status');
const backpressureTrace = document.querySelector('#backpressure-trace');
const fastSourceStart = document.querySelector('#backpressure-fast-start');
const orders = [];
let pizzas = [];

loadMenu();
loadOrders();
listenForNewOrders();

let rushTimer;
let rushSent = 0;
rushStart.addEventListener('click', () => {
  rushSent = 0;
  rushStart.disabled = true;
  rushStop.disabled = false;
  rushStatus.textContent = 'Rush en cours…';
  const sendOrder = async () => {
    const pizza = pizzas[rushSent % pizzas.length];
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pizzaId: pizza.id }) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      rushSent += 1;
      rushStatus.textContent = `${rushSent} commande${rushSent === 1 ? '' : 's'} envoyée${rushSent === 1 ? '' : 's'}`;
    } catch (error) {
      rushStatus.textContent = `Erreur pendant le rush : ${error.message}`;
    }
  };
  sendOrder();
  rushTimer = setInterval(sendOrder, Number(rushRate.value));
});
rushStop.addEventListener('click', () => {
  clearInterval(rushTimer);
  rushStart.disabled = false;
  rushStop.disabled = true;
  rushStatus.textContent += ' · Rush arrêté.';
});

backpressureStart.addEventListener('click', async () => {
  backpressureStart.disabled = true;
  backpressureStatus.textContent = 'Expérience en cours…';
  backpressureTrace.replaceChildren();
  try {
    const response = await fetch('/api/orders/backpressure-demo', { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const trace = await response.json();
    backpressureTrace.innerHTML = `<ol>${trace.map(row => `<li>${row.elapsedMillis} ms · ${row.event}${row.item ? ` · élément ${row.item}` : ''}</li>`).join('')}</ol>`;
    backpressureStatus.textContent = 'Expérience terminée.';
  } catch (error) {
    backpressureStatus.textContent = `Erreur : ${error.message}`;
  } finally {
    backpressureStart.disabled = false;
  }
});

fastSourceStart.addEventListener('click', async () => {
  fastSourceStart.disabled = true;
  backpressureStatus.textContent = 'Source rapide en cours…';
  backpressureTrace.replaceChildren();
  try {
    const response = await fetch('/api/orders/backpressure-demo/fast-source', { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const trace = await response.json();
    backpressureTrace.innerHTML = `<ol>${trace.map(row => `<li>${row.elapsedMillis} ms · ${row.event}${row.item ? ` · élément ${row.item}` : ''}</li>`).join('')}</ol>`;
    backpressureStatus.textContent = trace.at(-1)?.event ?? 'Expérience terminée.';
  } catch (error) {
    backpressureStatus.textContent = `Erreur : ${error.message}`;
  } finally {
    fastSourceStart.disabled = false;
  }
});

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
    (await response.json()).forEach(addOrder);
    renderOrders();
  } catch (error) {
    console.error('Impossible de charger les commandes.', error);
  }
}

function listenForNewOrders() {
  const source = new EventSource('/api/orders/stream');

  source.addEventListener('order-created', (event) => {
    addOrder(JSON.parse(event.data));
    renderOrders();
  });

  source.onopen = () => console.info('Flux des nouvelles commandes connecté.');
  source.onerror = () => console.warn('Connexion au flux des commandes interrompue ; le navigateur réessaie automatiquement.');
}

function addOrder(order) {
  if (orders.some(existing => existing.id === order.id)) return;
  orders.push(order);
  orders.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
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

    await response.json();
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

  kitchen.innerHTML = `<div class="order-list">${orders.map(({ id, pizza, status, createdAt, estimatedDeliveryMinutes, deliveryMessage }) => `
    <article class="order-card">
      <div><strong>Commande #${id.slice(0, 8)} · ${pizza.name}</strong><small>Reçue à ${new Date(createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${money.format(pizza.price)} · ${estimatedDeliveryMinutes ? `Livraison estimée dans ${estimatedDeliveryMinutes} min` : (deliveryMessage || 'Estimation non disponible')}</small></div>
      <span class="order-label">${status === 'RECEIVED' ? 'Reçue' : status}</span>
    </article>`).join('')}</div>`;
}
