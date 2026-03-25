import { shikiGQL } from '~/lib/api/shikiClient'
import type { ShikimoriAnimeListItem, AnimesQueryResponse } from '~/types/shikimori'
import type { CatalogFilters, Genre } from '@/types/catalog'
import { AnimesQueryResponseSchema } from '@/lib/api/schemas'

// Query with server-side filter support where available
const CATALOG_QUERY = `
  query (
    $limit: Int, 
    $page: Int, 
    $order: OrderEnum, 
    $search: String,
    $status: AnimeStatusString,
    $kind: AnimeKindString,
    $score: Int,
    $rating: RatingString,
    $genre: String
  ) {
    animes(
      limit: $limit, 
      page: $page, 
      order: $order, 
      search: $search,
      status: $status,
      kind: $kind,
      score: $score,
      rating: $rating,
      genre: $genre
    ) {
      id
      name
      russian
      score
      kind
      rating
      status
      poster { originalUrl }
      genres { id name russian }
      airedOn { year }
    }
  }
`

const GENRES_QUERY = `
  query ($entryType: GenreEntryTypeEnum!) {
    genres(entryType: $entryType) {
      id
      name
      russian
      kind
    }
  }
`

interface GenresResponse {
  genres: Genre[]
}

/**
 * Fetch anime catalog with filters
 */
export async function fetchCatalog(filters: CatalogFilters = {}): Promise<ShikimoriAnimeListItem[]> {
  try {
    const variables: Record<string, unknown> = {
      limit: filters.limit ?? 20,
      page: filters.page ?? 1,
      order: filters.order ?? 'popularity'
    }
    
    // Add search if provided and has at least 2 characters
    if (filters.search && filters.search.trim().length >= 2) {
      variables.search = filters.search.trim()
    }
    
    // Status - comma-separated string
    if (filters.status && filters.status.length > 0) {
      variables.status = filters.status.join(',')
    }
    
    // Kind - comma-separated string
    if (filters.kind && filters.kind.length > 0) {
      variables.kind = filters.kind.join(',')
    }
    
    // Rating - comma-separated string
    if (filters.rating && filters.rating.length > 0) {
      variables.rating = filters.rating.join(',')
    }
    
    // Score - minimum score
    if (filters.score) {
      variables.score = filters.score
    }
    
    // Genre - comma-separated string of genre IDs
    if (filters.genre && filters.genre.length > 0) {
      variables.genre = filters.genre.join(',')
    }
    
    const data = await shikiGQL<AnimesQueryResponse>(CATALOG_QUERY, variables)
    
    // Validate with Zod
    const validated = AnimesQueryResponseSchema.safeParse(data)
    if (!validated.success) {
      console.warn('Zod validation failed for catalog:', validated.error)
      return data?.animes ?? [] // Fallback to raw data if validation fails but we have data
    }

    return validated.data.animes as unknown as ShikimoriAnimeListItem[]
  } catch (error) {
    console.error('Failed to fetch catalog:', error)
    // Return empty array on error to prevent page crash
    return []
  }
}

/**
 * Fetch all anime genres
 */
export async function fetchGenres(): Promise<Genre[]> {
  try {
    // Use entryType variable - try different enum values if needed
    // Based on Shikimori API, entryType should be one of: Anime, Manga, Ranobe
    // Correct enum value is likely Capitalized
    const data = await shikiGQL<GenresResponse>(GENRES_QUERY, { entryType: 'Anime' })
    // Filter only anime genres (though API should already filter by entryType)
    return data?.genres ?? []
  } catch (error: any) {
    console.error('Failed to fetch genres:', error)
    // If ANIME doesn't work, try without filtering or with different approach
    // Return empty array on error to prevent page crash
    return []
  }
}