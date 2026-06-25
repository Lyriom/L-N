<script setup>
import { formatSizes, instagramLink, whatsappLink } from '../config.js'

defineProps({
  product: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

function formatPrice(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
</script>

<template>
  <article
    class="card"
    role="button"
    tabindex="0"
    @click="$emit('select', product)"
    @keydown.enter="$emit('select', product)"
    @keydown.space.prevent="$emit('select', product)"
  >
    <div class="card-media">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        class="card-img"
        loading="lazy"
      />
      <div v-else class="card-placeholder">
        <img src="/logo-mark.png" alt="" class="card-placeholder-logo" />
        <span class="card-placeholder-soon">Foto próximamente</span>
      </div>

      <span v-if="product.tag" class="card-tag">{{ product.tag }}</span>
    </div>

    <div class="card-body">
      <p class="card-category">{{ product.category }}</p>
      <h3 class="card-name">{{ product.name }}</h3>
      <p v-if="product.color || product.sizes" class="card-meta">
        <span v-if="product.color">{{ product.color }}</span>
        <span v-if="product.sizes" class="card-sizes">Talla {{ formatSizes(product.sizes) }}</span>
      </p>
      <div class="card-footer">
        <span class="card-price">
          {{ product.priceMax > product.price ? 'Desde ' : '' }}{{ formatPrice(product.price) }}
        </span>
        <div class="card-actions">
          <a
            :href="whatsappLink(product)"
            target="_blank"
            rel="noopener noreferrer"
            class="card-btn card-btn--wa"
            aria-label="Pedir por WhatsApp"
            @click.stop
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.15h-.01c-1.52 0-3.01-.41-4.31-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
            </svg>
          </a>
          <a
            :href="instagramLink(product)"
            target="_blank"
            rel="noopener noreferrer"
            class="card-btn card-btn--ig"
            aria-label="Pedir por Instagram"
            @click.stop
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <path d="M17.5 6.5h.01" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition), border-color var(--transition),
    box-shadow var(--transition);
}

.card:hover,
.card:focus-visible {
  transform: translateY(-6px);
  border-color: var(--accent);
  box-shadow: var(--shadow);
  outline: none;
}

.card-media {
  position: relative;
  aspect-ratio: 1 / 1;
  background-color: var(--bg-soft);
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 16%, var(--bg-soft)),
    var(--bg-soft)
  );
}

.card-placeholder-logo {
  width: 46%;
  max-width: 120px;
  opacity: 0.6;
}

[data-theme="dark"] .card-placeholder-logo {
  filter: brightness(0) invert(1);
  opacity: 0.5;
}

.card-placeholder-soon {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.card-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: var(--accent);
  color: var(--accent-contrast);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 5px 12px;
  border-radius: 999px;
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 18px 18px 20px;
}

.card-category {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin: 0 0 6px;
}

.card-name {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0 0 14px;
}

.card-sizes {
  color: var(--text-muted);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: auto;
}

.card-price {
  font-weight: 700;
  font-size: 1.05rem;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background-color: var(--bg);
  color: var(--text);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition),
    transform var(--transition);
}

.card-btn--wa:hover {
  background-color: #25d366;
  color: #fff;
  border-color: #25d366;
  transform: scale(1.08);
}

.card-btn--ig:hover {
  background-color: #e1306c;
  color: #fff;
  border-color: #e1306c;
  transform: scale(1.08);
}
</style>
