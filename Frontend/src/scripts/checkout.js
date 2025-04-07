
const getCartFromStorage = () => JSON.parse(localStorage.getItem("cart")) || [];
const updateCartCounter = () => {
  const cart = getCartFromStorage();
  const cartCounter = document.getElementById("cartCounter");
  if (cartCounter) {
    cartCounter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeCheckout();
});

function initializeCheckout() {
  renderCartItems();
  setupEventListeners();
  updateCartCounter();
}


function renderCartItems() {
  const cartContainer = document.getElementById("cartItemsContainer");
  const cart = getCartFromStorage();
  
  if (!cartContainer) {
    console.error("Cart container element not found");
    return;
  }

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Din varukorg är tom</p>
        <a href="products.html" class="button">Fortsätt handla</a>
      </div>
    `;
    updateTotals(0);
    toggleCheckoutButton(false);
    return;
  }

  cartContainer.innerHTML = `
    <div class="cart-header">
      <span>Produkt</span>
      <span>Pris</span>
      <span>Antal</span>
      <span>Totalt</span>
    </div>
    ${cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="product-info">
          <span class="product-name">${item.name}</span>
        </div>
        <div class="product-price">${item.price.toFixed(2)} kr</div>
        <div class="quantity-controls">
          <button class="quantity-btn decrement">-</button>
          <input type="number" value="${item.quantity}" min="1" class="quantity-input">
          <button class="quantity-btn increment">+</button>
        </div>
        <div class="product-total">
          ${(item.price * item.quantity).toFixed(2)} kr
          <button class="remove-btn"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('')}
  `;

  updateTotals(calculateTotal(cart));
  toggleCheckoutButton(true);
}

function calculateTotal(cart) {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateTotals(total) {
  const subtotalElement = document.getElementById("cartSubtotal");
  const totalElement = document.getElementById("cartTotal");
  
  if (subtotalElement) subtotalElement.textContent = `${total.toFixed(2)} kr`;
  if (totalElement) totalElement.textContent = `${total.toFixed(2)} kr`;
}

function setupEventListeners() {

  document.addEventListener("click", handleCartActions);
  document.addEventListener("input", handleQuantityInput);
  

  const shipToDifferentCheckbox = document.getElementById("shipToDifferent");
  if (shipToDifferentCheckbox) {
    shipToDifferentCheckbox.addEventListener("change", toggleShippingAddress);
  }
  

  const orderButton = document.getElementById("placeOrderBtn");
  if (orderButton) {
    orderButton.addEventListener("click", handlePayment);
  }
}

function toggleShippingAddress(e) {
  const shippingFields = document.getElementById("shippingAddressFields");
  if (shippingFields) {
    shippingFields.style.display = e.target.checked ? "block" : "none";
  }
}

function handleCartActions(e) {
  const cartItem = e.target.closest(".cart-item");
  if (!cartItem) return;

  const itemId = cartItem.dataset.id;
  const cart = getCartFromStorage();

  if (e.target.closest(".decrement")) {
    updateQuantity(itemId, -1, cart);
  } else if (e.target.closest(".increment")) {
    updateQuantity(itemId, 1, cart);
  } else if (e.target.closest(".remove-btn")) {
    removeItem(itemId, cart);
  }
}

function handleQuantityInput(e) {
  if (!e.target.classList.contains("quantity-input")) return;
  
  const cartItem = e.target.closest(".cart-item");
  const itemId = cartItem.dataset.id;
  const newQuantity = parseInt(e.target.value) || 1;

  updateQuantityAbsolute(itemId, newQuantity);
}

function updateQuantity(itemId, change, cart) {
  const index = cart.findIndex(item => item.id === itemId);
  if (index === -1) return;

  cart[index].quantity += change;
  
  if (cart[index].quantity < 1) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = Math.min(cart[index].quantity, 1000);
  }

  saveCart(cart);
  renderCartItems();
  showNotification(`Varukorg uppdaterad`);
}

function updateQuantityAbsolute(itemId, quantity) {
  const cart = getCartFromStorage();
  const index = cart.findIndex(item => item.id === itemId);
  
  if (index === -1) return;
  
  quantity = Math.min(Math.max(quantity, 1), 1000);
  cart[index].quantity = quantity;
  
  saveCart(cart);
  renderCartItems();
  showNotification(`Varukorg uppdaterad`);
}

function removeItem(itemId, cart) {
  const newCart = cart.filter(item => item.id !== itemId);
  saveCart(newCart);
  renderCartItems();
  showNotification(`Produkt borttagen`);
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === "error" ? "exclamation-circle" : "check-circle"}"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
}

function toggleCheckoutButton(enable) {
  const btn = document.getElementById("placeOrderBtn");
  if (btn) {
    btn.disabled = !enable;
    btn.classList.toggle("disabled", !enable);
  }
}

async function handlePayment(e) {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  const paymentSuccess = await processPayment();
  
  if (paymentSuccess) {
    completeOrder();
  } else {
    showNotification("Betalningen misslyckades", "error");
  }
}

function validateForm() {
  const form = document.getElementById("checkoutForm");
  const swishPhone = document.getElementById("swishPhone");
  
  if (!form || !form.checkValidity()) {
    if (form) form.reportValidity();
    return false;
  }
  
  if (!swishPhone || !swishPhone.checkValidity()) {
    if (swishPhone) swishPhone.reportValidity();
    return false;
  }
  
  return true;
}

function processPayment() {
  return new Promise((resolve) => {
    showPaymentProgress();
    
    setTimeout(() => {
      resolve(Math.random() > 0.2); // 80% success rate
      hidePaymentProgress();
    }, 2000);
  });
}

function showPaymentProgress() {
  const progress = document.getElementById("progressIndicator");
  if (progress) {
    progress.classList.remove("hidden");
  }
}

function hidePaymentProgress() {
  const progress = document.getElementById("progressIndicator");
  if (progress) {
    progress.classList.add("hidden");
  }
}

function completeOrder() {
  localStorage.removeItem("cart");
  window.location.href = `order-confirmation.html?order=${generateOrderNumber()}`;
}

function generateOrderNumber() {
  return `HKL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

console.log("Cart at initialization:", getCartFromStorage());