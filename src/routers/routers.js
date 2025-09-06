import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home/Home.vue'
import Anime from '@/components/Animes/Animes.vue'
import Releases from '@/components/Releases/Releases.vue'
import Ongoings from '@/components/Ongoings/Ongoings.vue'
import Populars from '@/components/Popular/Populars.vue'
import Watch from '@/components/Watch/Watch.vue'

export const routers = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', name: 'home', component: Home},
        { path: '/animes/:id', name: 'animes', component: Anime, props: true },
        { path: '/watch/:id', name: 'watch', component: Watch, props: true },
        { path: '/releases', name: 'releases', component: Releases, props: true },
        { path: '/ongoings', name: 'ongoings', component: Ongoings, props: true },
        { path: '/populars', name: 'populars', component: Populars, props: true },
    ]
})