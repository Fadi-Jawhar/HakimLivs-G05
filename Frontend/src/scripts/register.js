import { loginUser } from "../utils/api.js";
const baseUrl = "https://hakim-livs-g05-be.vercel.app/";

// Hämtar adminDiv direkt
const adminDiv = document.querySelector(".form-check");

// Visa admin-rutan endast om användaren är inloggad som admin
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    adminDiv.style.display = "none";
    return;
  }

  try {
    const decoded = jwt_decode(token);

    const isUserAdmin = decoded.isAdmin
    document.getElementById("btn-register").addEventListener("click", registerUser);

    if (!isUserAdmin) {
      adminDiv.style.display = "none";
    } else {
      adminDiv.style.display = "block";
    }
  } catch (err) {
    console.error("Kunde inte avkoda token:", err);
    adminDiv.style.display = "none";
  }
});


async function registerUser(e) {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const phone = document.getElementById("register-phone").value;
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("confirmPassword").value;
  const isAdmin = document.getElementById("isAdmin").checked;  
  
  const errorMessage = document.getElementById("error");
  const successMessage = document.getElementById("succes");

  errorMessage.innerText = "";
  successMessage.innerText = "";


  if (password !== confirm) {
    errorMessage.innerText = "Lösenorden matchar inte. Försök igen.";
    return;
  }

  
  const userData = {
    username,
    email,
    phone,
    password,
    isAdmin
  };

  console.log("User data being sent to server:", userData);

 
  const response = await fetch(baseUrl + "api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)  
  });

  const data = await response.json();

  if (response.ok) {
    successMessage.innerText = "Registrering lyckades!";
    await loginUser({ username, password });
    setTimeout(() => {
      window.location.href = "../dashboard/dashboard.html"; 
    }, 1000);
  } else {
    console.log("Error response from server:", data);
    errorMessage.innerText =
      data.message || "Ett fel uppstod vid registrering.";
  }
}