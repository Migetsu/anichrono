import { defineStore } from 'pinia'
import { dayKey, isTodayInDisplayZone, relativeDayLabel } from '#shared/datetime'
import type { CalendarEntry, ScheduleState } from '@/types/schedule'


const TTL = 1000 * 60 * 15 // 15 minutes cache



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
        const date = new Date(entry.next_episode_at)
        if (Number.isNaN(date.getTime())) return

        const key = dayKey(date)
        if (!groups[key]) groups[key] = []
        groups[key]!.push(entry)
      })

      // Sort dates
      const sortedDates = Object.keys(groups).sort()

      return sortedDates.map(key => {
        const entries = groups[key] ?? []
        const first = entries[0]
        const date = first ? new Date(first.next_episode_at) : new Date(`${key}T00:00:00+03:00`)

        return {
          date: key,
          label: relativeDayLabel(date),
          isToday: isTodayInDisplayZone(date),
          entries: entries.slice().sort((a, b) => {
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


      } catch (e: any) {
        console.error('Failed to load schedule store:', e)
        this.error = e.statusMessage || 'Не удалось загрузить расписание'
      } finally {
        this.loading = false
      }
    }
  }
})
