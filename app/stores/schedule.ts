import { defineStore } from 'pinia'
import { format, isToday, isTomorrow } from 'date-fns'
import { ru } from 'date-fns/locale'
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


      } catch (e: any) {
        console.error('Failed to load schedule store:', e)
        this.error = e.statusMessage || 'Не удалось загрузить расписание'
      } finally {
        this.loading = false
      }
    }
  }
})