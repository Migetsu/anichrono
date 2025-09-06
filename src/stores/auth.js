import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    loadToken() {
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('shikiToken');
        if (this.token) {
          this.fetchUser();
        } else {
          this.user = null;
        }
      }
    },
    async fetchUser() {
      if (!this.token) return;
      try {
        // Основной путь: через наш серверный прокси (работает в прод и при vercel dev)
        let res = await fetch('/api/whoami', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        // Fallback для чистого Vite dev (без vercel dev): идем через Vite-прокси на Shikimori
        if (!res.ok) {
          // Если явная авторизационная ошибка — можно выйти из флоу без фоллбэка
          if (res.status === 401 || res.status === 403) {
            throw new Error('Unauthorized');
          }
          try {
            res = await fetch('/shiki/api/users/whoami', {
              headers: { Authorization: `Bearer ${this.token}` },
            });
          } catch (e) {
            // сетевые ошибки будут обработаны ниже
            throw e;
          }
        }
        if (!res.ok) throw new Error('Failed to fetch user');
        this.user = await res.json();
      } catch (e) {
        console.error('whoami failed:', e);
        this.user = null;
      }
    },
  },
});
