import type { TMDBMovie, TMDBTV, TMDBGenre, TMDBResponse } from '@/types/tmdb'

export async function fetchTMDBGenres() {
  return await $fetch<{ movie: TMDBGenre[], tv: TMDBGenre[] }>('/api/tmdb/genres')
}

export async function fetchTMDBDiscover(params: {
  type?: 'movie' | 'tv';
  page?: number;
  genre_id?: number | string;
  year?: number | string;
  sort_by?: string;
}) {
  return await $fetch<TMDBResponse<any>>('/api/tmdb/discover', { params })
}

export async function fetchTMDBDetails(id: string | number, type: 'movie' | 'tv' = 'movie') {
  return await $fetch<any>('/api/tmdb/details', { params: { id, type } })
}

export async function searchTMDB(query: string, type: 'movie' | 'tv' = 'movie', page: number = 1) {
  return await $fetch<TMDBResponse<any>>('/api/tmdb/search', { params: { query, type, page } })
}

export function getTMDBImageUrl(path: string | null, size: 'w500' | 'original' = 'w500') {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/${size}${path}`
}
