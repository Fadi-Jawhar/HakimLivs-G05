const baseUrl = "https://hakim-livs-g05-be.vercel.app/";

document.getElementById("btn-login").addEventListener("click", loginUser);

async function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

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
    
    if (data && data.accessToken) {
    
      localStorage.setItem('token', data.accessToken);

      document.getElementById("succes").innerText = "Inloggning lyckades!";

      
      setTimeout(() => {
        window.location.href = "../dashboard/dashboard.html"; 
      }, 1000);
    } else {
      document.getElementById("error").innerText = "Ogiltigt användardata i svaret.";
    }
  } else {
    document.getElementById("error").innerText =
      data.message || "Fel användarnamn eller lösenord";
  }
}
