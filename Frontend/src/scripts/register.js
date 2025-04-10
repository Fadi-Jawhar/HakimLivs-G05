const baseUrl = "https://hakim-livs-g05-be.vercel.app/";

document.getElementById("btn-register").addEventListener("click", registerUser);

async function registerUser() {
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const phone =document.getElementById("register-phone").value;
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
    setTimeout(() => {
      window.location.href = "../dashboard/dashboard.html"; 
    }, 1000);
  } else {
  
    console.log("Error response from server:", data);
    errorMessage.innerText = data.message || "Ett fel uppstod vid registrering.";
  }
}