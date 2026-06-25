import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from './db.js'
import { requireAuth } from './auth.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

// Campos que el admin puede editar en un producto.
const EDITABLE = ['code', 'category', 'name', 'type', 'size', 'qty', 'price', 'active']

const num = (v, d = 0) => (v === undefined || v === null || v === '' ? d : Number(v))

// ---------- Público ----------

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Catálogo público: solo productos activos con stock.
app.get('/api/products', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, code, category, name, type, size, qty, price, images
         FROM products
        WHERE active = 1 AND qty > 0
        ORDER BY category, name`
    )
    res.json(rows)
  } catch (e) {
    next(e)
  }
})

// ---------- Admin (token) ----------

app.get('/api/admin/check', requireAuth, (_req, res) => res.json({ ok: true }))

// Inventario completo.
app.get('/api/admin/products', requireAuth, async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, code, category, name, type, size, qty, price, images, active, updated_at
         FROM products ORDER BY category, name`
    )
    res.json(rows)
  } catch (e) {
    next(e)
  }
})

// Crear producto.
app.post('/api/admin/products', requireAuth, async (req, res, next) => {
  try {
    const b = req.body || {}
    const [r] = await pool.query(
      `INSERT INTO products (code, category, name, type, size, qty, price, images, active)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        num(b.code),
        b.category || '',
        b.name || '',
        b.type || '',
        b.size || '',
        num(b.qty),
        num(b.price),
        JSON.stringify(Array.isArray(b.images) ? b.images : []),
        b.active === false ? 0 : 1,
      ]
    )
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [r.insertId])
    res.status(201).json(rows[0])
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un producto con ese código' })
    next(e)
  }
})

// Editar producto (campos parciales).
app.patch('/api/admin/products/:id', requireAuth, async (req, res, next) => {
  try {
    const b = req.body || {}
    const sets = []
    const vals = []
    for (const k of EDITABLE) {
      if (b[k] === undefined) continue
      if (k === 'qty' || k === 'code') vals.push(num(b[k]))
      else if (k === 'price') vals.push(num(b[k]))
      else if (k === 'active') vals.push(b[k] ? 1 : 0)
      else vals.push(b[k])
      sets.push(`${k} = ?`)
    }
    if (b.images !== undefined) {
      sets.push('images = ?')
      vals.push(JSON.stringify(Array.isArray(b.images) ? b.images : []))
    }
    if (!sets.length) return res.status(400).json({ error: 'Nada que actualizar' })
    vals.push(req.params.id)
    await pool.query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, vals)
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' })
    res.json(rows[0])
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un producto con ese código' })
    next(e)
  }
})

// Eliminar producto.
app.delete('/api/admin/products/:id', requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
    if (!r.affectedRows) return res.status(404).json({ error: 'No encontrado' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

// Registrar venta: descuenta stock e inserta en sales (transacción).
app.post('/api/admin/products/:id/sell', requireAuth, async (req, res, next) => {
  const conn = await pool.getConnection()
  try {
    const qty = Math.max(1, num(req.body?.qty, 1))
    const seller = (req.body?.seller || '').trim()
    if (!seller) return res.status(400).json({ error: 'Falta el nombre del vendedor' })

    await conn.beginTransaction()
    const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [req.params.id])
    if (!rows.length) {
      await conn.rollback()
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    const p = rows[0]
    if (p.qty < qty) {
      await conn.rollback()
      return res.status(400).json({ error: `Sin stock suficiente (disponible: ${p.qty})` })
    }
    const unit = req.body?.unit_price !== undefined ? num(req.body.unit_price) : Number(p.price)
    const total = unit * qty

    await conn.query('UPDATE products SET qty = qty - ? WHERE id = ?', [qty, p.id])
    await conn.query(
      `INSERT INTO sales (product_id, code, name, size, qty, unit_price, total, seller)
       VALUES (?,?,?,?,?,?,?,?)`,
      [p.id, p.code, p.name, p.size, qty, unit, total, seller]
    )
    await conn.commit()

    const [updated] = await conn.query('SELECT * FROM products WHERE id = ?', [p.id])
    res.json({ ok: true, product: updated[0] })
  } catch (e) {
    await conn.rollback().catch(() => {})
    next(e)
  } finally {
    conn.release()
  }
})

// Historial de ventas.
app.get('/api/admin/sales', requireAuth, async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sales ORDER BY sold_at DESC LIMIT 500')
    res.json(rows)
  } catch (e) {
    next(e)
  }
})

// Manejador de errores.
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Error del servidor' })
})

const port = Number(process.env.PORT) || 3001
app.listen(port, () => console.log(`LØN API escuchando en :${port}`))
