import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from './api/productos';
import ProductList from './components/ProductList';
import ProductLookup from './components/ProductLookup';
import ProductModal from './components/ProductModal';
import Stats from './components/Stats';
import Toasts from './components/Toasts';
import { IconHash, IconMoon, IconPlus, IconRefresh, IconSearch, IconSun } from './components/Icons';

const ease = [0.16, 1, 0.3, 1];

const temaInicial = () => {
  try { return localStorage.getItem('tema') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
  catch { return 'light'; }
};

export default function App() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('conectando'); // conectando | ok | error
  const [modal, setModal] = useState({ abierto: false, producto: null });
  const [consultaAbierta, setConsultaAbierta] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [tema, setTema] = useState(temaInicial);
  const peticion = useRef(0);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try { localStorage.setItem('tema', tema); } catch { /* sin almacenamiento */ }
  }, [tema]);

  const notificar = useCallback((mensaje, tipo = 'ok') => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, mensaje, tipo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const cargar = useCallback(async (nombre) => {
    // Descarta respuestas de búsquedas anteriores que lleguen tarde
    const actual = ++peticion.current;
    setCargando(true);
    try {
      const data = await api.listarProductos(nombre);
      if (actual !== peticion.current) return;
      setProductos(data);
      setEstado('ok');
    } catch (err) {
      if (actual !== peticion.current) return;
      setEstado('error');
      notificar(err.message, 'error');
    } finally {
      if (actual === peticion.current) setCargando(false);
    }
  }, [notificar]);

  // Búsqueda con debounce (el backend filtra con ?nombre=)
  useEffect(() => {
    const t = setTimeout(() => cargar(busqueda), busqueda ? 300 : 0);
    return () => clearTimeout(t);
  }, [busqueda, cargar]);

  const abrirCrear = () => setModal({ abierto: true, producto: null });
  const abrirEditar = (producto) => setModal({ abierto: true, producto });
  const cerrarModal = useCallback(() => setModal((m) => ({ ...m, abierto: false })), []);
  const cerrarConsulta = useCallback(() => setConsultaAbierta(false), []);
  const editarDesdeConsulta = (producto) => { setConsultaAbierta(false); abrirEditar(producto); };

  const guardar = async (datos) => {
    if (modal.producto) {
      const actualizado = await api.actualizarProducto(modal.producto.id, datos);
      setProductos((ps) => ps.map((p) => (p.id === actualizado.id ? actualizado : p)));
      notificar(`“${actualizado.nombre}” actualizado`);
    } else {
      const nuevo = await api.crearProducto(datos);
      const coincide = !busqueda || nuevo.nombre.toLowerCase().includes(busqueda.trim().toLowerCase());
      if (coincide) setProductos((ps) => [...ps, nuevo]);
      notificar(`“${nuevo.nombre}” creado`);
    }
    cerrarModal();
  };

  const eliminar = async (producto) => {
    try {
      await api.eliminarProducto(producto.id);
      setProductos((ps) => ps.filter((p) => p.id !== producto.id));
      notificar(`“${producto.nombre}” eliminado`);
      return true;
    } catch (err) {
      notificar(err.message, 'error');
      return false;
    }
  };

  const textoEstado = { conectando: 'Conectando', ok: 'API conectada', error: 'Sin conexión' }[estado];

  return (
    <div className="app">
      <div className="bg-glow" aria-hidden />

      <motion.header className="topbar" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
        <div className="brand">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span>Inventario</span>
        </div>
        <div className="topbar__right">
          <span className={`status status--${estado}`}><span className="status__dot" />{textoEstado}</span>
          <button className="icon-btn" onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')} aria-label="Cambiar tema">
            <motion.span key={tema} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.3 }} style={{ display: 'flex' }}>
              {tema === 'dark' ? <IconSun /> : <IconMoon />}
            </motion.span>
          </button>
        </div>
      </motion.header>

      <main className="container">
        <motion.section className="hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          <h1>Productos</h1>
          <p>Gestiona tu catálogo: crea, edita y controla el stock en tiempo real.</p>
        </motion.section>

        <Stats productos={productos} />

        <motion.div className="toolbar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6, ease }}>
          <label className="search">
            <IconSearch />
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre…" />
          </label>
          <button className="icon-btn icon-btn--bordered" onClick={() => setConsultaAbierta(true)} aria-label="Consultar por ID" title="Consultar por ID">
            <IconHash />
          </button>
          <button className="icon-btn icon-btn--bordered" onClick={() => cargar(busqueda)} aria-label="Recargar" title="Recargar">
            <IconRefresh className={cargando ? 'spin' : ''} />
          </button>
          <motion.button className="btn btn--primary" onClick={abrirCrear} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <IconPlus /> <span className="hide-sm">Nuevo producto</span>
          </motion.button>
        </motion.div>

        <motion.section className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.7, ease }}>
          <ProductList
            productos={productos}
            cargando={cargando && productos.length === 0}
            error={estado === 'error'}
            busqueda={busqueda.trim()}
            onEditar={abrirEditar}
            onEliminar={eliminar}
            onCrear={abrirCrear}
            onReintentar={() => cargar(busqueda)}
          />
        </motion.section>

        <footer className="footer">backendUpb · Express + PostgreSQL</footer>
      </main>

      <ProductLookup abierto={consultaAbierta} onCerrar={cerrarConsulta} onEditar={editarDesdeConsulta} />
      <ProductModal abierto={modal.abierto} producto={modal.producto} onCerrar={cerrarModal} onGuardar={guardar} />
      <Toasts toasts={toasts} />
    </div>
  );
}
