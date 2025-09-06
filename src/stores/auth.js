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
        const res = await fetch('/api/whoami', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        this.user = await res.json();
      } catch (e) {
        console.error('whoami failed:', e);
        this.user = null;
      }
    },
  },
});
