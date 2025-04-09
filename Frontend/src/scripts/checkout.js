const baseUrl = "https://hakim-livs-g05-be.vercel.app/";
const getCartFromStorage = () => JSON.parse(localStorage.getItem("cart")) || [];
const updateCartCounter = () => {
  const cart = getCartFromStorage();
  const cartCounter = document.getElementById("cartCounter");
  if (cartCounter) {
    cartCounter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
  }
};

const isUserLoggedIn = () => {
  const loggedIn = localStorage.getItem("userLoggedIn") === "true";
  const userData = localStorage.getItem("currentUser");
  return loggedIn && userData;
};

document.addEventListener("DOMContentLoaded", () => {

  if (!isUserLoggedIn()) {
    localStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.href = "/Frontend/login.html";
    return;
  }

  initializeCheckout();
});

function initializeCheckout() {
  renderUserData();
  renderCartItems();
  setupEventListeners();
  updateCartCounter();
}

function renderUserData() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const userInfoElement = document.getElementById("userInfo");
  
  if (userInfoElement && user) {
    userInfoElement.innerHTML = `
      <div class="user-info">
        <h3>Inloggad som: ${user.username}</h3>
        <p>${user.email || ''}</p>
        <button id="logoutBtn" class="button small">Logga ut</button>
      </div>
    `;
    
    document.getElementById("logoutBtn")?.addEventListener("click", logoutUser);
  }
}

function logoutUser() {
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
  
  showNotification("Du är nu utloggad", "success");
  
  setTimeout(() => {
    window.location.href = "/Frontend/index.html";
  }, 1500);
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

// Uppdatera totalsummor
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

  if (!isUserLoggedIn()) {
    showNotification("Du måste vara inloggad för att slutföra köpet", "error");
    setTimeout(() => {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.href = "/Frontend/login.html";
    }, 1500);
    return;
  }

  if (!validateAllInputs()) {
    return; 
  }

  const progressIndicator = document.getElementById("progressIndicator");
  if (progressIndicator) {
    progressIndicator.classList.remove("hidden");
  }

  const progressStatus = document.getElementById("progressStatus");
  let step = 0;
  const steps = [
    "Initierar betalning...",
    "Kontrollerar Swish-uppgifter...",
    "Väntar på godkännande i appen...",
    "Betalning godkänd!"
  ];

  if (progressStatus) {
    progressStatus.textContent = steps[step];
  }
  
  const paymentInterval = setInterval(() => {
    step++;
    
    if (step < steps.length && progressStatus) {
      progressStatus.textContent = steps[step];
    } else {
      clearInterval(paymentInterval);
      
      setTimeout(() => {
        localStorage.removeItem("cart");
        
        const orderNumber = generateOrderNumber();
        window.location.href = `order-confirmation.html?order=${orderNumber}`;
      }, 1000);
    }
  }, 1500); 
}


function generateOrderNumber() {
  return `HKL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function validateAllInputs() {

  const requiredFields = [
    "firstName", "lastName", "address", "city", "zipCode", "email", "phone", "swishPhone"
  ];
  
  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    
    if (!field || !field.value.trim()) {
      showNotification(`Fältet "${fieldId}" måste fyllas i`, "error");
      if (field) field.focus();
      return false;
    }
  }
 
  const shipToDifferent = document.getElementById("shipToDifferent");
  if (shipToDifferent && shipToDifferent.checked) {
    const shippingFields = [
      "shippingFirstName", "shippingLastName", "shippingAddress", "shippingCity", "shippingZipCode"
    ];
    
    for (const fieldId of shippingFields) {
      const field = document.getElementById(fieldId);
      
      if (!field || !field.value.trim()) {
        showNotification(`Fältet "${fieldId}" måste fyllas i`, "error");
        if (field) field.focus();
        return false;
      }
    }
  }
  

  const swishPhone = document.getElementById("swishPhone");
  if (swishPhone) {
    const swishPhoneValue = swishPhone.value.trim();
    const swishPhoneRegex = /^(07[0236]\d{7}|07[0236]-\d{7}|\+46\s?7[0236]\d{7}|\+46\s?7[0236]-\d{7})$/;
    
    if (!swishPhoneRegex.test(swishPhoneValue)) {
      showNotification("Ange ett giltigt svenskt mobilnummer för Swish (t.ex. 0701234567)", "error");
      swishPhone.focus();
      return false;
    }
  }
  
  return true;
}
