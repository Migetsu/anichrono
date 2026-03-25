import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const shikimoriId = query.shikimori_id
  const tmdbId = query.tmdb_id
  const imdbId = query.imdb_id
  const kinopoiskId = query.kinopoisk_id
  const title = query.title
  const year = query.year

  if (!shikimoriId && !tmdbId && !imdbId && !kinopoiskId && !title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing search ID parameter (shikimori_id, tmdb_id, title, etc.)',
    })
  }

  const token = config.kodikApiToken
  const baseUrl = config.public.kodikApiUrl

  const searchParams: any = {
    token,
    with_material_data: true,
  }
  if (shikimoriId) searchParams.shikimori_id = shikimoriId
  if (tmdbId) searchParams.tmdb_id = tmdbId
  if (imdbId) searchParams.imdb_id = imdbId
  if (kinopoiskId) searchParams.kinopoisk_id = kinopoiskId
  if (title) searchParams.title = title
  if (year) searchParams.year = year

  try {
    const response: any = await $fetch(`${baseUrl}/search`, {
      params: searchParams,
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch from Kodik API',
    })
  }
})
