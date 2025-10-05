import { defineStore } from 'pinia'
import { searchLatest } from '@/api/searchLatest'

const TTL = 1000 * 60 * 10 

export const useLatestStore = defineStore('latest', {
  state: () => ({
    latest: [],
    latestFetchedAt: 0,
    loadingLatest: false,
    errorLatest: null
  }),
  actions: {
    async loadLatest(force = false, limit = 10) {
      const now = Date.now()
      if (!force && this.latest.length && (now - this.latestFetchedAt) < TTL) {
        return 
      }
      this.loadingLatest = true
      this.errorLatest = null
      try {
        const data = await searchLatest(limit, 'ongoing')
        this.latest = data
        this.latestFetchedAt = Date.now()
      } catch (e) {
        this.errorLatest = e.message || 'Ошибка'
      } finally {
        this.loadingLatest = false
      }
    }
  }
})