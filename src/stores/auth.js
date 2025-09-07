// // /src/stores/auth.js
// import { defineStore } from 'pinia'

// export const useAuthStore = defineStore('auth', {
//   state: () => ({
//     token: null,
//     user: null,
//     loadingUser: false,
//     error: null
//   }),
//   getters: {
//     isLoggedIn: (s) => !!s.token
//   },
//   actions: {
//     setToken(token) {
//       this.token = token
//       try { localStorage.setItem('shikiToken', token) } catch(e) {}
//     },
//     clearToken() {
//       this.token = null
//       this.user = null
//       try { localStorage.removeItem('shikiToken') } catch(e) {}
//     },
//     loadToken() {
//       try {
//         const t = localStorage.getItem('shikiToken')
//         if (t) {
//           this.token = t
//           this.fetchUser()
//         }
//       } catch (e) {}
//     },
//     async fetchUser() {
//       if (!this.token) return
//       this.loadingUser = true
//       this.error = null
//       try {
//         // Универсально (и в dev и в prod): ходим через наш прокси
//         const res = await fetch('/api/whoami', {
//           headers: { Authorization: `Bearer ${this.token}` }
//         })
//         if (res.status === 401 || res.status === 403) {
//           // только при 401/403 выходим из аккаунта
//           this.clearToken()
//           return
//         }
//         if (!res.ok) throw new Error('Failed to fetch user')
//         this.user = await res.json()
//       } catch (e) {
//         console.error('whoami failed:', e)
//         this.user = null
//         // токен не трогаем — сеть может «плавать»
//       } finally {
//         this.loadingUser = false
//       }
//     },
//     login() {
//       // можно и прямой <a href>, но так удобнее вызвать из кода
//       location.href = '/api/auth/login'
//     },
//     logout() {
//       location.href = '/api/auth/logout'
//     }
//   }
// })

// stores/auth.js
import { defineStore } from 'pinia';

function parseAccessTokenFromHash() {
  const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(h);
  return params.get('access_token');
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false,
    error: null,
  }),
  actions: {
    // <-- ЧТО ТЫ ВЫЗЫВАЕШЬ В main.js
    loadToken() {
      this.token = localStorage.getItem('shiki_access_token') || null;
    },

    // Парсим токен из hash, сохраняем и чистим URL
    loadTokenFromHash() {
      const tokenFromHash = parseAccessTokenFromHash();
      if (!tokenFromHash) return;

      localStorage.setItem('shiki_access_token', tokenFromHash);
      this.token = tokenFromHash;

      // очистка hash
      const cleanUrl = window.location.pathname + window.location.search; // history mode
      // если у тебя hash-роутер, используй: const cleanUrl = '/#/';
      history.replaceState(null, '', cleanUrl);
    },

    async fetchMe() {
      if (!this.token) return;
      this.loading = true;
      this.error = null;
      try {
        const r = await fetch('https://shikimori.one/api/users/whoami', {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        if (!r.ok) throw new Error(`whoami ${r.status}`);
        this.user = await r.json();
      } catch (e) {
        this.error = String(e);
        // токен невалиден — чистим
        localStorage.removeItem('shiki_access_token');
        this.token = null;
        this.user = null;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      localStorage.removeItem('shiki_access_token');
      this.token = null;
      this.user = null;
    }
  }
});
