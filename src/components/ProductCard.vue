<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})

function formatPrice(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
</script>

<template>
  <article class="card">
    <div class="card-media">
      <!-- Cuando se conecte el backend, aquí irá <img :src="product.image" />.
           Por ahora mostramos un marcador con la inicial de la categoría. -->
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        class="card-img"
        loading="lazy"
      />
      <div v-else class="card-placeholder">
        <span>{{ product.category?.charAt(0) ?? 'L' }}</span>
      </div>

      <span v-if="product.tag" class="card-tag">{{ product.tag }}</span>
    </div>

    <div class="card-body">
      <p class="card-category">{{ product.category }}</p>
      <h3 class="card-name">{{ product.name }}</h3>
      <div class="card-footer">
        <span class="card-price">{{ formatPrice(product.price) }}</span>
        <button class="card-btn" type="button" aria-label="Añadir al carrito">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
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
  transition: transform var(--transition), border-color var(--transition),
    box-shadow var(--transition);
}

.card:hover {
  transform: translateY(-6px);
  border-color: var(--accent);
  box-shadow: var(--shadow);
}

.card-media {
  position: relative;
  aspect-ratio: 4 / 5;
  background-color: var(--bg-soft);
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 16%, var(--bg-soft)),
    var(--bg-soft)
  );
}

.card-placeholder span {
  font-size: 3rem;
  font-weight: 700;
  color: color-mix(in srgb, var(--accent) 55%, var(--text-muted));
  letter-spacing: 0.04em;
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
  margin-bottom: 14px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-price {
  font-weight: 700;
  font-size: 1.05rem;
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

.card-btn:hover {
  background-color: var(--accent);
  color: var(--accent-contrast);
  transform: scale(1.08);
}
</style>
