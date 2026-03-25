import { defineStore } from 'pinia'
import { searchLatest } from '@/lib/api/searchLatestAnimes'
import type { ShikimoriAnimeListItem, AnimeStatusString } from '@/types/shikimori'
import type { LatestState } from '@/types/anime'

const TTL = 1000 * 60 * 10 // 10 minutes

export const useLatestStore = defineStore('latest', {
  state: (): LatestState => ({
    latest: [],
    latestFetchedAt: 0,
    loadingLatest: false,
    errorLatest: null
  }),
  actions: {
    async loadLatest(force = false, limit = 10): Promise<void> {
      const now = Date.now()
      if (!force && this.latest.length && (now - this.latestFetchedAt) < TTL) {
        return 
      }
      this.loadingLatest = true
      this.errorLatest = null
      try {
        const data = await searchLatest(limit, 'ongoing' as AnimeStatusString)
        this.latest = data
        this.latestFetchedAt = Date.now()
      } catch (e: unknown) {
        const error = e as Error
        this.errorLatest = error.message || 'Ошибка'
      } finally {
        this.loadingLatest = false
      }
    }
  }
})
