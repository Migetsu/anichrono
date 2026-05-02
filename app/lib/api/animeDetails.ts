import { shikiGQL } from '~/lib/api/shikiClient'
import { 
  ANIME_DETAILS_FULL_QUERY, 
  ANIME_RELATED_QUERY, 
  ANIME_CHARACTERS_QUERY 
} from './queries'
import type { 
  ShikimoriAnimeFull, 
  ShikimoriRelatedAnime, 
  ShikimoriCharacter 
} from '~/types/shikimori'

/**
 * Fetch full anime details by ID
 */
export async function fetchAnimeDetails(id: string): Promise<ShikimoriAnimeFull | null> {
  try {
    const data = await shikiGQL<{ animes: ShikimoriAnimeFull[] }>(ANIME_DETAILS_FULL_QUERY, { id })
    return data?.animes?.[0] || null
  } catch (error) {
    console.error(`Failed to fetch anime details for ID ${id}:`, error)
    return null
  }
}

/**
 * Fetch related animes by ID
 */
export async function fetchRelatedAnimes(id: string): Promise<any[]> {
  try {
    const data = await shikiGQL<{ animes: { related: any[] }[] }>(ANIME_RELATED_QUERY, { id })
    return data?.animes?.[0]?.related || []
  } catch (error) {
    console.error(`Failed to fetch related animes for ID ${id}:`, error)
    return []
  }
}

/**
 * Fetch anime characters by ID
 */
export async function fetchAnimeCharacters(id: string): Promise<any[]> {
  try {
    const data = await shikiGQL<{ animes: { characterRoles: any[] }[] }>(ANIME_CHARACTERS_QUERY, { id })
    return data?.animes?.[0]?.characterRoles?.map((r: any) => r.character) || []
  } catch (error) {
    console.error(`Failed to fetch characters for ID ${id}:`, error)
    return []
  }
}

/**
 * Fetch a random anime
 */
export async function fetchRandomAnime(): Promise<any | null> {
  try {
    const response = await $fetch<any[]>('https://shikimori.io/api/animes', {
      params: {
        order: 'random',
        limit: 1,
        score: 7,
        kind: 'tv,movie',
        status: 'released'
      }
    })
    return response?.[0] || null
  } catch (error) {
    console.error('Failed to fetch random anime:', error)
    return null
  }
}
