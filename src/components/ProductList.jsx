import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { IconAlert, IconBox, IconEdit, IconTrash } from './Icons';
import { formatEntero, formatFecha, formatPrecio } from '../utils';

const ease = [0.16, 1, 0.3, 1];

const stockClase = (stock) => (stock === 0 ? 'pill--out' : stock < 10 ? 'pill--low' : 'pill--ok');

function Fila({ producto, index, onEditar, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const confirmar = async () => {
    setBorrando(true);
    const ok = await onEliminar(producto);
    if (!ok) { setBorrando(false); setConfirmando(false); }
  };

  return (
    <motion.li
      layout
      className="row"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 12) * 0.035, duration: 0.5, ease } }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
    >
      <div className="row__main">
        <div className="row__avatar">{producto.nombre.charAt(0).toUpperCase()}</div>
        <div className="row__text">
          <span className="row__name">{producto.nombre}</span>
          <span className="row__meta">#{producto.id} · {formatFecha(producto.fecha_creacion)}</span>
        </div>
      </div>
      <span className="row__price">{formatPrecio(producto.precio)}</span>
      <span className={`pill ${stockClase(producto.stock)}`}>
        {producto.stock === 0 ? 'Agotado' : `${formatEntero(producto.stock)} uds`}
      </span>
      <div className="row__actions">
        <AnimatePresence mode="wait" initial={false}>
          {confirmando ? (
            <motion.div key="confirm" className="confirm"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}>
              <button className="btn btn--danger btn--sm" onClick={confirmar} disabled={borrando}>
                {borrando ? <span className="spinner" /> : 'Eliminar'}
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => setConfirmando(false)} disabled={borrando}>Cancelar</button>
            </motion.div>
          ) : (
            <motion.div key="actions" className="confirm"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}>
              <button className="icon-btn" onClick={() => onEditar(producto)} aria-label="Editar"><IconEdit /></button>
              <button className="icon-btn icon-btn--danger" onClick={() => setConfirmando(true)} aria-label="Eliminar"><IconTrash /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

export default function ProductList({ productos, cargando, error, busqueda, onEditar, onEliminar, onCrear, onReintentar }) {
  if (cargando) {
    return (
      <ul className="list">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="row row--skeleton" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="sk sk--avatar" /><div className="sk sk--line" /><div className="sk sk--short" />
          </li>
        ))}
      </ul>
    );
  }

  if (error && productos.length === 0) {
    return (
      <motion.div className="empty" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
        <div className="empty__icon empty__icon--error"><IconAlert width={28} height={28} /></div>
        <h3>No se pudo conectar con la API</h3>
        <p>Verifica que el backend esté corriendo o revisa VITE_API_URL.</p>
        <button className="btn btn--primary" onClick={onReintentar}>Reintentar</button>
      </motion.div>
    );
  }

  if (productos.length === 0) {
    return (
      <motion.div className="empty" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
        <motion.div className="empty__icon" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
          <IconBox width={28} height={28} />
        </motion.div>
        {busqueda ? (
          <><h3>Sin resultados</h3><p>No hay productos que coincidan con “{busqueda}”.</p></>
        ) : (
          <><h3>Aún no hay productos</h3><p>Crea el primero para empezar a armar tu inventario.</p>
            <button className="btn btn--primary" onClick={onCrear}>Nuevo producto</button></>
        )}
      </motion.div>
    );
  }

  return (
    <>
      <div className="list__head">
        <span>Producto</span><span>Precio</span><span>Stock</span><span />
      </div>
      <ul className="list">
        <AnimatePresence initial={true} mode="popLayout">
          {productos.map((p, i) => (
            <Fila key={p.id} producto={p} index={i} onEditar={onEditar} onEliminar={onEliminar} />
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}
