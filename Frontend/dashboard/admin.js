export function getBaseUrl() {
    if (!window.location.href.includes('localhost')) {
      return "https://hakim-livs-g05-be.vercel.app/"
    }
    return "http://localhost:3000/";
  }

  export async function fetchProducts(endpoint = "api/products") {

    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url);
    if(response.ok){
      const data = await response.json();
      return data;
    }
    return [];    
  }
  document.addEventListener("DOMContentLoaded", () => {
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
  
  document.addEventListener("DOMContentLoaded", () => {
      fetchProducts(); // Laddar produkter vid start

          // Lägg till eventlistener på knappen för att skapa en produkt
    // document.getElementById("dynamicButton").addEventListener("click", createProduct);
});

// Funktion för att skapa en ny produkt
// async function createProduct() {
//     const name = document.getElementById("productName").value.trim();
//     const price = parseFloat(document.getElementById("productPrice").value);
//     const description = document.getElementById("productDescription").value.trim() || "Ingen beskrivning";
//     const stock = parseInt(document.getElementById("orderStock").value) || 0;
//     const imageUrl = document.getElementById("productImageUrl").value;
//     const category = document.getElementById("productCategory").value;
 

      // Skapa objektet för den nya produkten
//   const newProduct = {
//     name,   
//     price,
//     description,
//     stock,
//     imageUrl,
//     category,
//     available: true,
//   };

//   try {
    // Skicka POST-förfrågan till API:et för att skapa produkten
//     const response = await fetch(`${getBaseUrl()}api/products`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(newProduct),
//     });

//     if (response.ok) {
//       const createdProduct = await response.json();
//       console.log("Produkt skapad:", createdProduct);
//       renderProducts();
//     } else {
//       console.error("Fel vid skapande av produkt:", response.statusText);
//     }
//   } catch (error) {
//     console.error("Något gick fel:", error);
//   }
// }



  