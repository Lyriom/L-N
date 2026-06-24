# LØN — Landing

Landing de **LØN**, una marca de ropa a la moda. Hecha con **Vue 3 + Vite**.

Es el "caparazón": header con logo y toggle de tema, hero de presentación,
sección de catálogo y footer. El catálogo usa datos de muestra y está listo
para conectarse al backend.

## Paleta

| Modo   | Fondo  | Acento  |
| ------ | ------ | ------- |
| Claro  | Blanco | Celeste |
| Oscuro | Negro  | Celeste |

El tema se controla con el atributo `data-theme` en `<html>` y se persiste en
`localStorage` (respeta la preferencia del sistema la primera vez).

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo
npm run build    # build de producción (carpeta dist/)
npm run preview  # previsualizar el build
```

## Estructura

```
public/
  logo.jpeg                  Logo de LØN
src/
  main.js
  style.css                  Variables de tema (claro/oscuro) y utilidades
  App.vue
  composables/
    useTheme.js              Lógica del modo claro/oscuro
  components/
    AppHeader.vue            Logo + navegación + toggle de tema
    HeroSection.vue          Presentación de la marca
    CatalogSection.vue       Catálogo + filtros (datos de muestra)
    ProductCard.vue          Tarjeta de producto
    AppFooter.vue            Pie de página
```

## Conectar el backend

En `src/components/CatalogSection.vue` reemplaza los datos de muestra por una
llamada a la API. El front espera productos con este shape:

```js
{ id, name, category, price, tag, image }
```

```js
import { ref, onMounted } from 'vue'

const products = ref([])
onMounted(async () => {
  const res = await fetch('/api/products')
  products.value = await res.json()
})
```
