const baseUrl = "https://hakim-livs-g05-be.vercel.app/";

import { loginUser, registerUser } from "./api.js";

// Funktion för att spara användardata i local/session storage
function saveUserData(userData) {
  const { token, user } = userData;

  if (!token) {
    console.error("Ingen token mottagen!");
    return;
  }

  sessionStorage.setItem("token", token); 
  sessionStorage.setItem("user", JSON.stringify(user)); 

  // Omdirigera beroende på användartyp
  if (user.isAdmin) {
    window.location.href = "/Frontend/dashboard/dashboard.html";
  } else {
    window.location.href = "/Frontend/index.html";
  }
}

// Inloggningsfunktion
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error");

  try {
    const userData = await loginUser({ username, password });
    saveUserData(userData);
  } catch (error) {
    errorMessage.textContent = "Felaktig e-postadress eller lösenord!";
  }
}

// Registreringsfunktion
async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById("usernameRegister").value;
  const password = document.getElementById("passwordRegister").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorMessage = document.getElementById("error");

  if (password !== confirmPassword) {
    errorMessage.textContent = "Lösenorden matchar inte!";
    return;
  }

  try {
    await registerUser({ username, password });
    window.location.href = "/Frontend/login.html"; 
  } catch (error) {
    errorMessage.textContent = "Registreringen misslyckades!";
  }
}

// Koppla event listeners
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("btn-login");
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);

  const registerBtn = document.getElementById("btn-register");
  if (registerBtn) registerBtn.addEventListener("click", handleRegister);
});
