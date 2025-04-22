const CONFIG = {
  baseUrl: "https://hakim-livs-g05-be.vercel.app/",
  localStorageKeys: {
    cart: "cart",
    user: "currentUser",
    loggedIn: "userLoggedIn",
    token: "token"
  },
  routes: {
    login: "/Frontend/auth/login.html",
    home: "/Frontend/index.html",
    products: "/Frontend/products.html",
    orderConfirmation: "/Frontend/order-confirmation.html"
  },
  maxQuantity: 1000,
  notificationDuration: 3000
};

const StorageHelper = {
  getItem(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      return null;
    }
  },

  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  removeItem(key) {
    localStorage.removeItem(key);
  },

  getCart() {
    return this.getItem(CONFIG.localStorageKeys.cart) || [];
  },

  saveCart(cart) {
    this.setItem(CONFIG.localStorageKeys.cart, cart);
  },

  getUser() {
    return this.getItem(CONFIG.localStorageKeys.user);
  },

  isLoggedIn() {
    return localStorage.getItem(CONFIG.localStorageKeys.loggedIn) === "true" && this.getUser();
  },

  clearUser() {
    Object.keys(CONFIG.localStorageKeys).forEach(key => {
      if (key !== "cart") {
        this.removeItem(CONFIG.localStorageKeys[key]);
      }
    });
  }
};

const UIHelper = {
  updateCartCounter() {
    const cart = StorageHelper.getCart();
    const cartCounter = document.getElementById("cartCounter");
    if (cartCounter) {
      cartCounter.textContent = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
    }
  },

  showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === "error" ? "exclamation-circle" : "check-circle"}"></i>
      ${message}
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), CONFIG.notificationDuration);
  },

  toggleElementVisibility(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = show ? "block" : "none";
    }
  },

  toggleCheckoutButton(enable) {
    const btn = document.getElementById("placeOrderBtn");
    if (btn) {
      btn.disabled = !enable;
      btn.classList.toggle("disabled", !enable);
    }
  },

  updateTotals(total) {
    const subtotalElement = document.getElementById("cartSubtotal");
    const totalElement = document.getElementById("cartTotal");
    
    if (subtotalElement) subtotalElement.textContent = `${total.toFixed(2)} kr`;
    if (totalElement) totalElement.textContent = `${total.toFixed(2)} kr`;
  },

  showLoginRequiredMessage() {
    const paymentSection = document.getElementById("paymentSection");
    const existingMsg = document.getElementById("loginRequiredMsg");

    if (existingMsg) return;
    
    const loginRequiredMsg = document.createElement("div");
    loginRequiredMsg.id = "loginRequiredMsg";
    loginRequiredMsg.className = "login-required-message";
    loginRequiredMsg.innerHTML = `
      <div class="notification error persistent">
        <i class="fas fa-exclamation-circle"></i>
        Du måste vara inloggad för att slutföra köpet
      </div>
      <button id="goToLoginBtn" class="button primary">Logga in</button>
    `;
    
    if (paymentSection) {
      paymentSection.parentNode.insertBefore(loginRequiredMsg, paymentSection);
      paymentSection.style.display = "none";
    } else {

      const cartContainer = document.getElementById("cartItemsContainer");
      if (cartContainer) {
        cartContainer.appendChild(loginRequiredMsg);
      }
    }
    
    document.getElementById("goToLoginBtn").addEventListener("click", () => {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.href = CONFIG.routes.login;
    });
  },
  
  hideLoginRequiredMessage() {
    const loginRequiredMsg = document.getElementById("loginRequiredMsg");
    const paymentSection = document.getElementById("paymentSection");
    
    if (loginRequiredMsg) {
      loginRequiredMsg.remove();
    }
    
    if (paymentSection) {
      paymentSection.style.display = "block";
    }
  }
};

