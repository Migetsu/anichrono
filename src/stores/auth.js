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
        const stored = localStorage.getItem('shikiToken');
        if (stored) {
          try {
            this.token = JSON.parse(stored);
          } catch {
            this.token = stored;
          }
          this.fetchUser();
        } else {
          this.token = null;
          this.user = null;
        }
      }
    },
    async fetchUser() {
      if (!this.token) return;
      try {
        const res = await fetch('/api/whoami', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem('shikiToken');
          this.token = null;
          this.user = null;
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch user');
        this.user = await res.json();
      } catch {
        this.user = null;
      }
    },
  },
});
