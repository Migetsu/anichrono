export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // 1. Fetch basic calendar data from REST API
    const calendarData = await $fetch<any[]>('https://shikimori.io/api/calendar', {
      headers: {
        'User-Agent': 'AniChrono/1.0',
      }
    })

    // 2. Extract unique anime IDs
    const animeIds = [...new Set(calendarData.map(entry => entry.anime.id))]

    if (animeIds.length === 0) return []

    // 3. Chunk IDs and fetch high-quality posters via GraphQL
    const chunkSize = 50
    const chunks = []

    for (let i = 0; i < animeIds.length; i += chunkSize) {
      chunks.push(animeIds.slice(i, i + chunkSize))
    }

    const postersMap = new Map()

    // Execute requests in parallel
    await Promise.all(chunks.map(async (chunkIds) => {
      const query = `
        query {
          animes(ids: "${chunkIds.join(',')}", limit: ${chunkSize}) {
            id
            poster {
              mainUrl
              originalUrl
            }
          }
        }
      `

      try {
        const response = await $fetch<any>('https://shikimori.io/api/graphql', {
          method: 'POST',
          headers: {
            'User-Agent': 'AniChrono/1.0',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ query })
        })

        if (response.data && response.data.animes) {
          response.data.animes.forEach((anime: any) => {
            postersMap.set(Number(anime.id), anime.poster)
          })
        }
      } catch (err) {
        console.error('Error fetching poster chunk:', err)
        // Continue even if one chunk fails
      }
    }))

    // 4. Merge data
    return calendarData.map(entry => ({
      ...entry,
      anime: {
        ...entry.anime,
        poster: postersMap.get(entry.anime.id) || {
          // Fallback to REST image if GraphQL fails or missing
          mainUrl: 'https://shikimori.io' + entry.anime.image.preview,
          originalUrl: 'https://shikimori.io' + entry.anime.image.original
        }
      }
    }))

  } catch (e: any) {
    console.error('Calendar Fetch Error:', e)
    throw createError({
      statusCode: e.status || 500,
      statusMessage: 'Failed to fetch calendar from Shikimori'
    })
  }
}, {
  maxAge: 60 * 60, // 1 hour
  name: 'calendar',
  getKey: () => 'all'
});