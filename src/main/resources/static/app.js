const pizzas = [
  { id: 'marguerite', name: 'La Marguerite', description: 'Tomate, mozzarella fondante, basilic frais', price: 10.5, emoji: '🍅' },
  { id: 'reine', name: 'La Reine du four', description: 'Jambon, champignons, mozzarella', price: 12, emoji: '🍄' },
  { id: 'flammekueche', name: 'La Flammekueche', description: 'Crème, oignons doux, fromage, lardons', price: 13.5, emoji: '🧅' },
];

const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

document.querySelector('#pizza-menu').innerHTML = pizzas.map((pizza) => `
  <article class="pizza-card">
    <div class="pizza-card-top"><span class="pizza-emoji" aria-hidden="true">${pizza.emoji}</span><span class="pizza-price">${money.format(pizza.price)}</span></div>
    <h3>${pizza.name}</h3>
    <p>${pizza.description}</p>
    <button class="order-button" data-pizza="${pizza.id}">＋ Ajouter à la commande</button>
  </article>
`).join('');

const kitchen = document.querySelector('#kitchen-board');
const orderCount = document.querySelector('#order-count');
const orders = [];

document.querySelector('#pizza-menu').addEventListener('click', (event) => {
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
