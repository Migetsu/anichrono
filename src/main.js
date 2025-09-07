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

// --- утилита для токена из hash ---
function getTokenFromHash() {
  const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const params = new URLSearchParams(h)
  return params.get('access_token')
}

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

// 3) если вернулись с OAuth — кладём токен и чистим URL
const tokenFromHash = getTokenFromHash()
if (tokenFromHash) {
  auth.setToken(tokenFromHash) // пишет и в стор, и в localStorage
  auth.loggingIn = true        // покажем «Входим…», пока тянется профиль
  const cleanUrl = window.location.pathname + window.location.search
  history.replaceState(null, '', cleanUrl)
} else {
  // иначе попытка восстановить токен из localStorage
  auth.loadToken()
}

// 4) подтянуть профиль (если токен есть)
auth.fetchMe()

// 5) монтируем приложение
app.mount('#app')
