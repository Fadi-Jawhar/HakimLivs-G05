export function getBaseUrl() {
  if (!window.location.href.includes('localhost')) {
    return "https://hakim-livs-g05-be.vercel.app/";
  }
  return "http://localhost:3000/";
}


export async function fetchProducts() {
  try {
    const res = await fetch(`${getBaseUrl()}api/products`);
    if (!res.ok) throw new Error("Kunde inte hämta produkter");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

