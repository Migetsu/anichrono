import type { ShikimoriAnimeListItem } from './shikimori'

export interface PopularState {
  popular: ShikimoriAnimeListItem[]
  popularFetchedAt: number
  loadingPopular: boolean
  errorPopular: string | null
}

export interface LatestState {
  latest: ShikimoriAnimeListItem[]
  latestFetchedAt: number
  loadingLatest: boolean
  errorLatest: string | null
}
