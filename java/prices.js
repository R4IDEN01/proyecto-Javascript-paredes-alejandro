// prices.js ahora expone una función para obtener precios desde data/products.json
export async function fetchPrices() {
    const url = new URL('../data/products.json', import.meta.url);
    const res = await fetch(url.href);
    if (!res.ok) throw new Error('No se pudieron cargar los precios');
    return await res.json();
}
