import { ref, watch } from 'vue'

const STORAGE_KEY = 'lon-theme'

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  // Si no hay preferencia guardada, seguimos la del sistema.
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

// Estado compartido entre todos los componentes que usen el composable.
const theme = ref(getInitialTheme())

function applyTheme(value) {
  document.documentElement.setAttribute('data-theme', value)
}

// Aplicamos el tema inicial de inmediato.
applyTheme(theme.value)

watch(theme, (value) => {
  applyTheme(value)
  localStorage.setItem(STORAGE_KEY, value)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
}
