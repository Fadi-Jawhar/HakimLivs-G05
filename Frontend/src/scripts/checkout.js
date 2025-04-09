// Hjälpfunktioner
const baseUrl = "https://hakim-livs-g05-be.vercel.app/";
const getCartFromStorage = () => JSON.parse(localStorage.getItem("cart")) || [];
const updateCartCounter = () => {
  const cart = getCartFromStorage();
  const cartCounter = document.getElementById("cartCounter");
  if (cartCounter) {
    cartCounter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
  }
};

// Kontrollera om användaren är inloggad
const isUserLoggedIn = () => {
  const loggedIn = localStorage.getItem("userLoggedIn") === "true";
  const userData = localStorage.getItem("currentUser");
  return loggedIn && userData;
};

// Huvudfunktionalitet
document.addEventListener("DOMContentLoaded", () => {
  // Kontrollera inloggning direkt vid laddning
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

// Visa användarinformation
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

// Logga ut funktion
function logoutUser() {
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
  
  showNotification("Du är nu utloggad", "success");
  
  setTimeout(() => {
    window.location.href = "/Frontend/index.html";
  }, 1500);
}

// Renderar varukorgen
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

// Beräkna totalsumma
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

// Event listeners
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

// Toggle shipping address fields
function toggleShippingAddress(e) {
  const shippingFields = document.getElementById("shippingAddressFields");
  if (shippingFields) {
    shippingFields.style.display = e.target.checked ? "block" : "none";
  }
}

// Hantera varukorgsåtgärder
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

// Hantera kvantitetsinput
function handleQuantityInput(e) {
  if (!e.target.classList.contains("quantity-input")) return;
  
  const cartItem = e.target.closest(".cart-item");
  const itemId = cartItem.dataset.id;
  const newQuantity = parseInt(e.target.value) || 1;

  updateQuantityAbsolute(itemId, newQuantity);
}

// Uppdatera kvantitet
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

// Uppdatera absolut kvantitet
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

// Ta bort produkt
function removeItem(itemId, cart) {
  const newCart = cart.filter(item => item.id !== itemId);
  saveCart(newCart);
  renderCartItems();
  showNotification(`Produkt borttagen`);
}

// Visa notifikationer
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

// Sparar varukorg
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
}

// Toggle checkout-knapp
function toggleCheckoutButton(enable) {
  const btn = document.getElementById("placeOrderBtn");
  if (btn) {
    btn.disabled = !enable;
    btn.classList.toggle("disabled", !enable);
  }
}

// Hantera betalning
async function handlePayment(e) {
  e.preventDefault();

  // VIKTIGT: Kontrollera om användaren är inloggad
  if (!isUserLoggedIn()) {
    showNotification("Du måste vara inloggad för att slutföra köpet", "error");
    setTimeout(() => {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.href = "/Frontend/login.html";
    }, 1500);
    return;
  }

  // VIKTIGT: Validera alla input-fält innan vi fortsätter
  if (!validateAllInputs()) {
    return; // Avbryt om validering misslyckas
  }

  // Visa betalningsprocessen
  const progressIndicator = document.getElementById("progressIndicator");
  if (progressIndicator) {
    progressIndicator.classList.remove("hidden");
  }

  // Simulerad betalningssekvens
  const progressStatus = document.getElementById("progressStatus");
  let step = 0;
  const steps = [
    "Initierar betalning...",
    "Kontrollerar Swish-uppgifter...",
    "Väntar på godkännande i appen...",
    "Betalning godkänd!"
  ];

  // Uppdatera status direkt
  if (progressStatus) {
    progressStatus.textContent = steps[step];
  }
  
  // Simulera betalningsprocessen med intervall
  const paymentInterval = setInterval(() => {
    step++;
    
    // Uppdatera statustext
    if (step < steps.length && progressStatus) {
      progressStatus.textContent = steps[step];
    } else {
      // Avsluta när alla steg är klara
      clearInterval(paymentInterval);
      
      // Kort fördröjning innan omdirigering
      setTimeout(() => {
        // Töm varukorgen
        localStorage.removeItem("cart");
        
        // Generera ett ordernummer och omdirigera
        const orderNumber = generateOrderNumber();
        window.location.href = `order-confirmation.html?order=${orderNumber}`;
      }, 1000);
    }
  }, 1500); // 1.5 sekunder per steg
}

// Generera ordernummer
function generateOrderNumber() {
  return `HKL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// VIKTIGT: Validera alla input-fält
function validateAllInputs() {
  // Hämta alla obligatoriska fält
  const requiredFields = [
    "firstName", "lastName", "address", "city", "zipCode", "email", "phone", "swishPhone"
  ];
  
  // Kontrollera varje fält
  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    
    if (!field || !field.value.trim()) {
      showNotification(`Fältet "${fieldId}" måste fyllas i`, "error");
      if (field) field.focus();
      return false;
    }
  }
  
  // Om leverans till annan adress är vald, kontrollera även dessa fält
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
  
  // Validera Swish-nummer
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
  
  return true; // Alla fält är validerade och korrekta
}
