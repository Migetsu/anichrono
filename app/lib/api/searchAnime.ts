import { shikiGQL } from '~/lib/api/shikiClient'
import type { ShikimoriAnimeListItem, AnimesQueryResponse } from '~/types/shikimori'

const QUERY = `
  query ($search: String!, $limit: Int) {
    animes(search: $search, limit: $limit) {
      id
      name
      russian
      score
      poster { originalUrl }
      genres { id name russian }
      airedOn { year }
    }
  }
`

export async function searchAnime(search: string, limit = 50): Promise<ShikimoriAnimeListItem[]> {
  if (!search || search.trim().length === 0) return []
  
  // Request results from API
  // We use a higher default limit to get more results
  const data = await shikiGQL<AnimesQueryResponse>(QUERY, { search: search.trim(), limit })
  return data?.animes ?? []
}