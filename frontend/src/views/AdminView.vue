<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api, auth, photoUrl } from '../api.js'
import { useTheme } from '../composables/useTheme'

useTheme() // aplica el tema (claro/oscuro) a la página

const route = useRoute()

// ---------- Estado de sesión ----------
const authed = ref(false)
const loginToken = ref('')
const loginName = ref('')
const loginError = ref('')
const checking = ref(false)

const sellerName = ref(auth.name)

// ---------- Datos ----------
const tab = ref('inventario')
const products = ref([])
const sales = ref([])
const loading = ref(false)
const message = ref('')

const search = ref('')
const catFilter = ref('Todos')

// ---------- Modales ----------
const form = ref(null) // producto en edición/creación (objeto) o null
const sellTarget = ref(null) // producto a vender o null
const sellQty = ref(1)
const sellPrice = ref(0)
const busy = ref(false)

const categories = computed(() => [
  'Todos',
  ...Array.from(new Set(products.value.map((p) => p.category).filter(Boolean))),
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return products.value.filter((p) => {
    if (catFilter.value !== 'Todos' && p.category !== catFilter.value) return false
    if (!q) return true
    return (
      String(p.code).includes(q) ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.size || '').toLowerCase().includes(q)
    )
  })
})

function flash(msg) {
  message.value = msg
  setTimeout(() => (message.value = ''), 2500)
}

function formatPrice(v) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(v) || 0)
}

function formatDate(v) {
  if (!v) return ''
  const d = new Date(v)
  return d.toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })
}

// ---------- Sesión ----------
async function tryLogin() {
  loginError.value = ''
  if (!loginToken.value.trim()) {
    loginError.value = 'Ingresa el token.'
    return
  }
  if (!loginName.value.trim()) {
    loginError.value = 'Ingresa tu nombre.'
    return
  }
  checking.value = true
  auth.token = loginToken.value.trim()
  try {
    await api.checkToken()
    auth.name = loginName.value.trim()
    sellerName.value = auth.name
    authed.value = true
    await loadAll()
  } catch (e) {
    auth.token = ''
    loginError.value = e.status === 401 ? 'Token incorrecto.' : 'No se pudo conectar con el servidor.'
  } finally {
    checking.value = false
  }
}

function logout() {
  auth.token = ''
  authed.value = false
  products.value = []
  sales.value = []
}

// ---------- Carga de datos ----------
async function loadAll() {
  loading.value = true
  try {
    products.value = await api.adminProducts()
    sales.value = await api.sales()
  } catch (e) {
    if (e.status === 401) logout()
    else flash('Error al cargar datos.')
  } finally {
    loading.value = false
  }
}

// ---------- Editar / crear ----------
function openNew() {
  form.value = { id: null, code: '', name: '', category: '', type: '', size: '', qty: 1, price: 0, active: 1, images: [] }
}
function openEdit(p) {
  form.value = { ...p, images: Array.isArray(p.images) ? [...p.images] : [], active: p.active ? 1 : 0 }
}

