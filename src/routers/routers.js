import { createRouter, createWebHistory } from 'vue-router'

export const routers = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: () => import('@/components/Home/Home.vue') },
        { path: '/animes/:id', name: 'animes', component: () => import('@/components/Animes/Animes.vue'), props: true },
        { path: '/watch/:id', name: 'watch', component: () => import('@/components/Watch/Watch.vue'), props: true },
        { path: '/releases', name: 'releases', component: () => import('@/components/Releases/Releases.vue'), props: true },
        { path: '/ongoings', name: 'ongoings', component: () => import('@/components/Ongoings/Ongoings.vue'), props: true },
        { path: '/populars', name: 'populars', component: () => import('@/components/Popular/Populars.vue'), props: true },
        { path: '/profile', name: 'profile', component: () => import('@/components/Profile/Profile.vue') },
    ]
})
