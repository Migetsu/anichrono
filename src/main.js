import { createApp } from 'vue'
import '@/styles/globals.scss'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import VueLazyLoad from 'vue-lazyload'
import defaultImg from '@/assets/images/default.jpg'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// 1) создаём приложение и подключаем Pinia/роутер/плагины
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

library.add(fas, far, fab)
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(VueLazyLoad, {
  loading: defaultImg,
  error: defaultImg
})

app.mount('#app')
