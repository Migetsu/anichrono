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
        // DEV: можно оставить '/shiki/api/users/whoami'
        // PROD/универсально: ходим в свой прокси:
        const res = await fetch('/api/whoami', {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        this.user = await res.json();
      } catch (e) {
        // Не стирайте токен сразу, чтобы не «мигать» UI при временных сетевых ошибках.
        // Мягче: только обнулим user и выведем ошибку в консоль:
        console.error('whoami failed:', e);
        this.user = null;
        // Если хотите — поставьте ретрай/дебаунс, а logout делайте по кнопке.
      }
    },
  },
});
