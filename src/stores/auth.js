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
        console.log('Auth store: loading token');
        this.token = localStorage.getItem('shikiToken');
        if (this.token) {
          console.log('Auth store: token found');
          this.fetchUser();
        } else {
          console.log('Auth store: token missing');
          this.user = null;
        }
      }
    },
    async fetchUser() {
      if (!this.token) return;
      console.log('Auth store: fetching user');
      try {
        const res = await fetch('/api/whoami', {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        console.log('Auth store: whoami status', res.status);
        if (!res.ok) throw new Error('Failed to fetch user');
        this.user = await res.json();
        console.log('Auth store: user loaded', this.user);
      } catch (e) {
        console.error('Auth store: whoami failed', e);
        this.user = null;
      }
    },
  },
});
