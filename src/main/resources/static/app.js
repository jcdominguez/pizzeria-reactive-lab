const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const menu = document.querySelector('#pizza-menu');
const kitchen = document.querySelector('#kitchen-board');
const orderCount = document.querySelector('#order-count');
const orders = [];
let pizzas = [];

loadMenu();

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

function renderMenu() {
  menu.innerHTML = pizzas.map((pizza) => `
    <article class="pizza-card">
      <div class="pizza-card-top"><span class="pizza-emoji" aria-hidden="true">${pizza.emoji}</span><span class="pizza-price">${money.format(pizza.price)}</span></div>
      <h3>${pizza.name}</h3>
      <p>${pizza.description}</p>
      <button class="order-button" data-pizza="${pizza.id}">＋ Ajouter à la commande</button>
    </article>
  `).join('');
}

menu.addEventListener('click', (event) => {
  const button = event.target.closest('[data-pizza]');
  if (!button) return;

  const pizza = pizzas.find((item) => item.id === button.dataset.pizza);
  if (!pizza) return;

  const number = orders.length + 1;
  orders.unshift({ number, pizza, createdAt: new Date() });
  renderOrders();
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

  kitchen.innerHTML = `<div class="order-list">${orders.map(({ number, pizza, createdAt }) => `
    <article class="order-card">
      <div><strong>Commande #${number} · ${pizza.name}</strong><small>Reçue à ${createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${money.format(pizza.price)}</small></div>
      <span class="order-label">Reçue</span>
    </article>`).join('')}</div>`;
}
