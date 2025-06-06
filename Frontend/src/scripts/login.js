const baseUrl = "https://hakim-livs-g05-be.vercel.app/";


document.getElementById("btn-login").addEventListener("click", loginUser);

async function loginUser() { 
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

// ____________________VALIDERING_____________________________________________

if (username.length >= 30 ) {
  errorMessage.innerText = "Användarnamnet får max innehålla 30 tecken.";
    return;
}

if (password.length >= 30 ) {
  errorMessage.innerText = "Lösenordet får max innehålla 30 tecken.";
    return;
}

// ___________________________________________________________________________
  

  const response = await fetch(baseUrl + "api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();


  if (response.ok) {
    if (data && data.accessToken) {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refToken', data.refreshToken);
      document.getElementById("succes").innerText = "Inloggning lyckades!";
      const decoded = jwt_decode(data.accessToken);
      setTimeout(() => {
        decoded.isAdmin ? window.location.href = "../dashboard/dashboard.html": window.location.href = "../index.html"
      }, 1000);
    } else {
      document.getElementById("error").innerText = "Ogiltigt användardata i svaret.";
    }
  } else {
    document.getElementById("error").innerText =
      data.message || "Fel användarnamn eller lösenord";
  }
}

document.getElementById("login-username").addEventListener("input", () => {
  const value = document.getElementById("login-username").value;
  const error = document.getElementById("error");
  if (value.length >= 30) {
    error.innerText = "Max 30 tecken för användarnamn.";
  } else {
    error.innerText = "";
  }
});

document.getElementById("login-password").addEventListener("input", () => {
  const value = document.getElementById("login-password").value;
  const error = document.getElementById("error");
  if (value.length >= 30) {
    error.innerText = "Max 30 tecken för lösenord.";
  } else {
    error.innerText = "";
  }
});


