// Shikimori GraphQL API response types

export type AnimeStatus = 'anons' | 'ongoing' | 'released'
export type AnimeStatusString = 'anons' | 'ongoing' | 'released'
export type AnimeKindString = 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'tv_special' | 'music' | 'pv' | 'cm'
export type AnimeOrder = 'id' | 'ranked' | 'kind' | 'popularity' | 'name' | 'aired_on' | 'episodes' | 'status' | 'random'

export interface ShikimoriDate {
  year: number | null
  month: number | null
  day: number | null
  date: string | null
}

export interface ShikimoriPoster {
  originalUrl: string
  mainUrl?: string
  main2xUrl?: string
  previewUrl?: string
  preview2xUrl?: string
}

export interface ShikimoriGenre {
  id: number
  name: string
  russian: string
  kind?: string
}

export interface ShikimoriStudio {
  id: number
  name: string
  imageUrl?: string
}

export interface ShikimoriVideo {
  id: number
  name: string | null
  url: string
  kind: string
  imageUrl: string
  playerUrl: string
}

export interface ShikimoriAnimeListItem {
  id: number
  name: string
  russian: string | null
  score: number
  kind?: string | null
  rating?: string | null
  status?: AnimeStatus | null
  poster: ShikimoriPoster
  genres: ShikimoriGenre[]
  airedOn: {
    year: number | null
  }
}

export interface ShikimoriCharacter {
  id: number
  name: string
  russian: string | null
  image: {
    original: string
  }
}

export interface ShikimoriAnimeFull {
  id: number
  name: string
  russian: string | null
  description: string | null
  descriptionHtml: string | null
  score: number | null
  kind: string | null
  rating: string | null
  status: AnimeStatus | null
  duration: number | null
  episodes: number | null
  episodesAired: number | null
  season: string | null
  nextEpisodeAt: string | null
  airedOn: ShikimoriDate | null
  releasedOn: ShikimoriDate | null
  poster: ShikimoriPoster
  genres: ShikimoriGenre[]
  studios?: ShikimoriStudio[]
  videos?: ShikimoriVideo[]
  characters?: ShikimoriCharacter[]
  related?: ShikimoriRelatedAnime[]
}

// Fixed existing type name for backward compatibility if needed, but we should use Full 
// or just keep Detail as alias
export type ShikimoriAnimeDetail = ShikimoriAnimeFull

// GraphQL query response types
export interface AnimesQueryResponse {
  animes: ShikimoriAnimeListItem[]
}

export interface AnimeByIdQueryResponse {
  animes: ShikimoriAnimeDetail[]
}

// History Types
export interface ShikimoriHistoryEvent {
  id: number
  kind: string // 'added', 'completed', 'watching', etc.
  date: string
  created_at: string
  updated_at: string
  target: {
    id: number
    name: string
    russian: string
    image?: {
      original: string
      preview: string
      x96: string
      x48: string
    }
    url: string
    kind: string
    score: string
    status: string
    episodes: number
    episodes_aired: number
    aired_on: string | null
    released_on: string | null
  } | null
  description: string | null
}

// User Rate Types (GraphQL)
export interface ShikimoriUserRate {
  id: number
  status: string
  score: number
  episodes: number
  chapters: number
  volumes: number
  text: string | null
  rewatches: number
  createdAt: string
  updatedAt: string
  anime: ShikimoriAnimeListItem
}

// Cache types
export interface CacheEntry<T> {
  data: T
  time: number
}

export interface ShikimoriRelatedAnime {
  anime: ShikimoriAnimeListItem
  relation: string
  relation_russian: string
}