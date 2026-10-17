import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import { formatEntero, formatPrecio } from '../utils';

const enteroRedondo = (v) => formatEntero(Math.round(v));

export default function Stats({ productos }) {
  const totalStock = productos.reduce((acc, p) => acc + p.stock, 0);
  const valor = productos.reduce((acc, p) => acc + p.precio * p.stock, 0);
  const sinStock = productos.filter((p) => p.stock === 0).length;

  const items = [
    { label: 'Productos', value: productos.length, format: enteroRedondo },
    { label: 'Unidades en stock', value: totalStock, format: enteroRedondo },
    { label: 'Valor del inventario', value: valor, format: formatPrecio },
    { label: 'Sin stock', value: sinStock, format: enteroRedondo, warn: sinStock > 0 },
  ];

  return (
    <div className="stats">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          className={`stat ${it.warn ? 'stat--warn' : ''}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="stat__label">{it.label}</span>
          <span className="stat__value"><AnimatedNumber value={it.value} format={it.format} /></span>
        </motion.div>
      ))}
    </div>
  );
}
