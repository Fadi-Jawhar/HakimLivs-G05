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


  if (!cartButton) console.error("Missing element: cartButton");
  if (!cartModal) console.error("Missing element: cartModal");
  if (!closeModal) console.error("Missing element: closeModal");
  if (!cartItems) console.error("Missing element: cartItems");
  if (!cartCounter) console.error("Missing element: cartCounter");
  if (!cartTotal) console.error("Missing element: cartTotal");
  if (!checkoutButton) console.error("Missing element: checkoutButton");
  if (!emptyCart) console.error("Missing element: emptyCart");


  if (cartButton) {
    cartButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (cartModal) cartModal.style.display = 'block';
      updateCartDisplay();
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      if (cartModal) cartModal.style.display = 'none';
    });
  }

  if (cartModal) {
    window.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        cartModal.style.display = 'none';
      }
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      alert('Tack för din beställning! Vi skickar dig nu till kassan.');
      cart = [];
      updateCartDisplay();
      if (cartModal) cartModal.style.display = 'none';
    });
  }

 
  if (cartCounter) cartCounter.textContent = '0';
}


async function loadProducts() {
  const productsContainer = document.getElementById("products");
  
  if (!productsContainer) {
    console.error("Missing products container element!");
    return;
  }
  
  productsContainer.innerHTML = "<p>Loading products...</p>";

  try {
    const products = await fetchProducts();
    productsContainer.innerHTML = "";

    if (products && products.length > 0) {
      products.forEach((product) => {
       
        if (!product.id && product.id !== 0) {
     
          product.id = 'product-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }
        
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
      });
    } else {
      productsContainer.innerHTML = "<p>No products available.</p>";
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    productsContainer.innerHTML = "<p>Failed to load products. Check console for details.</p>";
  }
}


function createProductCard(product) {
  const element = document.createElement("div");
  element.className = "product-card";


  const price = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;

  element.innerHTML = `
    <h3>${product.name || 'Unnamed Product'}</h3>
    <p>$${price}</p>
    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
  `;

  const addButton = element.querySelector(".add-to-cart-btn");
  if (addButton) {
    addButton.addEventListener("click", () => {
      console.log("Adding to cart:", product);
      addToCart(product);
    });
  }

  return element;
}


function addToCart(product) {
  console.log("Adding to cart function called with:", product);
  
  if (!product || !product.id) {
    console.error("Invalid product or missing ID:", product);
    return;
  }
  
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
    console.log("Increased quantity for:", product.name);
  } else {
    cart.push({
      id: product.id,
      name: product.name || 'Unnamed Product',
      price: product.price || 0,
      quantity: 1
    });
    console.log("Added new item to cart:", product.name);
  }
  
  console.log("Current cart:", cart);
  updateCartDisplay();
  showNotification(`${product.name} har lagts till i varukorgen!`);
}


function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function updateCartDisplay() {
  console.log("Updating cart display");
  
  const cartCounter = document.getElementById('cartCounter');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const emptyCart = document.querySelector('.empty-cart');
  const checkoutButton = document.getElementById('checkoutButton');
  
  if (!cartCounter || !cartItems || !cartTotal || !emptyCart || !checkoutButton) {
    console.error("Missing required cart elements for display update");
    return;
  }
  

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCounter.textContent = totalItems;
  console.log("Total items in cart:", totalItems);
  

  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    cartItems.style.display = 'none';
    cartTotal.textContent = '0 kr';
    checkoutButton.disabled = true;
    console.log("Cart is empty");
  } else {
    emptyCart.style.display = 'none';
    cartItems.style.display = 'block';
    renderCartItems();
    updateCartTotal();
    checkoutButton.disabled = false;
    console.log("Cart has items, rendering");
  }
}


function renderCartItems() {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) {
    console.error("Cart items container not found");
    return;
  }
  
  cartItems.innerHTML = '';
  console.log("Rendering cart items:", cart);
  
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
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn increase" data-id="${item.id}">+</button>
      </div>
      <div class="item-total">${item.price * item.quantity} kr</div>
    `;
    
    cartItems.appendChild(itemElement);
  });
  
  document.querySelectorAll('.decrease').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      console.log("Decrease clicked for ID:", id);
      updateQuantity(id, -1);
    });
  });
  
  document.querySelectorAll('.increase').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      console.log("Increase clicked for ID:", id);
      updateQuantity(id, 1);
    });
  });
}

function updateQuantity(id, change) {
  console.log(`Updating quantity for item ${id} by ${change}`);
  
  if (!id) {
    console.error("No ID provided for quantity update");
    return;
  }
  
  const item = cart.find(item => item.id.toString() === id.toString());
  
  if (item) {
    item.quantity += change;
    console.log(`New quantity for ${item.name}: ${item.quantity}`);
    
    if (item.quantity <= 0) {
      console.log(`Removing ${item.name} from cart`);
      cart = cart.filter(item => item.id.toString() !== id.toString());
    }
    
    updateCartDisplay();
  } else {
    console.error(`Item with ID ${id} not found in cart`);
  }
}


function updateCartTotal() {
  const cartTotal = document.getElementById('cartTotal');
  if (!cartTotal) {
    console.error("Cart total element not found");
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = `${total} kr`;
  console.log("Cart total updated to:", total);
}

document.head.appendChild(style);