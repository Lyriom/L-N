<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme'

const { theme, toggleTheme } = useTheme()

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const links = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Sobre nosotros', href: '#nosotros' },
]
</script>

<template>
  <header class="header" :class="{ 'is-scrolled': scrolled }">
    <div class="container header-inner">
      <a href="#inicio" class="brand" aria-label="LØN — Inicio">
        <img src="/logo.jpeg" alt="LØN" class="brand-logo" />
        <span class="brand-name">LØN</span>
      </a>

      <nav class="nav" :class="{ open: menuOpen }">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="nav-link"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="header-actions">
        <button
          class="icon-btn"
          type="button"
          :aria-label="theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
          @click="toggleTheme"
        >
          <!-- Sol (modo claro) -->
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <!-- Luna (modo oscuro) -->
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <button
          class="icon-btn menu-toggle"
          type="button"
          aria-label="Abrir menú"
          @click="menuOpen = !menuOpen"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path v-if="!menuOpen" d="M3 6h18M3 12h18M3 18h18" />
            <path v-else d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: saturate(160%) blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition), background-color var(--transition);
}

.header.is-scrolled {
  border-bottom-color: var(--border);
}

.header-inner {
  height: var(--header-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 38px;
  height: 38px;
  object-fit: contain;
  border-radius: 8px;
}

.brand-name {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.12em;
}

.nav {
  display: flex;
  gap: 30px;
  margin-left: auto;
}

.nav-link {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--transition);
}

.nav-link:hover {
  color: var(--accent);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background-color: var(--bg-elevated);
  color: var(--text);
  cursor: pointer;
  transition: color var(--transition), border-color var(--transition),
    transform var(--transition);
}

.icon-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.menu-toggle {
  display: none;
}

/* Responsive */
@media (max-width: 760px) {
  .nav {
    position: absolute;
    top: var(--header-h);
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background-color: var(--bg-elevated);
    border-bottom: 1px solid var(--border);
    padding: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height var(--transition);
  }

  .nav.open {
    max-height: 280px;
  }

  .nav-link {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
  }

  .menu-toggle {
    display: inline-flex;
  }
}
</style>
