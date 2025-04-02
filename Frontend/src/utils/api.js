export function getBaseUrl() {
  if (!window.location.href.includes('localhost')) {
    return "https://hakim-livs-g05-be.vercel.app/"
  }
  return "http://localhost:3000/";
}

export async function fetchProducts(endpoint = "api/products") {
  //! DONT USE THIS IN PRODUCTION
  const url = `${getBaseUrl()}${endpoint}`;
  const response = await fetch(url);
  if(response.ok){
    const data = await response.json();
    return data;
  }
  return [];    
}

export async function registerUser(userData) {
  const url = `${getBaseUrl()}api/auth/register`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to register user");
  }
}

export async function loginUser(credentials) {
  const url = `${getBaseUrl()}api/auth/login`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to login");
  }
}