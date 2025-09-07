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

// main.js (или перед созданием Vue app)
function getTokenFromHash() {
  const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(h);
  return params.get('access_token');
}

const tokenFromHash = getTokenFromHash();
if (tokenFromHash) {
  // 1) Сохраняем токен (локально — чтобы не терялся на перезагрузке)
  localStorage.setItem('shiki_access_token', tokenFromHash);

  // 2) Чистим hash, чтобы не мешался роутингу/SEO/рефрешам
  const cleanUrl = window.location.pathname + window.location.search; // history mode
  // Если у тебя hash-режим: const cleanUrl = '/#/';
  history.replaceState(null, '', cleanUrl);
}

// Далее инициализируй приложение,
// а внутри стора/эффекта подтяни токен и сделай whoami.

const app = createApp(App)
const pinia = createPinia()
const auth = useAuthStore()
// auth.loadTokenFromHash();
auth.loadToken()
auth.fetchMe();

library.add(fas, far, fab)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(pinia)
app.use(routers)
app.use(VueLazyLoad, {
  loading: defaultImg, // картинка-заглушка
  error: defaultImg // если картинка не загрузилась
})
app.mount('#app')