// Subir fotos al producto en edición.
const uploading = ref(false)
async function onUpload(e) {
  const files = e.target.files
  if (!files?.length || !form.value?.id) return
  uploading.value = true
  try {
    const updated = await api.uploadImages(form.value.id, files)
    form.value.images = Array.isArray(updated.images) ? updated.images : []
    await loadAll()
    flash('Foto(s) subida(s).')
  } catch (err) {
    flash(err.message || 'Error al subir.')
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}
async function removeImage(i) {
  if (!form.value?.id) return
  const next = [...(form.value.images || [])]
  next.splice(i, 1)
  try {
    const updated = await api.updateProduct(form.value.id, { images: next })
    form.value.images = Array.isArray(updated.images) ? updated.images : []
    await loadAll()
  } catch (err) {
    flash(err.message || 'Error al quitar la foto.')
  }
}
async function saveForm() {
  if (!form.value) return
  busy.value = true
  try {
    const data = {
      code: Number(form.value.code) || 0,
      name: form.value.name,
      category: form.value.category,
      type: form.value.type,
      size: form.value.size,
      qty: Number(form.value.qty) || 0,
      price: Number(form.value.price) || 0,
      active: form.value.active ? true : false,
    }
    if (form.value.id) await api.updateProduct(form.value.id, data)
    else await api.createProduct(data)
    form.value = null
    await loadAll()
    flash('Guardado.')
  } catch (e) {
    flash(e.message || 'Error al guardar.')
  } finally {
    busy.value = false
  }
}

async function removeProduct(p) {
  if (!confirm(`¿Eliminar "${p.name}" (código ${p.code})? Esta acción no se puede deshacer.`)) return
  try {
    await api.deleteProduct(p.id)
    await loadAll()
    flash('Eliminado.')
  } catch (e) {
    flash(e.message || 'Error al eliminar.')
  }
}

async function toggleActive(p) {
  try {
    await api.updateProduct(p.id, { active: !p.active })
    await loadAll()
  } catch (e) {
    flash(e.message || 'Error.')
  }
}

// ---------- Vender ----------
function openSell(p) {
  sellTarget.value = p
  sellQty.value = 1
  sellPrice.value = Number(p.price) || 0
  sellerName.value = auth.name
}
async function confirmSell() {
  if (!sellTarget.value) return
  if (!sellerName.value.trim()) {
    flash('Pon tu nombre para registrar la venta.')
    return
  }
  busy.value = true
  try {
    auth.name = sellerName.value.trim()
    await api.sell(sellTarget.value.id, {
      qty: Number(sellQty.value) || 1,
      unit_price: Number(sellPrice.value) || 0,
      seller: auth.name,
    })
    sellTarget.value = null
    await loadAll()
    flash('Venta registrada.')
  } catch (e) {
    flash(e.message || 'Error al registrar la venta.')
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  // Token desde la URL: /admin?token=XXXX
  const qToken = route.query.token
  if (qToken) loginToken.value = String(qToken)
  else if (auth.token) loginToken.value = auth.token
  loginName.value = auth.name

  // Si ya hay token guardado, intentamos entrar directo.
  if (auth.token) {
    checking.value = true
    try {
      await api.checkToken()
      authed.value = true
      await loadAll()
    } catch (_) {
      auth.token = ''
    } finally {
      checking.value = false
    }
  }
})
</script>

<template>
  <!-- LOGIN -->
  <div v-if="!authed" class="login-wrap">
    <div class="login-card">
      <h1 class="login-title">LØN · Panel</h1>
      <p class="login-sub">Acceso restringido. Ingresa el token y tu nombre.</p>

      <label class="field">
        <span>Token de acceso</span>
        <input v-model="loginToken" type="password" placeholder="Token" @keyup.enter="tryLogin" />
      </label>
      <label class="field">
        <span>Tu nombre</span>
        <input v-model="loginName" type="text" placeholder="Ej: María" @keyup.enter="tryLogin" />
      </label>

      <p v-if="loginError" class="login-error">{{ loginError }}</p>

      <button class="btn btn-primary login-btn" :disabled="checking" @click="tryLogin">
        {{ checking ? 'Comprobando…' : 'Entrar' }}
      </button>
    </div>
  </div>

  <!-- PANEL -->
  <div v-else class="admin">
    <header class="admin-head">
      <div class="admin-head-inner">
        <strong class="admin-brand">LØN · Inventario</strong>
        <div class="admin-head-actions">
          <span class="seller-tag">👤 {{ auth.name }}</span>
          <button class="btn btn-ghost btn-sm" @click="logout">Salir</button>
        </div>
      </div>
      <nav class="tabs">
        <button class="tab" :class="{ active: tab === 'inventario' }" @click="tab = 'inventario'">
          Inventario
        </button>
        <button class="tab" :class="{ active: tab === 'ventas' }" @click="tab = 'ventas'">
          Ventas ({{ sales.length }})
        </button>
      </nav>
    </header>

    <div v-if="message" class="toast">{{ message }}</div>

    <main class="admin-body">
      <!-- INVENTARIO -->
      <section v-show="tab === 'inventario'">
        <div class="toolbar">
          <input v-model="search" class="input search" type="search" placeholder="Buscar por nombre, código o talla…" />
          <select v-model="catFilter" class="input">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
          <button class="btn btn-primary btn-sm" @click="openNew">+ Añadir</button>
        </div>

        <p v-if="loading" class="state">Cargando…</p>

        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Talla</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filtered" :key="p.id" :class="{ dim: !p.active || p.qty <= 0 }">
                <td>
                  <img
                    v-if="p.images && p.images.length"
                    :src="photoUrl(p.images[0])"
                    :alt="p.name"
                    class="thumb"
                  />
                  <div v-else class="thumb thumb--empty">—</div>
                </td>
                <td>{{ p.code }}</td>
                <td class="cell-name" title="Editar producto" @click="openEdit(p)">{{ p.name }}</td>
                <td>{{ p.category }}</td>
                <td>{{ p.size }}</td>
                <td>
                  <span class="stock" :class="{ zero: p.qty <= 0 }">{{ p.qty }}</span>
                </td>
                <td>{{ formatPrice(p.price) }}</td>
                <td>
                  <span class="badge" :class="p.active ? 'on' : 'off'">
                    {{ p.active ? 'Activo' : 'Oculto' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="act sell" :disabled="p.qty <= 0" title="Registrar venta" @click="openSell(p)">
                    Vender
                  </button>
                  <button class="act edit" title="Editar / subir fotos" @click="openEdit(p)">✏️ Editar</button>
                  <button class="act" :title="p.active ? 'Ocultar' : 'Activar'" @click="toggleActive(p)">
                    {{ p.active ? 'Ocultar' : 'Activar' }}
                  </button>
                  <button class="act danger" title="Eliminar" @click="removeProduct(p)">✕</button>
                </td>
              </tr>
              <tr v-if="!filtered.length">
                <td colspan="9" class="state">Sin resultados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- VENTAS -->
      <section v-show="tab === 'ventas'">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>#</th>
                <th>Producto</th>
                <th>Talla</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sales" :key="s.id">
                <td>{{ formatDate(s.sold_at) }}</td>
                <td>{{ s.code }}</td>
                <td class="cell-name">{{ s.name }}</td>
                <td>{{ s.size }}</td>
                <td>{{ s.qty }}</td>
                <td>{{ formatPrice(s.unit_price) }}</td>
                <td>{{ formatPrice(s.total) }}</td>
                <td>{{ s.seller }}</td>
              </tr>
              <tr v-if="!sales.length">
                <td colspan="8" class="state">Aún no hay ventas registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- MODAL EDITAR/CREAR -->
    <div v-if="form" class="ov" @click.self="form = null">
      <div class="sheet">
        <h3>{{ form.id ? 'Editar producto' : 'Nuevo producto' }}</h3>
        <div class="grid2">
          <label class="field"><span>Código (#)</span><input v-model="form.code" type="number" /></label>
          <label class="field"><span>Categoría</span><input v-model="form.category" type="text" /></label>
          <label class="field span2"><span>Nombre</span><input v-model="form.name" type="text" /></label>
          <label class="field"><span>Tipo</span><input v-model="form.type" type="text" placeholder="HOMBRE/MUJER…" /></label>
          <label class="field"><span>Talla</span><input v-model="form.size" type="text" /></label>
          <label class="field"><span>Stock</span><input v-model="form.qty" type="number" /></label>
          <label class="field"><span>Precio (USD)</span><input v-model="form.price" type="number" step="0.01" /></label>
          <label class="field check span2">
            <input v-model="form.active" type="checkbox" :true-value="1" :false-value="0" />
            <span>Visible en la tienda</span>
          </label>
        </div>

        <!-- Fotos -->
        <div class="img-manager">
          <span class="img-label">Fotos</span>
          <div v-if="form.id" class="img-grid">
            <div v-for="(img, i) in form.images" :key="i" class="img-thumb">
              <img :src="photoUrl(img)" alt="" />
              <button type="button" class="img-del" title="Quitar" @click="removeImage(i)">✕</button>
            </div>
            <label class="img-add" :class="{ busy: uploading }">
              <input type="file" accept="image/*" multiple hidden @change="onUpload" />
              <span>{{ uploading ? 'Subiendo…' : '+ Subir foto' }}</span>
            </label>
          </div>
          <p v-else class="img-hint">Guarda el producto primero para poder subir fotos.</p>
        </div>

        <div class="sheet-actions">
          <button class="btn btn-ghost btn-sm" @click="form = null">Cancelar</button>
          <button class="btn btn-primary btn-sm" :disabled="busy" @click="saveForm">
            {{ busy ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL VENDER -->
    <div v-if="sellTarget" class="ov" @click.self="sellTarget = null">
      <div class="sheet sheet--sm">
        <h3>Registrar venta</h3>
        <p class="sell-prod">{{ sellTarget.name }} · Talla {{ sellTarget.size }} · Stock {{ sellTarget.qty }}</p>
        <div class="grid2">
          <label class="field"><span>Cantidad</span><input v-model="sellQty" type="number" min="1" :max="sellTarget.qty" /></label>
          <label class="field"><span>Precio unitario</span><input v-model="sellPrice" type="number" step="0.01" /></label>
          <label class="field span2"><span>Vendedor</span><input v-model="sellerName" type="text" /></label>
        </div>
        <p class="sell-total">Total: <strong>{{ formatPrice((Number(sellQty) || 0) * (Number(sellPrice) || 0)) }}</strong></p>
        <div class="sheet-actions">
          <button class="btn btn-ghost btn-sm" @click="sellTarget = null">Cancelar</button>
          <button class="btn btn-primary btn-sm" :disabled="busy" @click="confirmSell">
            {{ busy ? 'Registrando…' : 'Confirmar venta' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- Login ---------- */
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: var(--bg-soft);
}
.login-card {
  width: 100%;
  max-width: 380px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 32px;
}
.login-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 6px;
}
.login-sub {
  color: var(--text-muted);
  font-size: 0.92rem;
  margin: 0 0 22px;
}
.login-error {
  color: #e5484d;
  font-size: 0.88rem;
  margin: 4px 0 0;
}
.login-btn {
  width: 100%;
  margin-top: 18px;
}

/* ---------- Campos ---------- */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.field > span {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}
.field input[type='text'],
.field input[type='number'],
.field input[type='password'],
.field input[type='search'],
.input {
  width: 100%;
  padding: 11px 13px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background-color: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
}
.field input:focus,
.input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 0;
  border-color: var(--accent);
}
.field.check {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.field.check input { width: auto; }

/* ---------- Panel ---------- */
.admin {
  min-height: 100vh;
  background-color: var(--bg-soft);
}
.admin-head {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
}
.admin-head-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.admin-brand {
  font-size: 1.1rem;
  font-weight: 700;
}
.admin-head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.seller-tag {
  font-size: 0.9rem;
  color: var(--text-muted);
}
.btn-sm {
  padding: 8px 16px;
  font-size: 0.85rem;
}
.tabs {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 4px;
}
.tab {
  padding: 12px 18px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
}
.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.admin-body {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 24px;
}
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.toolbar .search { flex: 1; min-width: 200px; }
.toolbar .input { width: auto; }

.state {
  color: var(--text-muted);
  text-align: center;
  padding: 30px 0;
}

/* ---------- Tabla ---------- */
.table-wrap {
  overflow-x: auto;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}
.table th,
.table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
  white-space: nowrap;
}
.table th {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
.table tr:last-child td { border-bottom: none; }
.table tr.dim { opacity: 0.5; }
.cell-name { white-space: normal; min-width: 180px; font-weight: 500; cursor: pointer; }
.cell-name:hover { color: var(--accent); }

.thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
}
.thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-soft);
  color: var(--text-muted);
}
.stock { font-weight: 700; }
.stock.zero { color: #e5484d; }

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}
.badge.on { background-color: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--accent); }
.badge.off { background-color: color-mix(in srgb, #e5484d 16%, transparent); color: #e5484d; }

.actions { display: flex; flex-wrap: wrap; gap: 6px; max-width: 168px; }
.act {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-color: var(--bg);
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color var(--transition), color var(--transition),
    background-color var(--transition);
}
.act:hover { border-color: var(--accent); color: var(--accent); }
.act.sell { background-color: var(--accent); color: var(--accent-contrast); border-color: var(--accent); }
.act.sell:disabled { opacity: 0.4; cursor: not-allowed; }
.act.edit { border-color: var(--accent); color: var(--accent); }
.act.danger:hover { border-color: #e5484d; color: #e5484d; }

/* ---------- Toast ---------- */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background-color: var(--text);
  color: var(--bg);
  padding: 12px 22px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: var(--shadow);
}

/* ---------- Modales (sheet) ---------- */
.ov {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
.sheet {
  width: min(560px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 26px;
}
.sheet--sm { width: min(420px, 100%); }
.sheet h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 18px; }
.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 14px;
}
.grid2 .span2 { grid-column: 1 / -1; }
.sheet-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
.sell-prod { color: var(--text-muted); margin: 0 0 16px; font-size: 0.92rem; }
.sell-total { margin: 6px 0 0; font-size: 1.05rem; }

/* ---------- Gestor de fotos ---------- */
.img-manager { margin: 8px 0 4px; }
.img-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 10px;
}
.img-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.img-thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.img-thumb img { width: 100%; height: 100%; object-fit: cover; }
.img-del {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-del:hover { background-color: #e5484d; }
.img-add {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  border: 1px dashed var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  transition: border-color var(--transition), color var(--transition);
}
.img-add:hover { border-color: var(--accent); color: var(--accent); }
.img-add.busy { opacity: 0.6; pointer-events: none; }
.img-hint { color: var(--text-muted); font-size: 0.85rem; margin: 0; }

@media (max-width: 520px) {
  .grid2 { grid-template-columns: 1fr; }
}
</style>
