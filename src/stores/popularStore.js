import { defineStore } from 'pinia'
import { searchPopular } from '@/api/searchPopular'

const TTL = 1000 * 60 * 10 // 10 минут

export const usePopularStore = defineStore('popular', {
  state: () => ({
    popular: [],
    popularFetchedAt: 0,
    loadingPopular: false,
    errorPopular: null
  }),
  actions: {
    async loadPopular(force = false, limit = 10) {
      const now = Date.now()
      if (!force && this.popular.length && (now - this.popularFetchedAt) < TTL) {
        return // кеш актуален
      }
      this.loadingPopular = true
      this.errorPopular = null
      try {
        const data = await searchPopular(limit)
        this.popular = data
        this.popularFetchedAt = Date.now()
      } catch (e) {
        this.errorPopular = e.message || 'Ошибка'
      } finally {
        this.loadingPopular = false
      }
    }
  }
})