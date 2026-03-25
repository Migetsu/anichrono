import { shikiGQL } from '~/lib/api/shikiClient'
import type { ShikimoriAnimeListItem, AnimesQueryResponse, AnimeStatusString } from '@/types/shikimori'

const QUERY = `
  query ($limit: Int, $status: AnimeStatusString) {
    animes(status: $status, order: popularity, limit: $limit) {
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

export async function searchLatest(limit: number, status: AnimeStatusString): Promise<ShikimoriAnimeListItem[]> {
  const data = await shikiGQL<AnimesQueryResponse>(QUERY, { limit, status })
  return data?.animes ?? []
}
