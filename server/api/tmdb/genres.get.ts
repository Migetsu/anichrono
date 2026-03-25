import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.tmdbApiKey
  const baseUrl = config.public.tmdbApiUrl

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TMDB API key is not configured'
    })
  }

  try {
    const [movieGenres, tvGenres]: any = await Promise.all([
      $fetch(`${baseUrl}/genre/movie/list`, {
        params: { api_key: apiKey, language: 'ru-RU' }
      }),
      $fetch(`${baseUrl}/genre/tv/list`, {
        params: { api_key: apiKey, language: 'ru-RU' }
      })
    ])

    return {
      movie: movieGenres.genres,
      tv: tvGenres.genres
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch genres from TMDB'
    })
  }
})
