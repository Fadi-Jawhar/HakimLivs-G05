const baseUrl = "https://hakim-livs-g05-be.vercel.app/";



async function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const response = await fetch(baseUrl + "api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (response.ok) {
    document.getElementById("succes").innerText =
      "Inloggning lyckades!";
    setTimeout(() => {
      window.location.href = "./Frontend/index.html";
    }, 1000);
  } else {
    document.getElementById("error").innerText =
      "Fel användarnamn eller lösenord ";
  }
}