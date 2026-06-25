<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductCard from './ProductCard.vue'
import ProductModal from './ProductModal.vue'
import { api, photoUrl } from '../api.js'

/*
 * Catálogo público de LØN.
 * Los productos vienen del backend (/api/products): solo activos y con stock.
 * Cada fila: { id, code, category, name, type, size, qty, price, images[] }.
 * Aquí agrupamos las filas de la misma prenda (mismo nombre) en una sola
 * tarjeta con sus distintas tallas como variantes.
 */
const products = ref([])
const loading = ref(true)
const error = ref('')

// Huella "difusa" del nombre para agrupar aunque haya typos:
// quita acentos, espacios y signos, y colapsa letras repetidas
// (HODDIE/HOODIE -> hodie, ADDIDAS/ADIDAS -> adidas).
function fingerprint(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/(.)\1+/g, '$1')
}

// Agrupa filas de la misma prenda -> una tarjeta con variantes (tallas).
function groupProducts(list) {
  const groups = new Map()
  for (const p of list) {
    const key = `${fingerprint(p.name)}|${p.category || ''}`
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: p.name,
        category: p.category,
        type: p.type,
        variants: [],
        _images: [],
        _sizes: [],
      })
    }
    const g = groups.get(key)
    g.variants.push({ id: p.id, code: p.code, size: p.size, qty: p.qty, price: Number(p.price) })
    for (const img of p.images || []) if (!g._images.includes(img)) g._images.push(img)
    if (p.size && !g._sizes.includes(p.size)) g._sizes.push(p.size)
  }
  return [...groups.values()].map((g) => {
    const prices = g.variants.map((v) => v.price)
    const gallery = g._images.map(photoUrl)
    return {
      key: g.key,
      name: g.name,
      category: g.category,
      type: g.type,
      variants: g.variants,
      sizes: g._sizes,
      gallery,
      image: gallery[0] || null,
      price: Math.min(...prices),
      priceMax: Math.max(...prices),
    }
  })
}

onMounted(async () => {
  try {
    const data = await api.products()
    products.value = groupProducts(data)
  } catch (e) {
    error.value = 'No se pudo cargar el catálogo. Intenta más tarde.'
  } finally {
    loading.value = false
  }
})

// Filtros por categoría, derivados de los propios productos.
const categories = computed(() => [
  'Todos',
  ...Array.from(new Set(products.value.map((p) => p.category).filter(Boolean))),
])

const activeCategory = ref('Todos')

const filteredProducts = computed(() =>
  activeCategory.value === 'Todos'
    ? products.value
    : products.value.filter((p) => p.category === activeCategory.value)
)

// Producto seleccionado para el modal de detalle (null = cerrado).
const selected = ref(null)
</script>

<template>
  <section id="catalogo" class="section catalog">
    <div class="container">
      <header class="catalog-head">
        <div>
          <span class="eyebrow">Catálogo</span>
          <h2 class="catalog-title">Nuestra colección</h2>
        </div>
        <p class="catalog-sub">
          Ropa de marca con las mejores calidades. Toca cualquier prenda para ver
          los detalles y pedirla por WhatsApp.
        </p>
      </header>

      <div v-if="categories.length > 1" class="filters" role="tablist" aria-label="Filtrar por categoría">
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

      <p v-if="loading" class="catalog-state">Cargando productos…</p>
      <p v-else-if="error" class="catalog-state">{{ error }}</p>
      <p v-else-if="!filteredProducts.length" class="catalog-state">
        No hay productos disponibles por ahora.
      </p>

      <div v-else class="grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.key"
          :product="product"
          @select="selected = product"
        />
      </div>
    </div>

    <ProductModal :product="selected" @close="selected = null" />
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

.catalog-state {
  color: var(--text-muted);
  padding: 40px 0;
  text-align: center;
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
