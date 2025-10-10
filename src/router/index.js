import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage/HomePage.vue'

const routes = [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/catalog', name: 'Catalog', component: () => import('@/pages/CatalogPage/CatalogPage.vue'), props: true },
    { path: '/profile', name: 'profile', component: () => import('@/pages/Profile/Profile.vue') },
    { path: '/history', name: 'history', component: () => import('@/pages/HistoryPage/HistoryPage.vue') },
    { path: '/watch/:id', name: 'watch', component: () => import('@/pages/Watch/Watch.vue'), props: true }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Простая проверка наличия токена без импорта стора
function hasToken() {
    try {
        const t = sessionStorage.getItem('shiki_access_token')
        if (t) return true
    } catch {}
    if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=')
            if (name === 'shiki_token_client' && value) return true
        }
    }
    return false
}

router.beforeEach((to) => {
    if (to.path === '/profile' && !hasToken()) {
        try { sessionStorage.setItem('post_login_redirect', to.fullPath || '/profile') } catch {}
        window.location.href = '/api/auth/login'
        return false
    }
    if (to.path === '/profile' && hasToken()) {
        // Позволяем пройти, даже если user ещё не загружен, токен уже есть
        return true
    }
    return true
})

export default router
