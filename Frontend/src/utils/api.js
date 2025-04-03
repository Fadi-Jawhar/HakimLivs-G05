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
    const res = await fetch(`${getBaseUrl()}api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

export async function updateProduct(id, product) {
  try {
    const res = await fetch(`${getBaseUrl()}api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

export async function deleteProduct(id) {
  try {
    const res = await fetch(`${getBaseUrl()}api/products/${id}`, {
      method: "DELETE",
    });
    return await res.json();
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
