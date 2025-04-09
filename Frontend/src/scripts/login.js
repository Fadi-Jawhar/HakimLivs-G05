document.addEventListener("DOMContentLoaded", initLogin);

function initLogin() {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleLogin();
  });
}

function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Basic demo login - NOT SECURE
  if (username === "admin" && password === "admin") {
    window.location.href = "admin.html";
  } else {
    alert("Invalid credentials: LOGGING IN ANYWAY");
    window.location.href = "admin.html";
  }
}
const baseUrl = "https://hakim-livs-g05-be.vercel.app/";
document.getElementById("btn-login").addEventListener("click", loginUser);

async function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  
  try {
    const response = await fetch(baseUrl + "api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response OK?:", response.ok);
    console.log("Response data:", data);
    
    if (response.ok) {
      // Save login status in localStorage
      localStorage.setItem("userLoggedIn", "true");
      
      // Save user information for use in checkout (optional)
      if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email || "",
        }));
      }
      
      document.getElementById("succes").innerText = "Inloggning lyckades!";
      
      // Check for saved redirect URL
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      
      setTimeout(() => {
        if (redirectUrl) {
          // Clear redirectAfterLogin from localStorage
          localStorage.removeItem("redirectAfterLogin");
          // Redirect to the saved URL
          window.location.href = redirectUrl;
        } else {
          // Otherwise, go to the homepage
          window.location.href = "/Frontend/index.html";
        }
      }, 1000);
    } else {
      document.getElementById("error").innerText = data.message || "Fel användarnamn eller lösenord";
    }
  } catch (error) {
    console.error("Login error:", error);
    document.getElementById("error").innerText = "Ett fel uppstod vid inloggningsförsöket";
  }
}

// Check if the user is already logged in on page load
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("userLoggedIn") === "true") {
    const successMessage = document.getElementById("succes");
    if (successMessage) {
      successMessage.innerText = "Du är redan inloggad!";
    }
    
    const redirectUrl = localStorage.getItem("redirectAfterLogin");
    
    if (redirectUrl) {
      localStorage.removeItem("redirectAfterLogin");
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    }
  }
});
