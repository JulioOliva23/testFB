import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { IconX } from './Icons';
import { validarProducto } from '../utils';

const vacio = { nombre: '', precio: '', stock: '' };

export default function ProductModal({ abierto, producto, onCerrar, onGuardar }) {
  const [form, setForm] = useState(vacio);
  const [errores, setErrores] = useState({});
  const [tocado, setTocado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');
  const inputRef = useRef(null);
  const editando = Boolean(producto);

  useEffect(() => {
    if (!abierto) return;
    setForm(producto ? { nombre: producto.nombre, precio: String(producto.precio), stock: String(producto.stock) } : vacio);
    setErrores({}); setTocado(false); setErrorServidor(''); setGuardando(false);
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [abierto, producto]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => { if (e.key === 'Escape' && !guardando) onCerrar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, guardando, onCerrar]);

  const cambiar = (campo) => (e) => {
    const siguiente = { ...form, [campo]: e.target.value };
    setForm(siguiente);
    if (tocado) setErrores(validarProducto(siguiente));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setTocado(true);
    const errs = validarProducto(form);
    setErrores(errs);
    if (Object.keys(errs).length) return;
    setGuardando(true); setErrorServidor('');
    try {
      await onGuardar({ nombre: form.nombre.trim(), precio: Number(form.precio), stock: Number(form.stock) });
    } catch (err) {
      setErrorServidor(err.message);
      setGuardando(false);
    }
  };

  const campo = (name, label, props = {}) => (
    <label className={`field ${errores[name] ? 'field--error' : ''}`}>
      <span className="field__label">{label}</span>
      <input name={name} value={form[name]} onChange={cambiar(name)} autoComplete="off" {...props} />
      <AnimatePresence>
        {errores[name] && (
          <motion.span className="field__error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {errores[name]}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget && !guardando) onCerrar(); }}>
          <motion.form
            className="modal" onSubmit={enviar} noValidate
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="modal__head">
              <div>
                <h2>{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
                <p>{editando ? `Actualiza los datos de #${producto.id}` : 'Completa los datos para agregarlo al inventario'}</p>
              </div>
              <button type="button" className="icon-btn" onClick={onCerrar} disabled={guardando} aria-label="Cerrar"><IconX /></button>
            </div>

            {campo('nombre', 'Nombre', { ref: inputRef, placeholder: 'Ej. Teclado mecánico', maxLength: 120 })}
            <div className="field-row">
              {campo('precio', 'Precio', { type: 'number', step: '0.01', min: '0', placeholder: '0.00', inputMode: 'decimal' })}
              {campo('stock', 'Stock', { type: 'number', step: '1', min: '0', placeholder: '0', inputMode: 'numeric' })}
            </div>

            <AnimatePresence>
              {errorServidor && (
                <motion.div className="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {errorServidor}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="modal__foot">
              <button type="button" className="btn btn--ghost" onClick={onCerrar} disabled={guardando}>Cancelar</button>
              <button type="submit" className="btn btn--primary" disabled={guardando}>
                {guardando ? <><span className="spinner" /> Guardando</> : editando ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
