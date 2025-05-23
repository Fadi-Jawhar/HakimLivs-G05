export function getBaseUrl() {
  if (!window.location.href.includes("localhost")) {
    return "https://hakim-livs-g05-be.vercel.app/";
  }
  return "http://localhost:3000/";
}

export async function fetchProducts() {
  try {
    const res = await fetch(`${getBaseUrl()}api/products`);
    return res.ok ? await res.json() : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}


export async function createProduct(product) {
  try {
    const token = localStorage.getItem("token")

    const response = await fetch(`${getBaseUrl()}api/products`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
       },
      
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error("Misslyckades att skapa en produkt.");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Något gick fel. Försök igen senare." };
  }
}

export async function updateProduct(id, product) {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${getBaseUrl()}api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(product),
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
}

export async function deleteProduct(id) {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${getBaseUrl()}api/products/${id}`, {
      method: "DELETE",
      headers: {
      Authorization: `Bearer ${token}`
    }
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${getBaseUrl()}api/category`);
    return res.ok ? await res.json() : [];
  } catch (err) {
    console.error(err);
    return [];
  }
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

  const data = await response.json();
  console.log(data)
  if (response.ok) {
    if (data && data.accessToken) {
      localStorage.setItem("token", data.accessToken);
    }
    return data;
  } else {
    throw new Error(data.message || "Failed to login");
  }
}


export async function createCategory(category) {
  try {
    const token = localStorage.getItem("token")

    const response = await fetch(`${getBaseUrl()}api/category`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
       },
      
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      throw new Error("Misslyckades att skapa kategori.");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Något gick fel. Försök igen senare." };
  }
}

export async function updateCategory(id, category) {
  try {
    const token = localStorage.getItem("token")
    
    const response = await fetch(`${getBaseUrl()}api/category/${id}`, {
      method: "PUT",
      headers: {
      "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
    
    });

    if (!response.ok) {
      throw new Error("Misslyckades att uppdatera kategori.");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Något gick fel. Försök igen senare." };
  }
}

export async function deleteCategory(id) {
  try {
    const token = localStorage.getItem("token")

    const response = await fetch(`${getBaseUrl()}api/category/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json()
      console.error("Error response:", error)
      throw new Error("Misslyckades att radera kategori.")
    }

    return await response.json()
  } catch (err) {
    console.error("Fetch error:", err)
    return { error: "Något gick fel. Försök igen senare." }
  }
}

export async function logoutUser(refToken) {
  const url = `${getBaseUrl()}api/auth/logout`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: refToken })
  });

  const data = await response.json();

  if (response.ok) {
    console.log(data)
    return data;
  } else {
    throw new Error(data.error || "Misslyckades med utloggning");
  }
}
export async function findProduct(id) {
  try {
    const res = await fetch(`${getBaseUrl()}api/products/${id}`);
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function createOrder(order, token) {
  const response = await fetch(`${getBaseUrl}/api/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(order)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Något gick fel vid skapande av beställning");
  }

  const result = await response.json();
  return result;
}
