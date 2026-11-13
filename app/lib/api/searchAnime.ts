import { shikiGQL } from '~/lib/api/shikiClient'
import type { ShikimoriAnimeListItem, AnimesQueryResponse } from '~/types/shikimori'
import { isKidsAnime } from '#shared/kids'

const QUERY = `
  query ($search: String!, $limit: Int) {
    animes(search: $search, limit: $limit) {
      id
      name
      russian
      score
      kind
      rating
      duration
      poster { originalUrl }
      genres { id name russian }
      airedOn { year }
    }
  }
`

export async function searchAnime(search: string, limit = 50): Promise<ShikimoriAnimeListItem[]> {
  if (!search || search.trim().length === 0) return []

  const data = await shikiGQL<AnimesQueryResponse>(QUERY, { search: search.trim(), limit })
  return (data?.animes ?? []).filter(item => !isKidsAnime(item))
}
