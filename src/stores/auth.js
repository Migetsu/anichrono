import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    loadToken() {
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('shikiToken');
      }
    },
  },
});