const CartManager = {
  calculateTotal(cart) {
    return cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  },

  updateQuantity(itemId, change) {
    const cart = StorageHelper.getCart();
    const index = cart.findIndex(item => item.id === itemId);
    if (index === -1) return;

    cart[index].quantity = Math.max(1, Math.min(
      (cart[index].quantity || 1) + change,
      CONFIG.maxQuantity
    ));

    StorageHelper.saveCart(cart);
    this.renderCartItems();
    UIHelper.showNotification("Varukorg uppdaterad");
  },

  updateQuantityAbsolute(itemId, quantity) {
    quantity = Math.max(1, Math.min(quantity, CONFIG.maxQuantity));
    const cart = StorageHelper.getCart();
    const index = cart.findIndex(item => item.id === itemId);
    
    if (index !== -1) {
      cart[index].quantity = quantity;
      StorageHelper.saveCart(cart);
      this.renderCartItems();
      UIHelper.showNotification("Varukorg uppdaterad");
    }
  },

  removeItem(itemId) {
    const cart = StorageHelper.getCart().filter(item => item.id !== itemId);
    StorageHelper.saveCart(cart);
    this.renderCartItems();
    UIHelper.showNotification("Produkt borttagen");
  },

  renderCartItems() {
    const cartContainer = document.getElementById("cartItemsContainer");
    const cart = StorageHelper.getCart();
    
    if (!cartContainer) {
      console.error("Cart container element not found");
      return;
    }

    if (cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <p>Din varukorg är tom</p>
          <a href="${CONFIG.routes.products}" class="button">Fortsätt handla</a>
        </div>
      `;
      UIHelper.updateTotals(0);
      UIHelper.toggleCheckoutButton(false);
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
            <span class="product-name">${item.name || 'Okänd produkt'}</span>
          </div>
          <div class="product-price">${(item.price || 0).toFixed(2)} kr</div>
          <div class="quantity-controls">
            <button class="quantity-btn decrement">-</button>
            <input type="number" value="${item.quantity || 1}" min="1" class="quantity-input">
            <button class="quantity-btn increment">+</button>
          </div>
          <div class="product-total">
            ${((item.price || 0) * (item.quantity || 1)).toFixed(2)} kr
            <button class="remove-btn"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `).join('')}
    `;

    UIHelper.updateTotals(this.calculateTotal(cart));
    UIHelper.toggleCheckoutButton(true);

    CheckoutManager.checkLoginStatus();
  }
};

const UserManager = {
  renderUserData() {
    const user = StorageHelper.getUser();
    const userInfoElement = document.getElementById("userInfo");
    
    if (userInfoElement && user) {
      userInfoElement.innerHTML = `
        <div class="user-info">
          <h3>Inloggad som: ${user.username || 'Användare'}</h3>
          ${user.email ? `<p>${user.email}</p>` : ''}
          <button id="logoutBtn" class="button small">Logga ut</button>
        </div>
      `;
      
      document.getElementById("logoutBtn")?.addEventListener("click", this.logoutUser);
    }
  },

  logoutUser() {
    StorageHelper.clearUser();
    UIHelper.showNotification("Du är nu utloggad", "success");
    
    setTimeout(() => {
      window.location.href = CONFIG.routes.home;
    }, 1500);
  }
};


const CheckoutManager = {
  checkLoginStatus() {
    if (!StorageHelper.isLoggedIn()) {
      UIHelper.showLoginRequiredMessage();
      return false;
    } else {
      UIHelper.hideLoginRequiredMessage();
      return true;
    }
  },
  
  validateAllInputs() {
    const requiredFields = [
      "firstName", "lastName", "address", "city", "zipCode", 
      "email", "phone", "swishPhone"
    ];
    
    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field || !field.value.trim()) {
        UIHelper.showNotification(`Fältet "${fieldId}" måste fyllas i`, "error");
        field?.focus();
        return false;
      }
    }

    const shipToDifferent = document.getElementById("shipToDifferent");
    if (shipToDifferent?.checked) {
      const shippingFields = [
        "shippingFirstName", "shippingLastName", 
        "shippingAddress", "shippingCity", "shippingZipCode"
      ];
      
      for (const fieldId of shippingFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
          UIHelper.showNotification(`Fältet "${fieldId}" måste fyllas i`, "error");
          field?.focus();
          return false;
        }
      }
    }

    const swishPhone = document.getElementById("swishPhone");
    if (swishPhone) {
      const swishPhoneValue = swishPhone.value.trim();
      const swishPhoneRegex = /^(07[0236]\d{7}|07[0236]-\d{7}|\+46\s?7[0236]\d{7}|\+46\s?7[0236]-\d{7})$/;
      
      if (!swishPhoneRegex.test(swishPhoneValue)) {
        UIHelper.showNotification("Ange ett giltigt svenskt mobilnummer för Swish (t.ex. 0701234567)", "error");
        swishPhone.focus();
        return false;
      }
    }
    
    return true;
  },

  generateOrderNumber() {
    return `HKL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  },

  simulatePayment() {
    const progressIndicator = document.getElementById("progressIndicator");
    const progressStatus = document.getElementById("progressStatus");
    
    if (progressIndicator) progressIndicator.classList.remove("hidden");

    let step = 0;
    const steps = [
      "Initierar betalning...",
      "Kontrollerar Swish-uppgifter...",
      "Väntar på godkännande i appen...",
      "Betalning godkänd!"
    ];

    return new Promise((resolve) => {
      const paymentInterval = setInterval(() => {
        if (progressStatus) progressStatus.textContent = steps[step];
        
        if (++step >= steps.length) {
          clearInterval(paymentInterval);
          resolve();
        }
      }, 1500);
    });
  },

  async handlePayment(e) {
    e.preventDefault();

    const cart = StorageHelper.getCart();
    if (!cart || cart.length === 0) {
      UIHelper.showNotification("Din varukorgen är tom, den måste inehålla minst en produkt", "error");
      return;
}


    if (!StorageHelper.isLoggedIn()) {
      UIHelper.showNotification("Du måste vara inloggad för att betala med Swish", "error");
      setTimeout(() => {
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = CONFIG.routes.login;
      }, 1500);
      return;
    }

    if (!this.validateAllInputs()) return;

    try {
      await this.simulatePayment();
      
      StorageHelper.removeItem(CONFIG.localStorageKeys.cart);
      const orderNumber = this.generateOrderNumber();
      window.location.href = `${CONFIG.routes.orderConfirmation}?order=${orderNumber}`;
    } catch (error) {
      console.error("Payment error:", error);
      UIHelper.showNotification("Ett fel uppstod vid betalningen", "error");
    }
  }
};

