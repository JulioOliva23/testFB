const numero = new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const entero = new Intl.NumberFormat('es');
const fecha = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatPrecio = (n) => `$${numero.format(n)}`;
export const formatEntero = (n) => entero.format(n);
export const formatFecha = (iso) => (iso ? fecha.format(new Date(iso)) : '—');

// Mismas reglas que el DTO del backend, para avisar antes de enviar
export const PRECIO_MAXIMO = 99999999.99;
export const STOCK_MAXIMO = 2147483647;

export const validarProducto = ({ nombre, precio, stock }) => {
  const errores = {};
  const n = nombre.trim();
  if (!n) errores.nombre = 'El nombre es obligatorio';
  else if (n.length > 100) errores.nombre = 'Máximo 100 caracteres';

  const p = Number(precio);
  if (precio === '') errores.precio = 'El precio es obligatorio';
  else if (!Number.isFinite(p) || p <= 0) errores.precio = 'Debe ser mayor a 0';
  else if (p > PRECIO_MAXIMO) errores.precio = 'Precio demasiado alto';

  const s = Number(stock);
  if (stock === '') errores.stock = 'El stock es obligatorio';
  else if (!Number.isInteger(s) || s < 0) errores.stock = 'Entero mayor o igual a 0';
  else if (s > STOCK_MAXIMO) errores.stock = 'Stock demasiado alto';

  return errores;
};
