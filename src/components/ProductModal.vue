<script setup>
import { watch, onUnmounted } from 'vue'
import { formatSizes, whatsappLink } from '../config.js'

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

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
      <div class="modal" role="dialog" aria-modal="true" :aria-label="product.name">
        <button class="close" type="button" aria-label="Cerrar" @click="close">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div class="modal-media">
          <img v-if="product.image" :src="product.image" :alt="product.name" />
          <div v-else class="modal-placeholder">{{ product.category?.charAt(0) ?? 'L' }}</div>
        </div>

        <div class="modal-body">
          <p class="modal-category">{{ product.category }}</p>
          <h3 class="modal-name">{{ product.name }}</h3>
          <p class="modal-desc">{{ product.description }}</p>

          <ul class="modal-specs">
            <li v-if="product.color"><span>Color</span><strong>{{ product.color }}</strong></li>
            <li v-if="product.sizes"><span>Tallas</span><strong>{{ formatSizes(product.sizes) }}</strong></li>
            <li><span>Precio</span><strong>{{ formatPrice(product.price) }}</strong></li>
          </ul>

          <p class="modal-note">Disponible en LØN.</p>

          <a
            :href="whatsappLink(product)"
            target="_blank"
            rel="noopener noreferrer"
            class="wa-btn"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15h-.01c-1.52 0-3.01-.41-4.31-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
            </svg>
            Pedir por WhatsApp
          </a>
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

.modal {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: min(860px, 100%);
  max-height: 90vh;
  overflow: hidden;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.35);
  color: #fff;
  cursor: pointer;
  transition: background-color var(--transition);
}

.close:hover {
  background-color: rgba(0, 0, 0, 0.6);
}

.modal-media {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  background-color: var(--bg-soft);
  overflow: hidden;
}

.modal-media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.modal-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 4rem;
  font-weight: 700;
  color: var(--text-muted);
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

.wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border-radius: var(--radius);
  background-color: #25d366;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color var(--transition), transform var(--transition);
}

.wa-btn:hover {
  background-color: #1ebe5d;
  transform: translateY(-2px);
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

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.25s ease;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(16px) scale(0.98);
}

@media (max-width: 680px) {
  .modal {
    grid-template-columns: 1fr;
    max-height: 92vh;
    overflow-y: auto;
  }
  .modal-media {
    aspect-ratio: 1 / 1;
  }
  .modal-body {
    padding: 24px;
  }
}
</style>
