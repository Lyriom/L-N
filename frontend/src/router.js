import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import AdminView from './views/AdminView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/admin', name: 'admin', component: AdminView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
