/*
 * Cliente de la API del backend.
 * - Lee la URL del backend de VITE_API_URL (ver .env).
 * - El token del admin se guarda en localStorage y se envía como Bearer.
 */
// En producción usamos mismo origen (el nginx del frontend hace proxy de /api al backend).
// En desarrollo apuntamos al backend local. VITE_API_URL lo sobreescribe si se define.
const fallback = import.meta.env.PROD ? '' : 'http://localhost:3001'
const API_BASE = (import.meta.env.VITE_API_URL ?? fallback).replace(/\/$/, '')

const TOKEN_KEY = 'lon_admin_token'
const NAME_KEY = 'lon_seller_name'

export const auth = {
  get token() {
    return localStorage.getItem(TOKEN_KEY) || ''
  },
  set token(v) {
    if (v) localStorage.setItem(TOKEN_KEY, v)
    else localStorage.removeItem(TOKEN_KEY)
  },
  get name() {
    return localStorage.getItem(NAME_KEY) || ''
  },
  set name(v) {
    if (v) localStorage.setItem(NAME_KEY, v)
    else localStorage.removeItem(NAME_KEY)
  },
}

// URL pública de una foto.
// - Fotos subidas desde el admin: ya vienen como ruta absoluta (/api/uploads/... o http).
// - Fotos del listado inicial: solo el nombre de archivo -> /products/photos/<nombre>.
export function photoUrl(name) {
  if (!name) return null
  if (/^https?:\/\//.test(name) || name.startsWith('/')) return name
  return `/products/photos/${name}`
}

async function request(path, { method = 'GET', body, adminAuth = false } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (adminAuth) headers['Authorization'] = `Bearer ${auth.token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let msg = `Error ${res.status}`
    try {
      const data = await res.json()
      if (data?.error) msg = data.error
    } catch (_) {}
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  // Público
  products: () => request('/api/products'),

  // Admin
  checkToken: () => request('/api/admin/check', { adminAuth: true }),
  adminProducts: () => request('/api/admin/products', { adminAuth: true }),
  createProduct: (data) => request('/api/admin/products', { method: 'POST', body: data, adminAuth: true }),
  updateProduct: (id, data) => request(`/api/admin/products/${id}`, { method: 'PATCH', body: data, adminAuth: true }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE', adminAuth: true }),
  sell: (id, data) => request(`/api/admin/products/${id}/sell`, { method: 'POST', body: data, adminAuth: true }),
  sales: () => request('/api/admin/sales', { adminAuth: true }),

  // Subida de fotos (multipart). Devuelve el producto actualizado.
  uploadImages: async (id, files) => {
    const fd = new FormData()
    for (const f of files) fd.append('images', f)
    const res = await fetch(`${API_BASE}/api/admin/products/${id}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: fd,
    })
    if (!res.ok) {
      let msg = `Error ${res.status}`
      try {
        const d = await res.json()
        if (d?.error) msg = d.error
      } catch (_) {}
      throw new Error(msg)
    }
    return res.json()
  },
}
