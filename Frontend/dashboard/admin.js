// export function getBaseUrl() {
//     if (!window.location.href.includes('localhost')) {
//         return "https://hakim-livs-g05-be.vercel.app/";
//     }
//     return "http://localhost:3000/";
// }

// export async function fetchProducts(endpoint = "api/products") {
//     const url = `${getBaseUrl()}${endpoint}`;
//     const response = await fetch(url);
//     if (response.ok) {
//         const data = await response.json();
//         return data;
//     }
//     return [];
// }

// export async function fetchCategorys(endpoint = "api/category") {
//     const url = `${getBaseUrl()}${endpoint}`;
//     const response = await fetch(url);
//     if (response.ok) {
//         const data = await response.json();
//         return data;
//     }
//     return [];
// }

// async function fetchCategories() {
//     try {
//     const categories = await fetchCategorys(); 
//     return categories; 
// } catch (error) {
//     console.error("Fel vid hämtning av kategorier:", error);
//     return [];
// }
// }

// // För att fylla det unika id för category
// async function fillCategoryDropdown() {
//     const categories = await fetchCategories();
//     const categorySelect = document.getElementById("productCategory");
//     categorySelect.innerHTML = '<option value="">Välj en kategori</option>';
//     categories.forEach(category => {
//         const option = document.createElement("option");
//         option.value = category._id; 
//         option.textContent = category.category; 
//         categorySelect.append(option);
//     });
// }

// document.addEventListener("DOMContentLoaded", async () => {
//     await fetchProducts(); 
//     await fillCategoryDropdown(); 
//     renderProducts();
// });

// async function renderProducts() {
//     try {
//         const products = await fetchProducts();
//         const tableBody = document.querySelector("table tbody");
//         tableBody.innerHTML = "";

//         products.forEach((product) => {
//             const row = document.createElement("tr");
//             row.innerHTML = `
//                 <td><input type="checkbox" ${product.available ? "checked" : ""}></td>
//                 <td>${product.name}</td>
//                 <td>${product.description}</td>
//                 <td>${product.price} kr</td>
//                 <td>${product.stock}</td>
//                 <td>${product.category}</td>
//                 <td class="text-end">
//                     <button class="btn btn-sm edit-product" data-id="${product._id}">
//                         <i class="fa-solid fa-pen-to-square text-dark"></i>
//                     </button>
//                     <button class="btn btn-sm delete-product" data-id="${product._id}">
//                         <i class="fa-solid fa-trash text-dark"></i>
//                     </button>
//                 </td>
//             `;
//             tableBody.append(row);
//         });
//     } catch (error) {
//         console.error("Fel vid hämtning av produkter:", error);
//     }
// }

// document.getElementById("dynamicButton").addEventListener("click", async () => {
//     const name = document.getElementById("productName").value;
//     const description = document.getElementById("productDescription").value;
//     const price = document.getElementById("productPrice").value;
//     const stockValue = document.getElementById("orderStock").value;
//     const categoryId = document.getElementById("productCategory").value;
//     const imageUrl = document.getElementById("productImageUrl").value;

//     if (!name || !description || !price || !stockValue || !categoryId || !imageUrl) {
//         alert("Fyll i alla fält för att skapa en produkt.");
//         return;
//     }

//     const newProduct = {
//         name,
//         description,
//         price: parseFloat(price),
//         stock: parseInt(stockValue, 10),
//         category: categoryId,
//         imageUrl
//     };


//     try {
//         const response = await fetch(`${getBaseUrl()}api/products`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(newProduct),
//         });

//         const result = await response.json();
//         if (response.ok) {
//             alert("Produkten skapades framgångsrikt!");
//             const modal = bootstrap.Modal.getInstance(document.getElementById("productModal"));
//             modal.hide();
//             renderProducts();
//         } else {
//             alert(`Något gick fel: ${result.message}`);
//         }
//     } catch (error) {
//         console.error("Fel vid skapande av produkt:", error);
//         alert("Fel vid skapande av produkt. Försök igen.");
//     }
// });


// === BASE URL DYNAMISKT ===
function getBaseUrl() {
    if (!window.location.href.includes("localhost")) {
      return "https://hakim-livs-g05-be.vercel.app/";
    }
    return "http://localhost:3000/";
  }
  
  // === API-FUNKTIONER ===
  async function fetchProducts() {
    try {
      const res = await fetch(`${getBaseUrl()}api/products`);
      if (!res.ok) throw new Error("Kunde inte hämta produkter");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  
  async function createProduct(product) {
    try {
      const res = await fetch(`${getBaseUrl()}api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  }
  
  async function updateProduct(id, updatedProduct) {
    try {
      const res = await fetch(`${getBaseUrl()}api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  }
  
  async function deleteProduct(id) {
    try {
      const res = await fetch(`${getBaseUrl()}api/products/${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  }
  
  async function fetchCategories() {
    try {
      const res = await fetch(`${getBaseUrl()}api/category`);
      if (!res.ok) throw new Error("Kunde inte hämta kategorier");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  }
  
  // === ELEMENTS ===
  const tbody = document.querySelector("tbody");
  const modalEl = document.getElementById("productModal");
  const productModal = new bootstrap.Modal(modalEl);
  
  // === RENDERA PRODUKTER ===
  async function renderProducts() {
    const products = await fetchProducts();
    tbody.innerHTML = "";
  
    products.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" ${product.stock > 0 ? "checked" : ""} disabled></td>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>${product.price} kr</td>
        <td>${product.stock}</td>
        <td>${product.category || "-"}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-id="${product._id}">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product._id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  
    attachEventListeners();
  }
  
  // === FYLL KATEGORIER I SELECT ===
  async function populateCategories() {
    const select = document.getElementById("productCategory");
    const categories = await fetchCategories();
    select.innerHTML = `<option value="">Välj en kategori</option>`;
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat._id;
      option.textContent = cat.category;
      select.appendChild(option);
    });
  }
  
  // === RESET MODAL ===
  function resetModal() {
    document.getElementById("productName").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("orderStock").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productImageUrl").value = "";
  
    const button = document.getElementById("dynamicButton");
    button.textContent = "Skapa";
    button.setAttribute("data-mode", "create");
    button.removeAttribute("data-id");
  }
  
  // === MODAL-STÄNGNING ===
  modalEl.addEventListener("hidden.bs.modal", resetModal);
  
  // === LÄGG TILL ELLER SPARA ÄNDRINGAR ===
  document.getElementById("dynamicButton").addEventListener("click", async (event) => {
    const mode = event.target.getAttribute("data-mode");
    const id = event.target.getAttribute("data-id");
  
    const name = document.getElementById("productName").value;
    const description = document.getElementById("productDescription").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("orderStock").value);
    const category = document.getElementById("productCategory").value;
    const imageUrl = document.getElementById("productImageUrl").value;
  
    const product = { name, description, price, stock, category, imageUrl };
  
    if (mode === "create") {
      await createProduct(product);
    } else if (mode === "edit" && id) {
      await updateProduct(id, product);
    }
  
    productModal.hide();
    await renderProducts();
  });
  
  // === EVENT-LISTENERS FÖR RADERNA ===
  function attachEventListeners() {
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        await deleteProduct(id);
        await renderProducts();
      });
    });
  
    document.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.id;
        const products = await fetchProducts();
        const product = products.find(p => p._id === id);
        if (!product) return;
  
        // Fyll modal med produktdata
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
  
  // === INIT ===
  document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    populateCategories();
  });
  

