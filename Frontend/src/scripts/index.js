import { fetchProducts, logoutUser } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", () => {
  loadCartFromLocalStorage();
  loadProducts();
  updateCartModal();
  updateCartIcon();
  const dashboardButton = document.querySelector(".admin-dashboard");
  const dashboardLink = document.querySelector(".dashboard-link");
  const regUserButton = document.querySelector(".reg-new-user");
  const loginButton = document.querySelector(".login-btn");
  const token = localStorage.getItem('token')
  const refToken = localStorage.getItem('refToken')
  
  try {
    const decoded = jwt_decode(token);
    if (decoded.isAdmin){
      regUserButton.textContent = 'Registrera ny användare';
      dashboardButton.style.display = 'block';
      dashboardLink.href = './dashboard/dashboard.html';
    } else{
      dashboardButton.style.display = 'none';
    } 
  } catch (error) {
    console.warn('Ogiltig token:', error.message);
  }

  if (token) {
    loginButton.textContent = 'Logga ut';
    loginButton.href = '#';
    loginButton.addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      try {
        await logoutUser(refToken);
      } catch (error) {
        console.error("Fel vid utloggning:", error);
      }
      await window.location.reload();
    });

  } else {
    loginButton.textContent = 'Logga in';
    loginButton.href = './auth/login.html';
  }
});

// Varukorgsdata
let cart = [];

// Spara varukorgen till localStorage
function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Ladda varukorgen från localStorage
function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    try {
      cart = JSON.parse(storedCart);
    } catch (e) {
      cart = [];
    }
  } else {
    cart = [];
  }
}

// Hämta produkter och visa på sidan
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
      const productCard = createProductCard(product);
      productsContainer.append(productCard);
      const addToCartBtn = productCard.querySelector(".add-to-cart-btn");
      addToCartBtn.addEventListener("click", () => {
        addToCart(product);
        const confirmPurchase = productCard.querySelector(".confirm-purchase");
        confirmPurchase.textContent = `Lagt till 1 st av ${product.name || "okänd produkt"} i varukorgen`;
      setTimeout(() => {
          confirmPurchase.textContent = "";
      },3000 );
      });
    });
  } catch (error) {
    productsContainer.innerHTML = `<p>Kunde inte ladda produkter: ${error.message}</p>`;
  }
}

