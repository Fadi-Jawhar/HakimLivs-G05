import { 
    fetchCategories,
    createCategory, 
    updateCategory, 
    deleteCategory } from "../utils/api.js";

const tbody = document.querySelector("tbody");
const modalEl = document.getElementById("categoryModal");
const deleteModalEl = document.getElementById("deleteModal");
const categoryModal = new bootstrap.Modal(modalEl);
const deleteModal = new bootstrap.Modal(deleteModalEl);

async function renderCategories() {
    const categories = await fetchCategories();
    tbody.innerHTML = "";

    categories.forEach((category) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${category.category}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-id="${category._id}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${category._id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `;
        tbody.append(row);
      });
    
      attachEventListeners();
    }

    function resetModal() {
        document.getElementById("categoryName").value = "";  
        const actionButton = document.getElementById("dynamicButton");
        actionButton.textContent = "Skapa";
        actionButton.setAttribute("data-mode", "create");
        actionButton.removeAttribute("data-id");
      }

      modalEl.addEventListener("hidden.bs.modal", resetModal);

      document.getElementById("dynamicButton").addEventListener("click", async (event) => {
        const mode = event.target.getAttribute("data-mode");
        const id = event.target.getAttribute("data-id");
      
        const category = document.getElementById("categoryName").value;
    
      
        if (!category ) {
           alert("Alla fält måste fyllas i.");
          return;
         }
         if (category.length > 50 || category.length < 1) {
          alert("Kategorinamn måste vara mellan 1 och 50 tecken.");
          return;
        }

        const newCategory = { category };

        if (mode === "create") {
          await createCategory(newCategory);
        } else if (mode === "edit" && id) {
          await updateCategory(id, newCategory);
        }

        categoryModal.hide();
        await renderCategories();
      });

      function attachEventListeners() {
        document.querySelectorAll(".edit-btn").forEach((button) => {
          button.addEventListener("click", async () => {
            const id = button.dataset.id;
            const categories = await fetchCategories();
            const category = categories.find((c) => c._id === id);
            if (!category) return;
      
            document.getElementById("categoryName").value = category.category;
  
            const actionButton = document.getElementById("dynamicButton");
            actionButton.textContent = "Spara ändringar";
            actionButton.setAttribute("data-mode", "edit");
            actionButton.setAttribute("data-id", id);
      
            categoryModal.show();
          });
        });

        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", () => {
              const idInput = document.getElementById("id");
              idInput.value = button.dataset.id;
              deleteModal.show();
            });
          });
        }
        
        document.getElementById("delete-category").addEventListener("click", async () => {
          const id = document.getElementById("id").value;
          await deleteCategory(id);
          deleteModal.hide();
          await renderCategories();
        });
       
        
        document.addEventListener("DOMContentLoaded", () => {
          renderCategories();
        });