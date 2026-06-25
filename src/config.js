/*
 * Configuración de la tienda.
 *
 * 👉 WHATSAPP_NUMBER: número al que se envían los pedidos, en formato
 *    internacional SIN "+", espacios ni guiones. Ejemplo Ecuador: 593991234567
 *    Mientras esté vacío, el botón abre WhatsApp sin destinatario fijo.
 */
export const WHATSAPP_NUMBER = '593962551884'

// Formatea las tallas (['S','M'] -> "S / M")
export function formatSizes(sizes) {
  return Array.isArray(sizes) ? sizes.join(' / ') : (sizes ?? '')
}

// Construye el enlace de WhatsApp con un mensaje pre-rellenado para el producto.
export function whatsappLink(product) {
  const tallas = formatSizes(product.sizes)
  const msg =
    `Hola LØN 👋, me interesa el *${product.name}*` +
    (product.color ? ` · Color: ${product.color}` : '') +
    (tallas ? ` · Talla: ${tallas}` : '') +
    ` · Precio: $${product.price}. ¿Está disponible?`
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(msg)}`
}