// Skapa produktkort
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <img class="product-img" src="${product.imageUrl}" alt="${product.name}" />
    <h3>${product.name || "Namnlös produkt"}</h3>
    <p>${product.price?.toFixed(2) || "0.00"} kr</p>
    
    <button class="add-to-cart-btn">Lägg i varukorgen</button>
    <p class="confirm-purchase" style="color: green"></p>
  `;
  return card;
}

// Lägg till produkt i varukorgen och uppdatera modalen
function addToCart(product, event) {
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    if (existingItem.quantity >= 1000) {
      showNotification(`Max 1000 st av ${product.name}!`, event?.currentTarget);
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name || "Namnlös produkt",
      price: product.price || 0,
      quantity: 1,
    });
  }

  saveCartToLocalStorage();
  updateCartModal();
  updateCartIcon();
}

// Uppdatera varukorgens ikon med antalet produkter
function updateCartIcon() {
  const cartCounter = document.getElementById("cartCounter");
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCounter.textContent = totalItems;  // Uppdatera visningen i cartCounter
}

// Funktion för att visa notifikation
function showNotification(message, element) {
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.innerText = message;
  element.parentElement.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Uppdatera modalen med varukorgens innehåll och total
function updateCartModal() {
  console.log("Uppdaterar varukorgsmodalen med innehåll:", cart);
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  let emptyCartMessage = document.querySelector(".empty-cart");

  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    if (!emptyCartMessage) {
      emptyCartMessage = document.createElement("div");
      emptyCartMessage.classList.add("empty-cart");
      emptyCartMessage.innerHTML = `
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Din varukorg är tom</p>
      `;
      cartItemsContainer.append(emptyCartMessage);
    }
    cartTotal.textContent = "0 kr";
  } else {
    if (emptyCartMessage) {
      emptyCartMessage.style.display = "none";
    }

    let total = 0;
    cart.forEach(item => {
      const cartItemElement = document.createElement("div");
      cartItemElement.classList.add("cart-item");
      cartItemElement.innerHTML = `
        <div class="product-info">
          <span class="product-name">${item.name}</span>
          <div class="quantity-container">
            <button class="decrease-quantity" data-id="${item.id}">-</button>
            <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}" />
            <button class="increase-quantity" data-id="${item.id}">+</button>
          </div>
          <p class="max-quantity-warning" style="display: none; color: red; font-size: 0.8rem;"></p> <!-- Varningsmeddelande -->
        </div>
        <div class="product-total-container">
          <span class="product-total">${(item.quantity * item.price).toFixed(2)} kr</span>
          <button class="remove-item-btn" data-id="${item.id}">
            <i class="fas fa-trash"></i> 
          </button>
        </div>
      `;

      // Visa varningsmeddelande om kvantiteten är över max
      const warningElement = cartItemElement.querySelector(".max-quantity-warning");
      if (item.quantity >= 1000) {
        warningElement.style.display = "block";
        warningElement.innerText = `Max 1000 st av ${item.name}!`;
      }

      cartItemsContainer.append(cartItemElement);
      total += item.quantity * item.price;
      const removeButton = cartItemElement.querySelector(".remove-item-btn");
      removeButton.addEventListener("click", () => {
        removeFromCart(item.id);
      });
    });

    cartTotal.textContent = total.toFixed(2) + " kr";
  }
}

// Ta bort produkt från varukorgen
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCartToLocalStorage();
  updateCartModal();
  updateCartIcon();
  if (cart.length === 0) {
    const emptyCartMessage = document.querySelector(".empty-cart");
    if (emptyCartMessage) {
      emptyCartMessage.style.display = "block";
    }
  }
}
const cartButton = document.getElementById("cartButton");
if (cartButton) {
  cartButton.addEventListener("click", () => {
    showCartModal();
    updateCartModal();
  });
}

// Visa modalen
function showCartModal() {
  document.getElementById("cartModal").style.display = "block";
}

// Stäng modalen 
function closeCartModal() {
  document.getElementById("cartModal").style.display = "none";
}

// Event listener för att stänga modalen 
document.querySelector(".close-modal").addEventListener("click", closeCartModal);

window.addEventListener("click", (event) => {
  const modal = document.getElementById("cartModal");
  if (event.target === modal) {
    closeCartModal();
  }
});


document.addEventListener("click", (event) => {
  const target = event.target;
  const id = target.getAttribute("data-id");

  if (target.classList.contains("increase-quantity")) {
    const quantityInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
    const newQuantity = parseInt(quantityInput.value) + 1;
    quantityInput.value = newQuantity;
    changeQuantity(id, newQuantity);
  }

  if (target.classList.contains("decrease-quantity")) {
    const quantityInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
    const newQuantity = Math.max(1, parseInt(quantityInput.value) - 1);
    quantityInput.value = newQuantity;
    changeQuantity(id, newQuantity);
  }
});

// Uppdatera kvantitet och total
document.addEventListener("input", (event) => {
  if (event.target.classList.contains("quantity-input")) {
    const id = event.target.getAttribute("data-id");
    let newQuantity = parseInt(event.target.value);

    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    event.target.value = newQuantity;
    changeQuantity(id, newQuantity);
  }
});

function changeQuantity(id, newQuantity) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity = newQuantity;
    saveCartToLocalStorage();
    updateCartModal();
    updateCartIcon();
  }
}


// Omdirigera till checkout-sidan när man trycker på "Till kassan"
document.getElementById("checkoutButton").addEventListener("click", () => {
  window.location.href = "checkout.html";  // Skicka användaren till checkout-sidan
});


