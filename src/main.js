import { createApp } from 'vue'
import '@/styles/main.scss'
import App from './App.vue'
import { createPinia } from 'pinia'
import { routers } from '@/routers/routers'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import VueLazyLoad from 'vue-lazyload'
import { useAuthStore } from '@/stores/auth'
import defaultImg from '@/assets/images/default.jpg'

// 1) создаём приложение и подключаем Pinia/роутер/плагины
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(routers)

library.add(fas, far, fab)
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(VueLazyLoad, {
  loading: defaultImg,
  error: defaultImg
})

// 2) получаем стор уже ПОСЛЕ app.use(pinia)
const auth = useAuthStore()

// 3) восстановить токен из localStorage и показать оверлей, если логин в процессе
auth.loadToken()
try { if (localStorage.getItem('oauth_in_progress')) auth.loggingIn = true } catch {}

// 4) подтянуть профиль (если токен есть)
auth.fetchMe()

app.mount('#app')
