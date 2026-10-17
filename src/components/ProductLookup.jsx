import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { obtenerProducto } from '../api/productos';
import { IconSearch, IconX } from './Icons';
import { formatEntero, formatFecha, formatPrecio } from '../utils';

// Consulta un producto por id (GET /api/productos/:id).
// El id se envía tal cual para que el backend responda 400 (id inválido) o 404 (no existe).
export default function ProductLookup({ abierto, onCerrar, onEditar }) {
  const [id, setId] = useState('');
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState('');
  const [buscando, setBuscando] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    setId(''); setProducto(null); setError(''); setBuscando(false);
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, onCerrar]);

  const consultar = async (e) => {
    e.preventDefault();
    if (!id.trim()) { setError('Escribe un ID'); setProducto(null); return; }
    setBuscando(true); setError('');
    try {
      setProducto(await obtenerProducto(id));
    } catch (err) {
      setProducto(null);
      setError(err.message);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="modal__head">
              <div>
                <h2>Consultar por ID</h2>
                <p>Busca un producto exacto con <code>GET /api/productos/:id</code></p>
              </div>
              <button type="button" className="icon-btn" onClick={onCerrar} aria-label="Cerrar"><IconX /></button>
            </div>

            <form className="lookup" onSubmit={consultar} noValidate>
              <label className="search">
                <span className="lookup__hash">#</span>
                <input ref={inputRef} value={id} onChange={(e) => setId(e.target.value)} placeholder="ID del producto" inputMode="numeric" autoComplete="off" />
              </label>
              <button type="submit" className="btn btn--primary" disabled={buscando}>
                {buscando ? <span className="spinner" /> : <IconSearch />} Consultar
              </button>
            </form>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="error" className="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {error}
                </motion.div>
              )}
              {producto && (
                <motion.div key={producto.id} className="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="row__main">
                    <div className="row__avatar">{producto.nombre.charAt(0).toUpperCase()}</div>
                    <div className="row__text">
                      <span className="row__name">{producto.nombre}</span>
                      <span className="row__meta">#{producto.id} · {formatFecha(producto.fecha_creacion)}</span>
                    </div>
                  </div>
                  <dl className="detail__grid">
                    <div><dt>Precio</dt><dd className="row__price">{formatPrecio(producto.precio)}</dd></div>
                    <div><dt>Stock</dt><dd>{formatEntero(producto.stock)} uds</dd></div>
                  </dl>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEditar(producto)}>Editar este producto</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
