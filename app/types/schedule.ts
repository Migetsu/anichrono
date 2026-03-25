import type { ShikimoriAnimeListItem, AnimeStatus, ShikimoriGenre } from './shikimori'

export interface CalendarAnime extends Omit<ShikimoriAnimeListItem, 'airedOn' | 'poster' | 'score'> {
  score: string | number
  status: AnimeStatus | null
  episodes: number
  episodes_aired: number
  url: string
  airedOn?: {
    year: number | null
  }
  genres: ShikimoriGenre[]
  image?: {
    original: string
    preview: string
    x96: string
    x48: string
  }
  poster?: {
    mainUrl: string
    originalUrl: string
  }
}

export interface CalendarEntry {
  next_episode: number
  next_episode_at: string
  duration: number
  anime: CalendarAnime
}

export interface DayGroup {
  date: string
  label: string
  isToday: boolean
  entries: CalendarEntry[]
}

export interface ScheduleState {
  entries: CalendarEntry[]
  fetchedAt: number
  loading: boolean
  error: string | null
}
