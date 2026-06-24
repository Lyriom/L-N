<script setup>
import { ref, computed } from 'vue'
import ProductCard from './ProductCard.vue'

/*
 * Catálogo — "caparazón" listo para conectar al backend.
 *
 * Cuando exista la API, sustituir `products` por una llamada real, p. ej.:
 *
 *   import { onMounted } from 'vue'
 *   const products = ref([])
 *   onMounted(async () => {
 *     const res = await fetch('/api/products')
 *     products.value = await res.json()
 *   })
 *
 * La estructura de cada producto (id, name, category, price, tag, image)
 * es la que esperará el front, así que el backend solo debe devolver ese shape.
 */
const products = ref([
  { id: 1, name: 'Camiseta Oversize Lima', category: 'Camisetas', price: 24.9, tag: null, image: null },
  { id: 2, name: 'Pantalón Cargo Mod', category: 'Pantalones', price: 49.9, tag: null, image: null },
  { id: 3, name: 'Hoodie Esencial', category: 'Abrigos', price: 59.9, tag: 'Top ventas', image: null },
  { id: 4, name: 'Vestido Lino Brisa', category: 'Vestidos', price: 64.0, tag: null, image: null },
  { id: 5, name: 'Chaqueta Denim Azur', category: 'Abrigos', price: 79.9, tag: null, image: null },
  { id: 6, name: 'Falda Plisada Nube', category: 'Faldas', price: 39.9, tag: null, image: null },
  { id: 7, name: 'Camisa Oxford Clara', category: 'Camisas', price: 44.9, tag: null, image: null },
  { id: 8, name: 'Top Punto Sereno', category: 'Camisetas', price: 29.9, tag: 'Top ventas', image: null },
])

// Filtros por categoría, derivados de los propios productos.
const categories = computed(() => [
  'Todos',
  ...Array.from(new Set(products.value.map((p) => p.category))),
])

const activeCategory = ref('Todos')

const filteredProducts = computed(() =>
  activeCategory.value === 'Todos'
    ? products.value
    : products.value.filter((p) => p.category === activeCategory.value)
)
</script>

<template>
  <section id="catalogo" class="section catalog">
    <div class="container">
      <header class="catalog-head">
        <div>
          <span class="eyebrow">Catálogo</span>
          <h2 class="catalog-title">Explora la colección</h2>
        </div>
        <p class="catalog-sub">
          Una selección de piezas a la moda. Pronto, todo conectado a la tienda.
        </p>
      </header>

      <div class="filters" role="tablist" aria-label="Filtrar por categoría">
        <button
          v-for="cat in categories"
          :key="cat"
          class="filter"
          :class="{ active: activeCategory === cat }"
          type="button"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div class="grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.catalog {
  background-color: var(--bg-soft);
}

.catalog-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.catalog-title {
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  font-weight: 700;
}

.catalog-sub {
  color: var(--text-muted);
  max-width: 360px;
  margin: 0;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 40px;
}

.filter {
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background-color: var(--bg-elevated);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition), border-color var(--transition),
    background-color var(--transition);
}

.filter:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.filter.active {
  background-color: var(--accent);
  color: var(--accent-contrast);
  border-color: var(--accent);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 440px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
