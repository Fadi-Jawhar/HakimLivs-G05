import { loginUser } from "../utils/api.js";
const baseUrl = "https://hakim-livs-g05-be.vercel.app/";

// Hämtar adminDiv direkt
const adminDiv = document.querySelector(".form-check");

// Visa admin-rutan endast om användaren är inloggad som admin
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  document.getElementById("btn-register").addEventListener("click", registerUser);
  let decoded = null
  let isUserAdmin = false
  if (!token) {
    adminDiv.style.display = "none";
    return;
  } else {
    try {
      decoded = jwt_decode(token);
      isUserAdmin = decoded?.isAdmin

      if (!isUserAdmin || !token) {
        adminDiv.style.display = "none";
      } else {
        adminDiv.style.display = "block";
      }
    } catch (err) {
      console.error("Kunde inte avkoda token:", err);
      adminDiv.style.display = "none";
    }
  }
})

async function registerUser(e) {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const phone = document.getElementById("register-phone").value;
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("confirmPassword").value;
  const isAdminBox = document.getElementById("isAdmin").checked;

  const errorMessage = document.getElementById("error");
  const successMessage = document.getElementById("succes");

  errorMessage.innerText = "";
  successMessage.innerText = "";

  // _______________ Validera användardata ____________________

  if (password !== confirm) {
    errorMessage.innerText = "Lösenorden matchar inte. Försök igen.";
    return;
  }

  if (username.length > 30) {
    errorMessage.innerText = "Användarnamnet får max innehålla 30 tecken.";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorMessage.innerText = "Ogiltig e-postadress.";
    return;
  }

  if (phone.length > 15) {
    errorMessage.innerText = "Telefonnumret får max innehålla 15 tecken.";
    return;
  }

  if (password.length < 6 || password.length > 30) {
    errorMessage.innerText = "Lösenordet måste vara mellan 6 och 30 tecken.";
    return;
  }

  // _______________ Skapa användarobjekt ____________________

  const token = localStorage.getItem("token");
  let decoded = null;
  let isUserAdmin = false;

  if (token) {
    try {
      decoded = jwt_decode(token);
      isUserAdmin = decoded?.isAdmin || false;
    } catch (err) {
      console.error("Kunde inte avkoda token i registerUser:", err.message);
    }
  }

  const userData = {
    username,
    email,
    phone,
    password,
    isAdmin: isUserAdmin ? isAdminBox.checked : false
  };


  const endpoint = isUserAdmin ? "api/auth/registerAdmin" : "api/auth/register";
  const response = await fetch(baseUrl + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (response.ok) {
    if (isUserAdmin) {
      if (isAdminBox?.checked) {
        successMessage.innerText = "Ny admin skapad!";
        setTimeout(() => {
          window.location.reload()
        }, 2000);
        return;
      } else {
        successMessage.innerText = "Ny användare skapad!";
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } else {
      successMessage.innerText = "Registrering lyckades!";
      await loginUser({ username, password });
      setTimeout(() => {
          window.location.href = "../index.html";
      }, 1000);
    }
  } else {
    errorMessage.innerText =
      data.message || "Ett fel uppstod vid registrering.";
  }
}

document.getElementById("register-username").addEventListener("input", () => {
  const value = document.getElementById("register-username").value;
  const error = document.getElementById("error");
  if (value.length >= 30) {
    error.innerText = "Max 30 tecken för användarnamn.";
  } else {
    error.innerText = "";
  }
});

document.getElementById("register-email").addEventListener("input", () => {
  const value = document.getElementById("register-email").value;
  const error = document.getElementById("error");
  if (value.length >= 40) {
    error.innerText = "Max 40 tecken för epost.";
  } else {
    error.innerText = "";
  }
});

document.getElementById("register-phone").addEventListener("input", () => {
  const value = document.getElementById("register-phone").value;
  const error = document.getElementById("error");
  if (value.length >= 15) {
    error.innerText = "Max 15 tecken för telefonnummer.";
  } else {
    error.innerText = "";
  }
});

document.getElementById("register-password").addEventListener("input", () => {
  const value = document.getElementById("register-password").value;
  const error = document.getElementById("error");
  if (value.length >= 30) {
    error.innerText = "Max 30 tecken för lösenord.";
  } else {
    error.innerText = "";
  }
});


document.getElementById("confirmPassword").addEventListener("input", () => {
  const password = document.getElementById("register-password").value;
  const confirm = document.getElementById("confirmPassword").value;
  const error = document.getElementById("error");

  if (confirm !== password) {
    error.innerText = "Lösenorden matchar inte.";
  } else {
    error.innerText = "";
  }
});