const EventHandlers = {
  handleCartActions(e) {
    const cartItem = e.target.closest(".cart-item");
    if (!cartItem) return;

    const itemId = cartItem.dataset.id;

    if (e.target.closest(".decrement")) {
      CartManager.updateQuantity(itemId, -1);
    } else if (e.target.closest(".increment")) {
      CartManager.updateQuantity(itemId, 1);
    } else if (e.target.closest(".remove-btn")) {
      CartManager.removeItem(itemId);
    }
  },

  handleQuantityInput(e) {
    if (!e.target.classList.contains("quantity-input")) return;
    
    const cartItem = e.target.closest(".cart-item");
    const itemId = cartItem?.dataset.id;
    const newQuantity = parseInt(e.target.value) || 1;

    if (itemId) CartManager.updateQuantityAbsolute(itemId, newQuantity);
  },

  toggleShippingAddress(e) {
    UIHelper.toggleElementVisibility("shippingAddressFields", e.target.checked);
  },

  setupEventListeners() {
    document.addEventListener("click", this.handleCartActions);
    document.addEventListener("input", this.handleQuantityInput);
    
    const shipToDifferent = document.getElementById("shipToDifferent");
    if (shipToDifferent) {
      shipToDifferent.addEventListener("change", this.toggleShippingAddress);
    }

    const orderButton = document.getElementById("placeOrderBtn");
    if (orderButton) {
      orderButton.addEventListener("click", (e) => {
        if (!StorageHelper.isLoggedIn()) {
          e.preventDefault();
          UIHelper.showNotification("Du måste vara inloggad för att betala med Swish", "error");
          setTimeout(() => {
            localStorage.setItem("redirectAfterLogin", window.location.href);
            window.location.href = CONFIG.routes.login;
          }, 1500);
          return;
        }

        CheckoutManager.handlePayment(e);
      });
    }
  }
};

function initializeCheckout() {

  CartManager.renderCartItems();

  EventHandlers.setupEventListeners();

  UIHelper.updateCartCounter();

  if (StorageHelper.isLoggedIn()) {

    UserManager.renderUserData();
  } else {
  
    CheckoutManager.checkLoginStatus();
  }
}

document.addEventListener("DOMContentLoaded", initializeCheckout);