import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.tmdbApiKey
  const baseUrl = config.public.tmdbApiUrl
  const query = getQuery(event)

  const type = query.type || 'movie' // 'movie' or 'tv'
  const page = query.page || 1
  const genreId = query.genre_id
  const year = query.year
  const sortBy = query.sort_by || 'popularity.desc'

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TMDB API key is not configured'
    })
  }

  const params: any = {
    api_key: apiKey,
    language: 'ru-RU',
    page,
    sort_by: sortBy,
    include_adult: false
  }

  if (genreId) params.with_genres = genreId
  if (year) {
    if (type === 'movie') params.primary_release_year = year
    else params.first_air_date_year = year
  }

  try {
    const response: any = await $fetch(`${baseUrl}/discover/${type}`, { params })
    
    // Filter out items without a Russian translation (no Cyrillic characters in title)
    if (response.results) {
      response.results = response.results.filter((item: any) => {
        const title = item.title || item.name
        return /[а-яА-ЯёЁ]/.test(title || '')
      })
    }
    
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch from TMDB'
    })
  }
})
