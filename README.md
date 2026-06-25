# LØN — Tienda + Inventario

Proyecto de **LØN**: tienda pública + panel de administración de inventario.

- **`frontend/`** — Web en **Vue 3 + Vite**. Tienda pública (catálogo con fotos y
  pedido por WhatsApp) y panel de admin en `/admin` protegido por token.
- **`backend/`** — API en **Node + Express** conectada a **MySQL**. Sirve el catálogo
  público y la gestión de inventario/ventas.

La base de datos es **MySQL**; el inventario se importa una vez desde el Excel
(`backend/data/LON-LISTADO.xlsx`) y a partir de ahí MySQL es la fuente de verdad.

```
frontend/                 Web Vue (tienda + /admin)
  public/products/photos/ Fotos reales de producto (<código><A|B|C>.jpeg)
  src/
    api.js                Cliente de la API (token Bearer en localStorage)
    router.js             Rutas: / (tienda) y /admin (panel)
    views/HomeView.vue    Tienda pública
    views/AdminView.vue   Panel: login por token, inventario, ventas
    components/           Header, hero, catálogo, tarjeta, modal, footer
backend/
  data/LON-LISTADO.xlsx   Excel de origen (solo para el seed)
  src/
    server.js             API Express
    db.js                 Pool MySQL (mysql2)
    auth.js               Middleware del token de admin
    schema.sql            Tablas products / sales
    seed.js               Importa el Excel a MySQL  (npm run seed)
```

## Desarrollo local

**1. MySQL** (ejemplo con Docker):

```bash
docker run -d --name lon-mysql -e MYSQL_ROOT_PASSWORD=lonpass \
  -e MYSQL_DATABASE=lon -p 3306:3306 mysql:8
```

**2. Backend**:

```bash
cd backend
cp .env.example .env      # ajusta credenciales y ADMIN_TOKEN
npm install
npm run seed              # importa el Excel a MySQL (una vez)
npm run dev               # API en http://localhost:3001
```

**3. Frontend**:

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3001
npm install
npm run dev               # web en http://localhost:5173
```

- Tienda pública: http://localhost:5173/
- Panel admin: http://localhost:5173/admin?token=TU_TOKEN

## Variables de entorno

**backend/.env**

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto de la API (3001) |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | Conexión MySQL |
| `ADMIN_TOKEN` | Token del panel. Genera uno: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CORS_ORIGIN` | Solo si NO usas el proxy (frontend y backend en dominios distintos). Con proxy, deja `*`. |

**frontend** — variables:

| Variable | Dónde | Descripción |
| --- | --- | --- |
| `API_UPSTREAM` | Entorno del contenedor (EasyPanel) | Backend interno al que se hace proxy `/api`, p. ej. `http://thelonec_backend:3001`. |
| `VITE_API_URL` | Build (`.env`) | Opcional. Solo si prefieres apuntar a una URL de backend distinta en vez del proxy. En dev: `http://localhost:3001`. |

## Despliegue en EasyPanel

Todo bajo **un solo dominio** (el frontend hace de proxy de `/api` al backend, así no
hay CORS ni subdominios). Tres servicios en el mismo proyecto:

1. **MySQL** — ya creado. Anota el *Internal Host*, usuario, contraseña y base.
2. **Backend** (App) — *Build context* `backend/` (usa `backend/Dockerfile`).
   Variables de entorno:
   - `DB_HOST` = Internal Host de MySQL · `DB_PORT` = 3306
   - `DB_USER` / `DB_PASSWORD` / `DB_NAME`
   - `ADMIN_TOKEN` = token del panel
   - No necesita dominio público.
   - Al primer arranque crea las tablas e **importa el Excel + fotos automáticamente**
     (si el inventario está vacío). No hace falta seed manual.
3. **Frontend** (App) — *Build context* `frontend/` (usa `frontend/Dockerfile`).
   - Dominio: tu dominio público (p. ej. `thelonec.com`).
   - Variable de entorno `API_UPSTREAM` = `http://<Internal Host del backend>:3001`.

La URL para compartir el panel: `https://<dominio>/admin?token=<ADMIN_TOKEN>`.

## Panel de administrador

- Acceso con **token** (en `.env` del backend) + **nombre** de quien gestiona.
- **Inventario**: buscar/filtrar, editar (nombre, talla, precio, stock, categoría,
  visibilidad), añadir y eliminar productos.
- **Vender**: descuenta stock y registra la venta (producto, talla, cantidad, precio,
  vendedor, fecha). Cuando el stock llega a 0, el producto desaparece de la tienda pública.
- **Ventas**: historial de todas las ventas registradas.
