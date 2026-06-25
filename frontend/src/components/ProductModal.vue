<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { formatSizes, instagramLink, openInstagramOrder, whatsappLink } from '../config.js'

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

// Foto activa de la galería y talla seleccionada (se reinician al abrir otro producto).
const activeImage = ref(null)
const selectedSize = ref(null)
watch(
  () => props.product,
  (p) => {
    activeImage.value = p?.image || null
    selectedSize.value = p?.sizes?.length ? p.sizes[0] : null
  }
)

// Variante (talla) activa y su precio.
const activeVariant = computed(() => {
  const variants = props.product?.variants || []
  return variants.find((v) => v.size === selectedSize.value) || variants[0] || null
})
const activePrice = computed(() =>
  activeVariant.value ? activeVariant.value.price : props.product?.price ?? 0
)

// Objeto para el enlace de WhatsApp con la talla y precio elegidos.
const waProduct = computed(() => ({
  name: props.product?.name,
  sizes: selectedSize.value || '',
  price: activePrice.value,
}))

function formatPrice(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function close() {
  emit('close')
}

function onKey(e) {
  if (e.key === 'Escape') close()
}

// Bloquea el scroll del fondo y escucha Escape solo mientras el modal está abierto.
watch(
  () => props.product,
  (p) => {
    if (typeof document === 'undefined') return
    if (p) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }
)

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKey)
  }
})
</script>

<template>
  <Transition name="modal">
    <div v-if="product" class="overlay" @click.self="close">
      <div class="dialog">
        <button class="close" type="button" aria-label="Cerrar" @click="close">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div class="modal" role="dialog" aria-modal="true" :aria-label="product.name">
          <div class="modal-media">
            <img v-if="activeImage" :src="activeImage" :alt="product.name" />
            <div v-else class="modal-placeholder">
              <img src="/logo-mark.png" alt="" class="modal-placeholder-logo" />
              <span>Foto próximamente</span>
            </div>

            <div v-if="product.gallery && product.gallery.length > 1" class="modal-thumbs">
              <button
                v-for="(img, i) in product.gallery"
                :key="i"
                type="button"
                class="modal-thumb"
                :class="{ active: img === activeImage }"
                @click="activeImage = img"
              >
                <img :src="img" :alt="`${product.name} ${i + 1}`" />
              </button>
            </div>
          </div>

        <div class="modal-body">
          <p class="modal-category">{{ product.category }}</p>
          <h3 class="modal-name">{{ product.name }}</h3>

          <div v-if="product.sizes && product.sizes.length" class="size-picker">
            <span class="size-label">Talla</span>
            <div class="size-options">
              <button
                v-for="s in product.sizes"
                :key="s"
                type="button"
                class="size-btn"
                :class="{ active: s === selectedSize }"
                @click="selectedSize = s"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <ul class="modal-specs">
            <li v-if="product.type"><span>Tipo</span><strong>{{ product.type }}</strong></li>
            <li v-if="selectedSize"><span>Talla</span><strong>{{ selectedSize }}</strong></li>
            <li><span>Precio</span><strong>{{ formatPrice(activePrice) }}</strong></li>
          </ul>

          <p class="modal-note">Puedes pedir por Instagram o WhatsApp.</p>

          <div class="modal-actions">
            <a
              :href="whatsappLink(waProduct)"
              target="_blank"
              rel="noopener noreferrer"
              class="order-btn order-btn--wa"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15h-.01c-1.52 0-3.01-.41-4.31-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
              </svg>
              Pedir por WhatsApp
            </a>
            <a
              :href="instagramLink()"
              target="_blank"
              rel="noopener noreferrer"
              class="order-btn order-btn--ig"
              @click.prevent="openInstagramOrder(waProduct)"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <path d="M17.5 6.5h.01" />
              </svg>
              Pedir por Instagram
            </a>
          </div>
        </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}

.dialog {
  position: relative;
  width: min(860px, 100%);
  max-height: 90vh;
}

.modal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.close {
  position: absolute;
  top: -14px;
  right: -14px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background-color: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  transition: background-color var(--transition), transform var(--transition),
    border-color var(--transition), box-shadow var(--transition);
}

.close svg {
  transition: transform var(--transition);
}

.close:hover {
  background-color: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.close:hover svg {
  transform: rotate(90deg);
}

.close:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.modal-media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  background-color: var(--bg-soft);
  overflow: hidden;
}

.modal-media > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.modal-thumbs {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 0 10px;
}

.modal-thumb {
  width: 46px;
  height: 46px;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: border-color var(--transition), transform var(--transition);
}

.modal-thumb.active {
  border-color: var(--accent);
}

.modal-thumb:hover {
  transform: translateY(-2px);
}

.modal-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 100%;
  width: 100%;
  color: var(--text-muted);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 14%, var(--bg-soft)),
    var(--bg-soft)
  );
}

.modal-placeholder-logo {
  width: 42%;
  max-width: 140px;
  opacity: 0.6;
}

[data-theme="dark"] .modal-placeholder-logo {
  filter: brightness(0) invert(1);
  opacity: 0.5;
}

.modal-placeholder span {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
}

.modal-category {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin: 0 0 8px;
}

.modal-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 14px;
}

.modal-desc {
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0 0 24px;
}

.size-picker {
  margin: 0 0 22px;
}

.size-label {
  display: block;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-btn {
  min-width: 46px;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background-color: var(--bg);
  color: var(--text);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color var(--transition), background-color var(--transition),
    color var(--transition);
}

.size-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.size-btn.active {
  background-color: var(--accent);
  border-color: var(--accent);
  color: var(--accent-contrast);
}

.modal-specs {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  border-top: 1px solid var(--border);
}

.modal-specs li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.modal-specs span {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.modal-specs strong {
  font-weight: 600;
}

.modal-note {
  font-size: 0.9rem;
  color: var(--accent);
  margin: 0 0 20px;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.order-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1 1 190px;
  min-height: 50px;
  padding: 13px 14px;
  border-radius: var(--radius);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background-color var(--transition), transform var(--transition);
}

.order-btn:hover {
  transform: translateY(-2px);
}

.order-btn--wa {
  background-color: #25d366;
}

.order-btn--wa:hover {
  background-color: #1ebe5d;
}

.order-btn--ig {
  background-color: #e1306c;
}

.order-btn--ig:hover {
  background-color: #c72c61;
}

/* Transición de entrada/salida */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .dialog,
.modal-leave-active .dialog {
  transition: transform 0.25s ease;
}

.modal-enter-from .dialog,
.modal-leave-to .dialog {
  transform: translateY(16px) scale(0.98);
}

@media (max-width: 680px) {
  .dialog {
    max-height: 92vh;
  }
  .modal {
    grid-template-columns: 1fr;
    max-height: 92vh;
    overflow-y: auto;
  }
  .modal-media {
    aspect-ratio: auto;
    padding: 10px 10px 0;
  }
  .modal-media img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 34vh;
  }
  .modal-body {
    padding: 16px 22px 20px;
  }
  .modal-name {
    font-size: 1.3rem;
    margin-bottom: 8px;
  }
  .modal-desc {
    margin-bottom: 14px;
  }
  .modal-specs {
    margin-bottom: 14px;
  }
  .modal-specs li {
    padding: 9px 0;
  }
  .modal-note {
    margin-bottom: 12px;
  }
}
</style>
