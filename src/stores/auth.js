// /src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loadingUser: false,
    error: null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token
  },
  actions: {
    setToken(token) {
      this.token = token
      try { localStorage.setItem('shikiToken', token) } catch(e) {}
    },
    clearToken() {
      this.token = null
      this.user = null
      try { localStorage.removeItem('shikiToken') } catch(e) {}
    },
    loadToken() {
      try {
        const t = localStorage.getItem('shikiToken')
        if (t) {
          this.token = t
          this.fetchUser()
        }
      } catch (e) {}
    },
    async fetchUser() {
      if (!this.token) return
      this.loadingUser = true
      this.error = null
      try {
        // Универсально (и в dev и в prod): ходим через наш прокси
        const res = await fetch('/api/whoami', {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (res.status === 401 || res.status === 403) {
          // только при 401/403 выходим из аккаунта
          this.clearToken()
          return
        }
        if (!res.ok) throw new Error('Failed to fetch user')
        this.user = await res.json()
      } catch (e) {
        console.error('whoami failed:', e)
        this.user = null
        // токен не трогаем — сеть может «плавать»
      } finally {
        this.loadingUser = false
      }
    },
    login() {
      // можно и прямой <a href>, но так удобнее вызвать из кода
      location.href = '/api/auth/login'
    },
    logout() {
      location.href = '/api/auth/logout'
    }
  }
})
