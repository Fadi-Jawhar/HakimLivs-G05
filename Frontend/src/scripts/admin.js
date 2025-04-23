import {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
  } from "../utils/api.js"
 
  const tbody = document.querySelector("tbody");
  const modalEl = document.getElementById("productModal");
  const productModal = new bootstrap.Modal(modalEl);

  async function renderProducts() {
    tbody.innerHTML = "";
    const products = await fetchProducts();
    console.log(products);

    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" ${product.stock > 0 ? "checked" : ""} disabled></td>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>${product.price} kr</td>
        <td>${product.stock}</td>
        <td>${product.category?.category || "-"}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-id="${product._id}">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product._id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.append(row);
    });
  
    attachEventListeners();
  }

  async function populateCategories() {
    const select = document.getElementById("productCategory");
    const categories = await fetchCategories();
    select.innerHTML = `<option value="">Välj en kategori</option>`;
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat._id;
      option.textContent = cat.category;
      select.append(option);
    });
  }

  function resetModal() {
    document.getElementById("productName").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("orderStock").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productImageUrl").value = "";
  
    const actionButton = document.getElementById("dynamicButton");
    actionButton.textContent = "Skapa";
    actionButton.setAttribute("data-mode", "create");
    actionButton.removeAttribute("data-id");
  }

  modalEl.addEventListener("hidden.bs.modal", resetModal);
  
  document.getElementById("dynamicButton").addEventListener("click", async (event) => {
    const mode = event.target.getAttribute("data-mode");
    const id = event.target.getAttribute("data-id");
  
    const name = document.getElementById("productName").value;
    const description = document.getElementById("productDescription").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("orderStock").value);
    const category = document.getElementById("productCategory").value;
    const imageUrl = document.getElementById("productImageUrl").value;

    if (!name || !price || !stock || !category) {
      alert("Alla fält måste fyllas i.");
      return;
  }
        // Validering för negativa värden
        if (isNaN(price) || price < 0) {
          alert("Priset kan inte vara negativt.");
          return;
      }
      
      if (isNaN(stock) || stock < 0) {
          alert("Lagerstatus kan inte vara negativ.");
          return;
      }
  
    const product = { name, description, price, stock, category, imageUrl };
  
    if (mode === "create") {
      await createProduct(product);
    } else if (mode === "edit" && id) {
      await updateProduct(id, product);
    }
  
    productModal.hide();
    await renderProducts();
  });

  function attachEventListeners() {
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        await deleteProduct(id);
        await renderProducts();
        alert("Produkt borttagen")
      });
    });
  
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        const products = await fetchProducts();
        const product = products.find((p) => p._id === id);
        if (!product) return;
  
        document.getElementById("productName").value = product.name;
        document.getElementById("productDescription").value = product.description;
        document.getElementById("productPrice").value = product.price;
        document.getElementById("orderStock").value = product.stock;
        document.getElementById("productCategory").value = product.category || "";
        document.getElementById("productImageUrl").value = product.imageUrl || "";
  
        const actionButton = document.getElementById("dynamicButton");
        actionButton.textContent = "Spara ändringar";
        actionButton.setAttribute("data-mode", "edit");
        actionButton.setAttribute("data-id", id);
  
        productModal.show();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    populateCategories();
    populateFilterDropdown(); // Lägg till denna
  
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/frontend/index.html"; 
        return;
    }
  
    const decoded = jwt_decode(token);
    if (!decoded || !decoded.isAdmin) {
        window.location.href = "/frontend/index.html"; 
    }
  
    // Lyssna på filtrerings-dropdown
    const filterSelect = document.getElementById("filterCategory");
    filterSelect.addEventListener("change", (e) => {
      const selectedCategoryId = e.target.value;
      renderFilteredProducts(selectedCategoryId);
    });
  });
  

  // Ladda kategorier för filterDropdown
async function populateFilterDropdown() {
  const select = document.getElementById("filterCategory");
  const categories = await fetchCategories();

  select.innerHTML = `<option value="all">Alla kategorier</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat._id;
    option.textContent = cat.category;
    select.appendChild(option);
  });
}

// Rendera produkter baserat på filterval
// Rendera produkter baserat på filterval
async function renderFilteredProducts(categoryId) {
  const products = await fetchProducts();
  const filtered = categoryId === "all" ? products : products.filter(p => p.category?._id === categoryId);

  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";  // Töm tbody för att lägga till filtrerade produkter

  filtered.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" ${product.stock > 0 ? "checked" : ""} disabled></td>
      <td>${product.name}</td>
      <td>${product.description}</td>
      <td>${product.price} kr</td>
      <td>${product.stock}</td>
      <td>${product.category?.category || "-"}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-id="${product._id}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product._id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.append(row);
  });

  attachEventListeners(); // Återaktivera event-lyssnare för de nya raderna
}

