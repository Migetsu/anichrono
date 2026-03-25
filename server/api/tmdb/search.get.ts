import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.tmdbApiKey
  const baseUrl = config.public.tmdbApiUrl
  const query = getQuery(event)

  const searchTerm = query.query
  const type = query.type || 'movie' // 'movie' or 'tv'
  const page = query.page || 1

  if (!searchTerm) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing search query'
    })
  }

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TMDB API key is not configured'
    })
  }

  try {
    const response: any = await $fetch(`${baseUrl}/search/${type}`, {
      params: {
        api_key: apiKey,
        language: 'ru-RU',
        query: searchTerm,
        page,
        include_adult: false
      }
    })

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
      statusMessage: error.statusMessage || 'Failed to search in TMDB'
    })
  }
})
