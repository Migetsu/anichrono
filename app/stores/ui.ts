import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    isMobileMenuOpen: false,
    isSearchModalOpen: false
  }),

  actions: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
      if (!this.isSearchModalOpen) {
        document.body.style.overflow = ''
      }
    },
    openMobileMenu() {
      this.isMobileMenuOpen = true
      document.body.style.overflow = 'hidden'
    },
    toggleSearchModal() {
      this.isSearchModalOpen = !this.isSearchModalOpen
      if (this.isSearchModalOpen) {
        this.isMobileMenuOpen = false
        document.body.style.overflow = 'hidden'
      } else {
        if (!this.isMobileMenuOpen) {
          document.body.style.overflow = ''
        }
      }
    },
    closeSearchModal() {
      this.isSearchModalOpen = false
      if (!this.isMobileMenuOpen) {
        document.body.style.overflow = ''
      }
    }
  }
})
