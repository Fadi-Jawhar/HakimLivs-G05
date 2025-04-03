export function getBaseUrl() {
    if (!window.location.href.includes('localhost')) {
        return "https://hakim-livs-g05-be.vercel.app/";
    }
    return "http://localhost:3000/";
}

export async function fetchProducts(endpoint = "api/products") {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url);
    if (response.ok) {
        const data = await response.json();
        return data;
    }
    return [];
}

export async function fetchCategorys(endpoint = "api/category") {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url);
    if (response.ok) {
        const data = await response.json();
        return data;
    }
    return [];
}

async function fetchCategories() {
    try {
    const categories = await fetchCategorys(); 
    return categories; 
} catch (error) {
    console.error("Fel vid hämtning av kategorier:", error);
    return [];
}
}

// För att fylla det unika id för category
async function fillCategoryDropdown() {
    const categories = await fetchCategories();
    const categorySelect = document.getElementById("productCategory");
    categorySelect.innerHTML = '<option value="">Välj en kategori</option>';
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category._id; 
        option.textContent = category.category; 
        categorySelect.append(option);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetchProducts(); 
    await fillCategoryDropdown(); 
    renderProducts();
});

async function renderProducts() {
    try {
        const products = await fetchProducts();
        const tableBody = document.querySelector("table tbody");
        tableBody.innerHTML = "";

        products.forEach((product) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox" ${product.available ? "checked" : ""}></td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.price} kr</td>
                <td>${product.stock}</td>
                <td>${product.category}</td>
                <td class="text-end">
                    <button class="btn btn-sm edit-product" data-id="${product._id}">
                        <i class="fa-solid fa-pen-to-square text-dark"></i>
                    </button>
                    <button class="btn btn-sm delete-product" data-id="${product._id}">
                        <i class="fa-solid fa-trash text-dark"></i>
                    </button>
                </td>
            `;
            tableBody.append(row);
        });
    } catch (error) {
        console.error("Fel vid hämtning av produkter:", error);
    }
}

document.getElementById("dynamicButton").addEventListener("click", async () => {
    const name = document.getElementById("productName").value;
    const description = document.getElementById("productDescription").value;
    const price = document.getElementById("productPrice").value;
    const stockValue = document.getElementById("orderStock").value;
    const categoryId = document.getElementById("productCategory").value;
    const imageUrl = document.getElementById("productImageUrl").value;

    if (!name || !description || !price || !stockValue || !categoryId || !imageUrl) {
        alert("Fyll i alla fält för att skapa en produkt.");
        return;
    }

    const newProduct = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stockValue, 10),
        category: categoryId,
        imageUrl
    };


    try {
        const response = await fetch(`${getBaseUrl()}api/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newProduct),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Produkten skapades framgångsrikt!");
            const modal = bootstrap.Modal.getInstance(document.getElementById("productModal"));
            modal.hide();
            renderProducts();
        } else {
            alert(`Något gick fel: ${result.message}`);
        }
    } catch (error) {
        console.error("Fel vid skapande av produkt:", error);
        alert("Fel vid skapande av produkt. Försök igen.");
    }
});



