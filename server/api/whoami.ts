export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'shiki_token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  try {
    const user = await $fetch('https://shikimori.io/api/users/whoami', {
      headers: {
        'User-Agent': process.env.SHIKI_USER_AGENT || 'AniChrono',
        'Authorization': `Bearer ${token}`
      }
    })
    return user
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: 'Failed to fetch user profile',
      data: err.data || err.message
    })
  }
})