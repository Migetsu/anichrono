import { shikiGQL } from '~/lib/api/shikiClient'
import type { ShikimoriAnimeListItem, AnimesQueryResponse } from '~/types/shikimori'

const QUERY = `
  query ($limit: Int) {
    animes(order: popularity, limit: $limit) {
      id
      name
      russian
      kind
      score
      poster { originalUrl }
      genres { id name russian }
      airedOn { year }
    }
  }
`

export async function searchPopular(limit: number): Promise<ShikimoriAnimeListItem[]> {
  const data = await shikiGQL<AnimesQueryResponse>(QUERY, { limit })
  return data?.animes ?? []
}