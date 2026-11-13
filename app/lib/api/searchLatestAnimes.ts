import { shikiGQL } from '~/lib/api/shikiClient'
import type { ShikimoriAnimeListItem, AnimesQueryResponse, AnimeStatusString } from '@/types/shikimori'
import { isKidsAnime } from '#shared/kids'

const QUERY = `
  query ($limit: Int, $status: AnimeStatusString) {
    animes(status: $status, order: popularity, limit: $limit) {
      id
      name
      russian
      kind
      score
      rating
      duration
      poster { mainUrl previewUrl originalUrl }
      genres { id name russian }
      airedOn { year }
    }
  }
`

export async function searchLatest(limit: number, status: AnimeStatusString): Promise<ShikimoriAnimeListItem[]> {
  const data = await shikiGQL<AnimesQueryResponse>(QUERY, { limit: limit * 3 + 6, status })
  return (data?.animes ?? [])
    .filter(item => !isKidsAnime(item))
    .slice(0, limit)
}
