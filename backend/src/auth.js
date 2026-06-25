import crypto from 'node:crypto'

// Comparación en tiempo constante para no filtrar el token por timing.
function safeEqual(a, b) {
  const ba = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

// Middleware: exige Authorization: Bearer <ADMIN_TOKEN>.
export function requireAuth(req, res, next) {
  const expected = process.env.ADMIN_TOKEN
  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_TOKEN no configurado en el servidor' })
  }
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token || !safeEqual(token, expected)) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  next()
}
