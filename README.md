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
`dist/` se puede publicar en cualquier hosting estático; este proyecto está configurado para **Firebase Hosting**.

## Despliegue en Firebase Hosting
El proyecto de Firebase se define en `.firebaserc` y en los dos workflows de `.github/workflows/` (`projectId`). Reemplaza `testfb-app` por el ID real de tu proyecto en los tres lugares.

### Automático (GitHub Actions)
- **Push a `main`** → despliega a producción (`firebase-hosting-merge.yml`).
- **Pull request** → genera una URL de vista previa (`firebase-hosting-pull-request.yml`).

Configura en el repo de GitHub (Settings → Secrets and variables → Actions):

| Tipo | Nombre | Valor |
|---|---|---|
| Secret | `FIREBASE_SERVICE_ACCOUNT` | JSON de una cuenta de servicio con rol *Firebase Hosting Admin* |
| Variable | `VITE_API_URL` | URL del backend en Render, sin barra final |

`VITE_API_URL` se incrusta en el bundle **al compilar**: si la cambias, vuelve a desplegar.

### Manual (desde tu máquina)
```bash
npx firebase-tools login
npm run deploy     # build + firebase deploy --only hosting
```
Para el deploy manual, define `VITE_API_URL` en un archivo `.env` antes de ejecutarlo.
