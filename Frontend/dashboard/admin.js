document.addEventListener("DOMContentLoaded", () => {
    fetchProducts(); 
});

async function fetchProducts() {
    try {
        const response = await fetch("https://hakim-livs-g05-be.vercel.app/api/products");
        const products = await response.json();

        const tableBody = document.querySelector("table tbody") || document.createElement("tbody");
        tableBody.innerHTML = ""; 

        products.forEach((product) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><input type="checkbox" ${product.available ? "checked" : ""}></td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.price} kr</td>
                <td>${product.stockStatus}</td>
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

        document.querySelector("table").append(tableBody);

        // Lägg till eventlyssnare
        document.querySelectorAll(".delete-product").forEach((btn) =>
            btn.addEventListener("click", deleteProduct)
        );

        document.querySelectorAll(".edit-product").forEach((btn) =>
            btn.addEventListener("click", editProduct)
        );
    } catch (error) {
        console.error("Fel vid hämtning av produkter:", error);
    }
}
