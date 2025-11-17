// prices.js ahora expone una función para obtener precios desde data/products.json
export async function fetchPrices() {
    const res = await fetch('./data/products.json');
    if (!res.ok) throw new Error('No se pudieron cargar los precios');
    return await res.json();
}