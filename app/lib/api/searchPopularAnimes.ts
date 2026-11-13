import { shikiGQL } from '~/lib/api/shikiClient'
import type { ShikimoriAnimeListItem, AnimesQueryResponse } from '~/types/shikimori'
import { isKidsAnime } from '#shared/kids'

const QUERY = `
  query ($limit: Int) {
    animes(order: popularity, limit: $limit) {
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

export async function searchPopular(limit: number): Promise<ShikimoriAnimeListItem[]> {
  // Request a deeper slice, then drop kids' titles and cut back to the asked size.
  const data = await shikiGQL<AnimesQueryResponse>(QUERY, { limit: limit * 3 + 6 })
  return (data?.animes ?? [])
    .filter(item => !isKidsAnime(item))
    .slice(0, limit)
}
