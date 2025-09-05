import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home/Home.vue'
import Anime from '@/components/Animes/Animes.vue'
import Releases from '@/components/Releases/Releases.vue'
// import Populars from '@/components/Populars/Populars.vue'

export const routers = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', name: 'home', component: Home},
        { path: '/animes/:id', name: 'animes', component: Anime, props: true },
        { path: '/popular', name: 'popular', component: Releases, props: true },
    ]
})