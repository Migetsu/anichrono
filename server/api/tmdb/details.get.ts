import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.tmdbApiKey
  const baseUrl = config.public.tmdbApiUrl
  const query = getQuery(event)

  const type = query.type || 'movie'
  const id = query.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing ID'
    })
  }

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'TMDB API key is not configured'
    })
  }

  try {
    const response: any = await $fetch(`${baseUrl}/${type}/${id}`, {
      params: { 
        api_key: apiKey, 
        language: 'ru-RU',
        append_to_response: 'credits,videos,recommendations,external_ids'
      }
    })
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch details from TMDB'
    })
  }
})
