/*
 * Importa el Excel a MySQL (carga inicial).
 *   npm run seed
 *
 * - Parsea las 8 hojas de categoría por NOMBRE de columna (no por posición).
 * - Asocia las fotos por código (97 -> 97A.jpeg, 97B.jpeg...).
 * - Inserta productos nuevos; en los que ya existen solo refresca las fotos
 *   (NO toca stock/precio/nombre para no pisar ediciones del admin).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import xlsx from 'xlsx'
import { pool } from './db.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXCEL = path.resolve(__dirname, '../data/LON-LISTADO.xlsx')
const PHOTOS = path.resolve(__dirname, '../../frontend/public/products/photos')

// Hoja del Excel -> categoría mostrada.
const SHEETS = {
  CAMISETAS: 'Camisetas',
  PANTALONES: 'Pantalones',
  SACOS: 'Hoodies',
  SHORTS: 'Shorts',
  ZAPATOS: 'Zapatos',
  GORRAS: 'Gorras',
  ESSENTIAL: 'Essentials',
  LABUBUS: 'Labubus',
}

// Normaliza cabeceras: quita acentos, espacios extra y pasa a mayúsculas.
const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase()

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// Construye un mapa código -> ["97A.jpeg", ...] escaneando la carpeta de fotos.
function buildImageMap() {
  const map = {}
  if (!fs.existsSync(PHOTOS)) return map
  for (const f of fs.readdirSync(PHOTOS)) {
    const m = f.match(/^(\d+)[A-Za-z]/)
    if (!m) continue
    ;(map[m[1]] ||= []).push(f)
  }
  for (const k of Object.keys(map)) map[k].sort()
  return map
}

// Extrae las filas de inventario de una hoja, mapeando por nombre de columna.
function parseSheet(wb, sheetName, category, images) {
  const ws = wb.Sheets[sheetName]
  if (!ws) return []
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' })

  // Localiza la fila de cabecera (la que tiene "#" en alguna celda).
  let h = -1
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    if (rows[i].some((c) => norm(c) === '#')) { h = i; break }
  }
  if (h === -1) return []

  const idx = {}
  rows[h].forEach((c, i) => { idx[norm(c)] = i })
  const col = (...names) => {
    for (const n of names) if (idx[n] !== undefined) return idx[n]
    return -1
  }
  const ci = {
    code: col('#'),
    name: col('DESCRIPCION'),
    type: col('TIPO'),
    size: col('TALLA'),
    qty: col('CANTIDAD'),
    price: col('PVP'),
  }

  const out = []
  for (let i = h + 1; i < rows.length; i++) {
    const r = rows[i]
    const rawCode = r[ci.code]
    if (rawCode === '' || rawCode === null || rawCode === undefined) continue
    const code = parseInt(rawCode, 10)
    if (!Number.isInteger(code)) continue
    out.push({
      code,
      category,
      name: String(ci.name >= 0 ? r[ci.name] : '').trim(),
      type: ci.type >= 0 ? String(r[ci.type]).trim() : '',
      size: ci.size >= 0 ? String(r[ci.size]).trim() : '',
      qty: ci.qty >= 0 ? Math.round(toNum(r[ci.qty])) : 0,
      price: ci.price >= 0 ? toNum(r[ci.price]) : 0,
      images: images[String(code)] || [],
    })
  }
  return out
}

async function run() {
  // 1) Crear tablas (conexión con multipleStatements para el schema.sql).
  const sql = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8')
  const admin = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lon',
    multipleStatements: true,
  })
  await admin.query(sql)
  await admin.end()
  console.log('✓ Tablas listas')

  // 2) Leer Excel + fotos.
  const images = buildImageMap()
  const wb = xlsx.readFile(EXCEL)
  let items = []
  for (const [sheet, category] of Object.entries(SHEETS)) {
    const parsed = parseSheet(wb, sheet, category, images)
    console.log(`  ${sheet}: ${parsed.length} filas`)
    items = items.concat(parsed)
  }

  // Quitar duplicados por código (nos quedamos con la primera aparición).
  const byCode = new Map()
  for (const it of items) if (!byCode.has(it.code)) byCode.set(it.code, it)
  items = [...byCode.values()]

  // 3) Insertar (refresca solo fotos en los existentes).
  let inserted = 0
  for (const it of items) {
    const [r] = await pool.query(
      `INSERT INTO products (code, category, name, type, size, qty, price, images, active)
       VALUES (?,?,?,?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE images = VALUES(images)`,
      [it.code, it.category, it.name, it.type, it.size, it.qty, it.price, JSON.stringify(it.images)]
    )
    if (r.affectedRows === 1) inserted++
  }

  const withPhoto = items.filter((i) => i.images.length).length
  console.log(`\n✓ ${items.length} productos procesados (${inserted} nuevos)`)
  console.log(`✓ ${withPhoto} con foto, ${items.length - withPhoto} sin foto`)
  await pool.end()
  process.exit(0)
}

run().catch((e) => {
  console.error('Error en el seed:', e)
  process.exit(1)
})
