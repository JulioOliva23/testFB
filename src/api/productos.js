// Cliente de la API backendUpb. Todas las rutas devuelven JSON excepto DELETE (204).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const request = async (path, options = {}) => {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
};

export const health = () => request('/health');

export const listarProductos = (nombre = '') => {
  const q = nombre.trim() ? `?nombre=${encodeURIComponent(nombre.trim())}` : '';
  return request(`/api/productos${q}`);
};

export const crearProducto = (datos) =>
  request('/api/productos', { method: 'POST', body: JSON.stringify(datos) });

export const actualizarProducto = (id, datos) =>
  request(`/api/productos/${id}`, { method: 'PUT', body: JSON.stringify(datos) });

export const eliminarProducto = (id) =>
  request(`/api/productos/${id}`, { method: 'DELETE' });
