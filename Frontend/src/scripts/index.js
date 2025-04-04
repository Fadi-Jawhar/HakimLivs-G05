import { fetchProducts } from "../utils/api.js";

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  initializeCart();
  loadProducts();
});

function initializeCart() {
  const cartButton = document.getElementById('cartButton');
  const cartModal = document.getElementById('cartModal');
  const closeModal = document.querySelector('.close-modal');
  const cartItems = document.getElementById('cartItems');
  const cartCounter = document.getElementById('cartCounter');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutButton = document.getElementById('checkoutButton');
  const emptyCart = document.querySelector('.empty-cart');

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      cartModal.style.display = 'none';
    });
  }

  if (cartModal) {
    window.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.style.display = 'none';
      }
    });
  }

  if (cartButton) {
    cartButton.addEventListener('click', (e) => {
      e.preventDefault();
      cartModal.style.display = 'block';
      updateCartDisplay();
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      alert('Tack för din beställning!');
      cart = [];
      updateCartDisplay();
      cartModal.style.display = 'none';
    });
  }

  if (cartCounter) cartCounter.textContent = '0';
}

async function loadProducts() {
  const productsContainer = document.getElementById("products");
  if (!productsContainer) return;

  productsContainer.innerHTML = "<p>Laddar produkter...</p>";

  try {
    const products = await fetchProducts();
    productsContainer.innerHTML = "";

    products.forEach((product) => {
      if (!product.id) {
        product.id = 'product-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }
      productsContainer.appendChild(createProductCard(product));
    });
  } catch (error) {
    productsContainer.innerHTML = `<p>Kunde inte ladda produkter: ${error.message}</p>`;
  }
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <h3>${product.name || 'Namnlös produkt'}</h3>
    <p>${product.price?.toFixed(2) || '0.00'} kr</p>
    <button class="add-to-cart-btn" data-id="${product.id}">Lägg i varukorgen</button>
  `;

  card.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
    addToCart(product, e); // Skicka med event-objektet
  });

  return card;
}

function addToCart(product, event = null) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name || 'Namnlös produkt',
      price: product.price || 0,
      quantity: 1
    });
  }
  
  updateCartDisplay();
  
  const targetElement = event ? event.currentTarget : null;
  showNotification(`${product.name} tillagd i varukorgen!`, targetElement);
}


function showNotification(message, targetElement = null) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);


  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    notification.style.position = 'absolute';
    notification.style.bottom = 'auto';
    notification.style.left = 'auto';
    notification.style.top = `${rect.top + window.scrollY - 40}px`; 
    notification.style.left = `${rect.left + window.scrollX}px`;
  }

  setTimeout(() => {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }, 10);
}

function updateCartDisplay() {
  const cartCounter = document.getElementById('cartCounter');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const emptyCart = document.querySelector('.empty-cart');
  const checkoutButton = document.getElementById('checkoutButton');


  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCounter.textContent = totalItems;

  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    cartItems.style.display = 'none';
    cartTotal.textContent = '0 kr';
    checkoutButton.disabled = true;
  } else {
    emptyCart.style.display = 'none';
    cartItems.style.display = 'block';
    renderCartItems();
    updateCartTotal();
    checkoutButton.disabled = false;
  }
}

function renderCartItems() {
  const cartItems = document.getElementById('cartItems');
  cartItems.innerHTML = '';

  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">${item.price} kr/st</div>
      </div>
      <div class="item-quantity">
        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
        <input type="number" min="1" value="${item.quantity}" class="quantity-input" data-id="${item.id}">
        <button class="quantity-btn increase" data-id="${item.id}">+</button>
      </div>
      <div class="item-total">
        ${(item.price * item.quantity).toFixed(2)} kr
        <button class="delete-item" data-id="${item.id}" title="Ta bort produkt">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff0000" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    
    cartItems.appendChild(itemElement);
  });

  document.querySelectorAll('.decrease').forEach(btn => {
    btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, -1));
  });

  document.querySelectorAll('.increase').forEach(btn => {
    btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, 1));
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const newQuantity = parseInt(e.target.value);
      
      if (isNaN(newQuantity) || newQuantity < 1) {
        e.target.value = 1;
        updateQuantity(id, 0, true); 
        return;
      }
      
      const item = cart.find(item => item.id === id);
      if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
      }
    });
  });

  document.querySelectorAll('.delete-item').forEach(btn => {
    btn.addEventListener('click', (e) => removeItemFromCart(e.target.closest('button').dataset.id));
  });
}


function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
    showNotification(`${item.name} borttagen från varukorgen`);
  }

  updateCartDisplay();
}

function removeItemFromCart(id) {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex === -1) return;

  const [removedItem] = cart.splice(itemIndex, 1);
  showNotification(`${removedItem.name} borttagen från varukorgen`);
  updateCartDisplay();
}

function updateCartTotal() {
  const cartTotal = document.getElementById('cartTotal');
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `${total.toFixed(2)} kr`;
}

document.head.appendChild(style);