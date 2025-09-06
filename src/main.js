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

const app = createApp(App)
const pinia = createPinia()
const auth = useAuthStore(pinia)
auth.loadToken()

library.add(fas, far, fab)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(pinia)
app.use(routers)
app.use(VueLazyLoad, {
  loading: '@/assets/images/default.jpg', // картинка-заглушка
  error: '@/assets/images/default.jpg'          // если картинка не загрузилась
})
app.mount('#app')
