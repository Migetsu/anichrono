import { defineEventHandler, createError, getCookie, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'shiki_token')
  const { id, limit = 10 } = getQuery(event)
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing user ID' })
  }

  const headers: Record<string, string> = {
    'User-Agent': process.env.SHIKI_USER_AGENT || 'anichrono'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const data: any[] = await $fetch(`https://shikimori.one/api/users/${id}/history`, {
      query: { limit },
      headers
    })
    return data.slice(0, Number(limit))
  } catch (err: any) {
    throw createError({
      statusCode: err.response?.status || 500,
      message: err.data?.message || err.message || 'Error fetching user history'
    })
  }
})
