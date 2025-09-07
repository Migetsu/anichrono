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
