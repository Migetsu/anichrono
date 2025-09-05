import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home/Home.vue'
import Anime from '@/components/Animes/Animes.vue'

export const routers = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', name: 'home', component: Home},
        { path: '/animes/:id', name: 'animes', component: Anime, props: true }
    ]
})