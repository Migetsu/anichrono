import { defineStore } from 'pinia'
import { searchPopular } from '@/lib/api/searchPopularAnimes'
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import type { PopularState } from '@/types/anime'

const TTL = 1000 * 60 * 10 // 10 minutes

export const usePopularStore = defineStore('popular', {
  state: (): PopularState => ({
    popular: [],
    popularFetchedAt: 0,
    loadingPopular: false,
    errorPopular: null
  }),
  actions: {
    async loadPopular(force = false, limit = 10): Promise<void> {
      const now = Date.now()
      if (!force && this.popular.length && (now - this.popularFetchedAt) < TTL) {
        return 
      }
      this.loadingPopular = true
      this.errorPopular = null
      try {
        const data = await searchPopular(limit)
        this.popular = data
        this.popularFetchedAt = Date.now()
      } catch (e: unknown) {
        const error = e as Error
        this.errorPopular = error.message || 'Ошибка'
      } finally {
        this.loadingPopular = false
      }
    }
  }
})