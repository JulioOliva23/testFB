# frontendT2 · Inventario

Frontend minimalista (React + Vite + framer-motion) para la API **backendUpb** (`/api/productos`).

## Funciones
- Listado de productos con animaciones de entrada/salida y skeleton de carga
- Búsqueda por nombre (usa `GET /api/productos?nombre=`) con debounce
- Crear y editar en un modal con validación igual a la del backend
- Eliminar con confirmación en línea
- Métricas animadas (productos, unidades, valor del inventario, sin stock)
- Indicador de conexión con la API, notificaciones y modo claro/oscuro

## Desarrollo
```bash
# 1. En backendUpbtest
npm run dev        # API en http://localhost:3000

# 2. En frontendT2
npm install
npm run dev        # http://localhost:5173
```
En desarrollo Vite redirige `/api` y `/health` a `localhost:3000`, así que no hace falta configurar nada.

## Producción
Crea un `.env` con la URL del backend desplegado y compila:
```bash
VITE_API_URL=https://tu-backend.onrender.com
npm run build      # genera dist/
```
`dist/` se puede publicar como Static Site en Render, Netlify o Vercel (definiendo `VITE_API_URL` en el panel).
