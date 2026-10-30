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

// Expérience 1 : rush HTTP. Chaque envoi est un vrai POST /api/orders, mesuré de l'envoi à la réponse.
const rush = { timer: null, running: false, sent: 0, pending: 0, ok: 0, fallback: 0, errors: 0, durations: [], orderIds: new Set(), sseIds: new Set() };
const rushFields = Object.fromEntries(['sent', 'pending', 'ok', 'fallback', 'errors', 'sse', 'median', 'last', 'max']
  .map(name => [name, document.querySelector(`#rush-${name}`)]));
const rushAlert = document.querySelector('#rush-alert');

rushRate.addEventListener('change', () => { if (!rush.running) rushStatus.textContent = describeRate(); });

rushStart.addEventListener('click', () => {
  if (rush.running) return;
  if (pizzas.length === 0) {
    rushStatus.textContent = 'Le menu n’est pas chargé : impossible de choisir les pizzas du rush.';
    return;
  }
  Object.assign(rush, { running: true, sent: 0, pending: 0, ok: 0, fallback: 0, errors: 0, durations: [], orderIds: new Set(), sseIds: new Set() });
  rushStart.disabled = true;
  rushRate.disabled = true;
  rushStop.disabled = false;
  rushStatus.textContent = `Rush en cours : ${describeRate()}.`;
  sendRushOrder();
  rush.timer = setInterval(sendRushOrder, Number(rushRate.value));
  renderRush();
});

rushStop.addEventListener('click', () => {
  clearInterval(rush.timer);
  rush.running = false;
  rushStop.disabled = true;
  renderRush();
});

async function sendRushOrder() {
  if (!rush.running) return;
  const pizza = pizzas[rush.sent % pizzas.length];
  rush.sent += 1;
  rush.pending += 1;
  renderRush();
  const startedAt = performance.now();
  try {
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pizzaId: pizza.id }) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const order = await response.json();
    rush.orderIds.add(order.id);
    if (order.estimatedDeliveryMinutes) rush.ok += 1; else rush.fallback += 1;
  } catch (error) {
    rush.errors += 1;
    console.warn('Commande du rush en erreur.', error);
  } finally {
    rush.durations.push(performance.now() - startedAt);
    rush.pending -= 1;
    renderRush();
  }
}

function describeRate() {
  const interval = Number(rushRate.value);
  const perSecond = 1000 / interval;
  return `${perSecond} commande${perSecond > 1 ? 's' : ''} par seconde, une toutes les ${interval} ms`;
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function formatDuration(ms) {
  if (ms === null || ms === undefined) return '–';
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function renderRush() {
  const { durations } = rush;
  const sseCount = [...rush.orderIds].filter(id => rush.sseIds.has(id)).length;
  rushFields.sent.textContent = rush.sent;
  rushFields.pending.textContent = rush.pending;
  rushFields.ok.textContent = rush.ok;
  rushFields.fallback.textContent = rush.fallback;
  rushFields.errors.textContent = rush.errors;
  rushFields.sse.textContent = sseCount;
  rushFields.median.textContent = formatDuration(median(durations));
  rushFields.last.textContent = formatDuration(durations.at(-1));
  rushFields.max.textContent = formatDuration(durations.length ? Math.max(...durations) : null);

  if (!rush.running && rush.sent > 0) {
    rushStatus.textContent = rush.pending > 0
      ? `Envois arrêtés. ${rush.pending} requête${rush.pending > 1 ? 's' : ''} encore en cours, attendre leur réponse.`
      : 'Envois arrêtés. Toutes les réponses sont reçues.';
    if (rush.pending === 0) {
      rushStart.disabled = false;
      rushRate.disabled = false;
    }
  }

  const alerts = [];
  const perSecond = 1000 / Number(rushRate.value);
  const firstMedian = median(durations.slice(0, 5));
  const recentMedian = median(durations.slice(-5));
  if (durations.length >= 10 && recentMedian > 2 * firstMedian && recentMedian > 200) {
    alerts.push(`Retard qui augmente : médiane des 5 dernières réponses ${formatDuration(recentMedian)}, contre ${formatDuration(firstMedian)} au début.`);
  }
  if (rush.running && rush.pending > perSecond) {
    alerts.push(`${rush.pending} requêtes attendent leur réponse : plus que la cadence d’envoi par seconde.`);
  }
  if (rush.fallback > 0) alerts.push(`${rush.fallback} commande${rush.fallback > 1 ? 's' : ''} sans estimation : le service Livraison n’a pas répondu à temps.`);
  if (rush.errors > 0) alerts.push(`${rush.errors} requête${rush.errors > 1 ? 's' : ''} en erreur.`);
  rushAlert.hidden = alerts.length === 0;
  rushAlert.textContent = alerts.join(' ');
}

// Expérience 2 : Reactor isolé, sans commande ni MongoDB ni SSE.
const bpFields = Object.fromEntries(['produced', 'processed', 'dropped'].map(name => [name, document.querySelector(`#bp-${name}`)]));
const bpCheck = document.querySelector('#bp-check');

backpressureStart.addEventListener('click', () => runReactorExperiment('/api/orders/backpressure-demo', 'Source contrôlée en cours…'));
fastSourceStart.addEventListener('click', () => runReactorExperiment('/api/orders/backpressure-demo/fast-source', 'Source rapide en cours…'));

async function runReactorExperiment(url, runningText) {
  backpressureStart.disabled = true;
  fastSourceStart.disabled = true;
  backpressureStatus.textContent = runningText;
  backpressureTrace.replaceChildren();
  Object.values(bpFields).forEach(field => { field.textContent = '–'; });
  bpCheck.textContent = '';
  try {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const report = await response.json();
    bpFields.produced.textContent = report.produced;
    bpFields.processed.textContent = report.processed;
    bpFields.dropped.textContent = report.dropped;
    const balanced = report.produced === report.processed + report.dropped;
    bpCheck.className = balanced ? 'lab-status check-ok' : 'lab-status check-ko';
    bpCheck.textContent = balanced
      ? `Bilan vérifié : ${report.produced} produits = ${report.processed} traités + ${report.dropped} abandonnés.`
      : `Bilan incohérent : écart de ${report.produced - report.processed - report.dropped} élément(s).`;
    backpressureTrace.innerHTML = `<ol>${report.trace.map(row => `<li${row.event === 'ÉLÉMENT ABANDONNÉ' ? ' class="trace-dropped"' : ''}>${row.elapsedMillis} ms · ${row.event}${row.item ? ` · élément ${row.item}` : ''}</li>`).join('')}</ol>`;
    backpressureStatus.textContent = 'Expérience terminée.';
  } catch (error) {
    backpressureStatus.textContent = `Erreur : ${error.message}`;
  } finally {
    backpressureStart.disabled = false;
    fastSourceStart.disabled = false;
  }
}

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
    const order = JSON.parse(event.data);
    addOrder(order);
    renderOrders();
    if (rush.sent > 0) {
      rush.sseIds.add(order.id);
      renderRush();
    }
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
