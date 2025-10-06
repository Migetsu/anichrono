
import { defineStore } from 'pinia'
import { useListsStore } from './lists'
const TOKEN_KEY = 'shiki_access_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false,
    loggingIn: false,
    error: null
  }),
  getters: {
    isLoggedIn: s => !!s.token && !!s.user
  },
  actions: {
    setToken(t) {
      this.token = t
      try { sessionStorage.setItem(TOKEN_KEY, t) } catch {}
    },
    
    getCookieToken() {
      
      if (typeof document === 'undefined') return null
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'shiki_token_client') {
          return value
        }
      }
      return null
    },
    
    loadToken() {
      
      try { 
        this.token = sessionStorage.getItem(TOKEN_KEY) || null 
      } catch {}
      
      
      if (!this.token) {
        const cookieToken = this.getCookieToken()
        if (cookieToken) {
          this.token = cookieToken
          try { sessionStorage.setItem(TOKEN_KEY, cookieToken) } catch {}
        }
      }
      
      
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auth') === 'success') {
          
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('auth');
          window.history.replaceState({}, '', newUrl);
          const token = this.getCookieToken()
          if (token) {
            this.setToken(token)
            this.fetchMe();
          }
        }
      }
      
      if (this.token && !this.user) {
        this.fetchMe()
      }
      
      return this.token
    },
    clearToken() {
      this.token = null
      this.user = null
      try { sessionStorage.removeItem(TOKEN_KEY) } catch {}
      try { localStorage.removeItem(TOKEN_KEY) } catch {} // очистка старых данных
      if (typeof document !== 'undefined') {
        document.cookie = 'shiki_token_client=; Path=/; Max-Age=0'
        document.cookie = 'shiki_token=; Path=/; Max-Age=0'
      }
      try { useListsStore().$reset() } catch {}
    },

    async fetchMe() {
      if (!this.token) return
      this.loading = true
      this.error = null
      try {
        const r = await fetch('/api/whoami', {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        if (!r.ok) throw new Error(`whoami ${r.status}`)
        this.user = await r.json()
        try { useListsStore().fetchRates() } catch {}
      } catch (e) {
        this.error = String(e?.message || e)
        this.clearToken()
      } finally {
        this.loading = false
        this.loggingIn = false
        try { sessionStorage.removeItem('oauth_in_progress') } catch {}
      }
    },

    login() {
      this.loggingIn = true
      try { sessionStorage.setItem('oauth_in_progress', '1') } catch {}
      location.href = '/api/auth/login'
    },

    logout() {
      this.clearToken()
      location.href = '/api/auth/logout'
    }
  }
})