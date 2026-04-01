import { defineStore } from 'pinia'
import { format, isToday, isTomorrow } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { CalendarEntry, ScheduleState } from '@/types/schedule'
import { shikiGQL } from '@/lib/api/shikiClient'
import type { AnimesQueryResponse } from '@/types/shikimori'

const TTL = 1000 * 60 * 15 // 15 minutes cache

const SCHEDULE_ANIME_QUERY = `
  query ($ids: String, $limit: Int) {
    animes(ids: $ids, limit: $limit) {
      id score
      poster { mainUrl originalUrl }
      genres { id name russian }
    }
  }
`

export const useScheduleStore = defineStore('schedule', {
  state: (): ScheduleState => ({
    entries: [],
    fetchedAt: 0,
    loading: false,
    error: null
  }),

  getters: {
    groupedSchedule: (state) => {
      if (!state.entries.length) return []

      const groups: Record<string, CalendarEntry[]> = {}
      
      state.entries.forEach(entry => {
        if (!entry.next_episode_at) return
        const dateObj = new Date(entry.next_episode_at)
        const dateKey = format(dateObj, 'yyyy-MM-dd')
        
        if (!groups[dateKey]) groups[dateKey] = []
        groups[dateKey].push(entry)
      })

      // Sort dates
      const sortedDates = Object.keys(groups).sort()

      return sortedDates.map(date => {
        const d = new Date(date)
        let label = format(d, 'EEEE, d MMMM', { locale: ru })
        
        if (isToday(d)) {
          label = `Сегодня, ${format(d, 'd MMMM', { locale: ru })}`
        } else if (isTomorrow(d)) {
          label = `Завтра, ${format(d, 'd MMMM', { locale: ru })}`
        }

        label = label.charAt(0).toUpperCase() + label.slice(1)

        return {
          date,
          label,
          isToday: isToday(d),
          entries: (groups[date] || []).sort((a, b) => {
              const timeA = a.next_episode_at ? new Date(a.next_episode_at).getTime() : 0
              const timeB = b.next_episode_at ? new Date(b.next_episode_at).getTime() : 0
              return timeA - timeB
          })
        }
      })
    }
  },

  actions: {
    async loadSchedule(force = false) {
      const now = Date.now()
      if (!force && this.entries.length && (now - this.fetchedAt) < TTL) {
        return
      }

      this.loading = true
      this.error = null

      try {
        const data = await $fetch<CalendarEntry[]>('/api/calendar')
        this.entries = data
        this.fetchedAt = Date.now()

        // Batch fetch high-res posters via GraphQL
        if (data.length > 0) {
           const uniqueIds = Array.from(new Set(data.map(e => e.anime?.id).filter(id => id)))
           const chunkSize = 50
           const animeMap = new Map()

           for (let i = 0; i < uniqueIds.length; i += chunkSize) {
              const chunk = uniqueIds.slice(i, i + chunkSize)
              try {
                const gqlData = await shikiGQL<AnimesQueryResponse>(SCHEDULE_ANIME_QUERY, {
                  ids: chunk.map(String).join(','),
                  limit: chunk.length
                })
                gqlData?.animes?.forEach(anime => animeMap.set(Number(anime.id), anime))
              } catch (err) {
                console.warn('GQL fetch for schedule posters failed', err)
              }
           }

           // Patch the store entries with high-res details
           this.entries = this.entries.map(entry => {
              if (entry.anime && animeMap.has(entry.anime.id)) {
                 const gqlAnime = animeMap.get(entry.anime.id)
                 return {
                    ...entry,
                    anime: {
                       ...entry.anime,
                       poster: gqlAnime.poster,
                       score: parseFloat(gqlAnime.score) || 0,
                       genres: gqlAnime.genres || entry.anime.genres
                    }
                 }
              }
              return entry
           })
        }
      } catch (e: any) {
        console.error('Failed to load schedule store:', e)
        this.error = e.statusMessage || 'Не удалось загрузить расписание'
      } finally {
        this.loading = false
      }
    }
  }
})