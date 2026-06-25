<script setup>
import { ref, computed } from 'vue'
import ProductCard from './ProductCard.vue'
import ProductModal from './ProductModal.vue'

/*
 * Catálogo ESSENTIALS de LØN.
 * Cada producto: id, name, category, price, color, sizes, description, tag, image.
 * Las imágenes viven en /public/products (se sirven desde la raíz).
 */
const products = ref([
  {
    id: 1,
    name: 'ESSENTIALS Taupe Hoodie',
    category: 'Hoodies',
    price: 120,
    color: 'Taupe Brown',
    sizes: ['S', 'M'],
    description: 'Un color elegante y premium para elevar tu outfit.',
    tag: null,
    image: '/products/taupe-hoodie.jpg',
  },
  {
    id: 2,
    name: 'ESSENTIALS Limo Hoodie',
    category: 'Hoodies',
    price: 100,
    color: 'Limo',
    sizes: ['L', 'S'],
    description: 'Minimalista, moderno y con un look sólido para cualquier estilo.',
    tag: null,
    image: '/products/limo-hoodie.jpg',
  },
  {
    id: 3,
    name: 'ESSENTIALS Light Oatmeal Hoodie',
    category: 'Hoodies',
    price: 100,
    color: 'Light Oatmeal',
    sizes: ['L', 'S'],
    description: 'Un tono suave y elegante, ideal para outfits limpios.',
    tag: null,
    image: '/products/light-oatmeal-hoodie.jpg',
  },
  {
    id: 4,
    name: 'ESSENTIALS Coral Hoodie',
    category: 'Hoodies',
    price: 120,
    color: 'Coral',
    sizes: ['L'],
    description: 'Color único, fit premium y calidad brutal. Destaca donde vayas.',
    tag: 'Edición única',
    image: '/products/coral-hoodie.jpg',
  },
  {
    id: 5,
    name: 'ESSENTIALS Dark Oatmeal Shorts',
    category: 'Shorts',
    price: 70,
    color: 'Dark Oatmeal',
    sizes: ['S'],
    description: 'Perfectos para entrenar o usar diario. Suaves, cómodos y con estilo.',
    tag: null,
    image: '/products/dark-oatmeal-shorts.jpg',
  },
  {
    id: 6,
    name: 'ESSENTIALS Light Oatmeal Tee',
    category: 'Camisetas',
    price: 70,
    color: 'Light Oatmeal',
    sizes: ['S'],
    description: 'Un clásico en color crema, suave, limpio y combinable con todo.',
    tag: null,
    image: '/products/light-oatmeal-tee.jpg',
  },
  {
    id: 7,
    name: 'ESSENTIALS Dark Oatmeal Sweatpants',
    category: 'Pantalones',
    price: 80,
    color: 'Dark Oatmeal',
    sizes: ['M', 'L'],
    description: 'Comodidad premium para tu día a día. Fit relajado y full estilo.',
    tag: null,
    image: '/products/dark-oatmeal-sweatpants.jpg',
  },
  {
    id: 8,
    name: 'ESSENTIALS Limo Tee',
    category: 'Camisetas',
    price: 70,
    color: 'Limo',
    sizes: ['L'],
    description: 'Minimalista, clásica y perfecta para cualquier fit. Un básico que nunca falla.',
    tag: null,
    image: '/products/limo-tee.jpg',
  },
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

// Producto seleccionado para el modal de detalle (null = cerrado).
const selected = ref(null)
</script>

<template>
  <section id="catalogo" class="section catalog">
    <div class="container">
      <header class="catalog-head">
        <div>
          <span class="eyebrow">Catálogo</span>
          <h2 class="catalog-title">Colección ESSENTIALS</h2>
        </div>
        <p class="catalog-sub">
          Ropa de marca con las mejores calidades. Toca cualquier prenda para ver
          los detalles y pedirla por WhatsApp.
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
