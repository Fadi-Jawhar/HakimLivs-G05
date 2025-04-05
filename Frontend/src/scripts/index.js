import { fetchProducts } from "../utils/api.js";

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  initializeCart();
  loadProducts();
});

function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    try {
      cart = JSON.parse(storedCart);
    } catch (e) {
      cart = [];
    }
  }
}

function initializeCart() {
  loadCartFromLocalStorage();

  const cartButton = document.getElementById("cartButton");
  const cartModal = document.getElementById("cartModal");
  const closeModal = document.querySelector(".close-modal");
  const cartCounter = document.getElementById("cartCounter");
  const checkoutButton = document.getElementById("checkoutButton");
  const emptyCart = document.querySelector(".empty-cart");

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      cartModal.style.display = "none";
    });
  }

  if (cartModal) {
    window.addEventListener("click", (e) => {
      if (e.target === cartModal) {
        cartModal.style.display = "none";
      }
    });
  }

  if (cartButton) {
    cartButton.addEventListener("click", (e) => {
      e.preventDefault();
      cartModal.style.display = "block";
      updateCartDisplay();
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      alert("Tack för din beställning!");
      cart = [];
      updateCartDisplay();
      saveCartToLocalStorage();
      cartModal.style.display = "none";
    });
  }

  updateCartDisplay();
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
        product.id = "product-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
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
    <h3>${product.name || "Namnl\u00f6s produkt"}</h3>
    <p>${product.price?.toFixed(2) || "0.00"} kr</p>
    <button class="add-to-cart-btn" data-id="${product.id}">L\u00e4gg i varukorgen</button>
  `;

  card.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
    addToCart(product, e);
  });

  return card;
}

function addToCart(product, event = null) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    if (existingItem.quantity >= 1000) {
      showNotification(`Max 1000 st av ${product.name}!`, event?.currentTarget);
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name || "Namnl\u00f6s produkt",
      price: product.price || 0,
      quantity: 1,
    });
  }

  updateCartDisplay();
  saveCartToLocalStorage();
  showNotification(`${product.name} tillagd i varukorgen (${existingItem ? existingItem.quantity : 1}/1000)`, event?.currentTarget);
}

function showNotification(message, targetElement = null) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    notification.style.position = "absolute";
    notification.style.top = `${rect.top + window.scrollY - 40}px`;
    notification.style.left = `${rect.left + window.scrollX}px`;
  }

  setTimeout(() => {
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }, 10);
}

function updateCartDisplay() {
  const cartCounter = document.getElementById("cartCounter");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const emptyCart = document.querySelector(".empty-cart");
  const checkoutButton = document.getElementById("checkoutButton");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCounter.textContent = totalItems;

  if (cart.length === 0) {
    emptyCart.style.display = "block";
    cartItems.style.display = "none";
    cartTotal.textContent = "0 kr";
    checkoutButton.disabled = true;
  } else {
    emptyCart.style.display = "none";
    cartItems.style.display = "block";
    renderCartItems();
    updateCartTotal();
    checkoutButton.disabled = false;
  }
}

function renderCartItems() {
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  cart.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";

    const percentage = Math.min(100, item.quantity / 10);
    const isNearLimit = item.quantity > 800;

    itemElement.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">${item.price} kr/st</div>
      </div>
      <div class="item-quantity">
        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
        <input type="number" min="1" max="1000" value="${item.quantity}" class="quantity-input ${isNearLimit ? "near-limit" : ""}" data-id="${item.id}">
        <button class="quantity-btn increase" data-id="${item.id}">+</button>
        <div class="quantity-status">${item.quantity}/1000</div>
      </div>
      <div class="item-total">
        ${(item.price * item.quantity).toFixed(2)} kr
        <button class="delete-item" data-id="${item.id}" title="Ta bort produkt">🗑️</button>
      </div>
      ${isNearLimit ? `<div class="item-progress"><div class="progress-bar" style="width: ${percentage}%"></div></div>` : ""}
    `;

    cartItems.appendChild(itemElement);
  });

  document.querySelectorAll(".decrease").forEach((btn) => {
    btn.addEventListener("click", (e) => updateQuantity(e.target.dataset.id, -1));
  });

  document.querySelectorAll(".increase").forEach((btn) => {
    btn.addEventListener("click", (e) => updateQuantity(e.target.dataset.id, 1));
  });

  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      const newQuantity = parseInt(e.target.value);
      const item = cart.find((item) => item.id === id);

      if (!item) return;

      if (isNaN(newQuantity) || newQuantity < 1) {
        e.target.value = 1;
        updateQuantity(id, 1 - item.quantity);
      } else if (newQuantity > 1000) {
        e.target.value = 1000;
        showNotification("Max 1000 st per produkt!");
        updateQuantity(id, 1000 - item.quantity);
      } else {
        updateQuantity(id, newQuantity - item.quantity);
      }
    });
  });

  document.querySelectorAll(".delete-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      removeItemFromCart(e.target.dataset.id);
    });
  });
}

function updateQuantity(id, change) {
  const item = cart.find((item) => item.id === id);
  if (!item) return;

  if (change > 0 && item.quantity + change > 1000) {
    showNotification(`Max 1000 st av ${item.name}!`);
    return;
  }

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter((item) => item.id !== id);
    showNotification(`${item.name} borttagen från varukorgen`);
  }

  updateCartDisplay();
  saveCartToLocalStorage();
}

function removeItemFromCart(id) {
  const index = cart.findIndex((item) => item.id === id);
  if (index === -1) return;

  const [removedItem] = cart.splice(index, 1);
  showNotification(`${removedItem.name} borttagen från varukorgen`);
  updateCartDisplay();
  saveCartToLocalStorage();
}

function updateCartTotal() {
  const cartTotal = document.getElementById("cartTotal");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `${total.toFixed(2)} kr`;
}
