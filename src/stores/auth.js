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

// /src/stores/auth.js
import { defineStore } from 'pinia'
const TOKEN_KEY = 'shiki_access_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: null, user: null, loading: false, error: null }),
  getters: { isLoggedIn: s => !!s.token && !!s.user },
  actions: {
    setToken(t) { this.token = t; try { localStorage.setItem(TOKEN_KEY, t) } catch {} },
    loadToken() { try { this.token = localStorage.getItem(TOKEN_KEY) || null } catch {}; return this.token },
    clearToken() { this.token = null; this.user = null; try { localStorage.removeItem(TOKEN_KEY) } catch {} },
    async fetchMe() {
      if (!this.token) return
      this.loading = true; this.error = null
      try {
        const r = await fetch('/api/whoami', { headers: { Authorization: `Bearer ${this.token}` }})
        if (!r.ok) throw new Error(`whoami ${r.status}`)
        this.user = await r.json()
      } catch (e) {
        this.error = String(e?.message || e); this.clearToken()
      } finally { this.loading = false }
    },
    login() { location.href = '/api/auth/login' },
    logout() { this.clearToken(); location.href = '/api/auth/logout' },
  }
})
