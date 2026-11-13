import { isKidsAnime } from '#shared/kids'

/**
 * Dynamic sitemap source consumed by @nuxtjs/sitemap.
 *
 * The site renders title pages from external APIs, so the static route list is
 * useless for crawlers. This endpoint collects the most popular and currently
 * airing anime plus a slice of TMDB films and series, caches the result for
 * half a day and returns plain sitemap entries.
 */

const SITE = (process.env.SITE_URL || 'https://anichrono.vercel.app').replace(/\/$/, '')

interface SitemapEntry {
  loc: string
  changefreq: string
  priority: number
  lastmod?: string
}

const ANIME_QUERY = `
  query ($limit: Int, $page: Int, $status: AnimeStatusString) {
    animes(limit: $limit, page: $page, order: popularity, status: $status) {
      id
      name
      russian
      rating
      duration
      kind
      genres { id name russian }
    }
  }
`

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, '_')
}

export default defineCachedEventHandler(async () => {
  const entries: SitemapEntry[] = []
  const seen = new Set<string>()

  const push = (loc: string, changefreq: string, priority: number) => {
    if (seen.has(loc)) return
    seen.add(loc)
    entries.push({ loc, changefreq, priority })
  }

  // Static pages are added by the sitemap module itself; this source only
  // contributes dynamic title URLs.

  const addAnime = async (page: number, status?: string, priority = 0.8) => {
    const response = await $fetch<{ data?: { animes?: any[] } }>('/api/shiki-graphql', {
      method: 'POST',
      body: { query: ANIME_QUERY, variables: { limit: 50, page, status } },
    }).catch(() => null)

    for (const item of response?.data?.animes ?? []) {
      if (!item?.id || !item?.name) continue
      if (isKidsAnime(item)) continue
      push(`${SITE}/animes/${item.id}-${slugify(item.name)}`, status === 'ongoing' ? 'daily' : 'weekly', priority)
    }
  }

  try {
    for (let page = 1; page <= 6; page++) {
      await addAnime(page, undefined, 0.7)
    }
    for (let page = 1; page <= 3; page++) {
      await addAnime(page, 'ongoing', 0.85)
    }
  } catch (error) {
    console.error('[sitemap] anime list failed', error)
  }

  try {
    for (const type of ['movie', 'tv'] as const) {
      for (let page = 1; page <= 4; page++) {
        const response = await $fetch<{ results?: Array<{ id: number }> }>('/api/tmdb/discover', {
          params: { type, page },
        }).catch(() => null)

        for (const item of response?.results ?? []) {
          if (!item?.id) continue
          push(`${SITE}/movies/${type}-${item.id}`, 'weekly', 0.6)
        }
      }
    }
  } catch (error) {
    console.error('[sitemap] tmdb list failed', error)
  }

  return entries
}, {
  maxAge: 60 * 60 * 12,
  name: 'sitemap-urls',
  getKey: () => 'v2',
})
