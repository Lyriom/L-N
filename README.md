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
| `CORS_ORIGIN` | URL del frontend (usa `*` solo en pruebas) |

**frontend/.env**

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL pública del backend |

## Despliegue en EasyPanel

Tres servicios:

1. **MySQL** — crea la base (p. ej. `lon`).
2. **Backend** (App) — build context `backend/`, variables de entorno con las
   credenciales de MySQL + `ADMIN_TOKEN` + `CORS_ORIGIN` (dominio del frontend).
   Tras el primer deploy, ejecuta el seed una vez: `npm run seed`.
3. **Frontend** (App) — build context `frontend/`, con `VITE_API_URL` apuntando a la
   URL del backend. Se sirve estático con nginx (ver `frontend/Dockerfile`).

La URL para compartir el panel: `https://<dominio>/admin?token=<ADMIN_TOKEN>`.

## Panel de administrador

- Acceso con **token** (en `.env` del backend) + **nombre** de quien gestiona.
- **Inventario**: buscar/filtrar, editar (nombre, talla, precio, stock, categoría,
  visibilidad), añadir y eliminar productos.
- **Vender**: descuenta stock y registra la venta (producto, talla, cantidad, precio,
  vendedor, fecha). Cuando el stock llega a 0, el producto desaparece de la tienda pública.
- **Ventas**: historial de todas las ventas registradas.
