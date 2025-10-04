import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'

const routes = [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/catalog', name: 'Catalog', component: () => import('@/pages/CatalogPage.vue'), props: true },
    { path: '/animes/:id', name: 'animes', component: () => import('@/pages/AnimeTitle.vue'), props: true },
    { path: '/watch/:id', name: 'watch', component: () => import('@/pages/Watch.vue'), props: true }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
