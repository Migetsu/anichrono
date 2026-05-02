interface ShikimoriTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
  created_at: number
}

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig(event)
  const clientId = config.shikiClientId || process.env.SHIKI_CLIENT_ID
  const clientSecret = config.shikiClientSecret || process.env.SHIKI_CLIENT_SECRET
  const THIRTY_DAYS = 30 * 24 * 60 * 60

  let token = getCookie(event, 'shiki_token')
  const refreshToken = getCookie(event, 'shiki_refresh')

  if (!token && !refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Attempt to refresh if token is missing but refresh token exists
  if (!token && refreshToken) {
    try {
      const tokenRes = await $fetch<ShikimoriTokenResponse>('https://shikimori.io/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': process.env.SHIKI_USER_AGENT || 'AniChrono'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: String(clientId || ''),
          client_secret: String(clientSecret || ''),
          refresh_token: String(refreshToken)
        })
      })

      token = tokenRes.access_token
      const newRefreshToken = tokenRes.refresh_token
      const expiresIn = tokenRes.expires_in || 86400

      if (token) {
        setCookie(event, 'shiki_token', token, {
          path: '/',
          maxAge: expiresIn,
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })

        if (newRefreshToken) {
          setCookie(event, 'shiki_refresh', newRefreshToken, {
            path: '/',
            maxAge: THIRTY_DAYS,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          })
        }
      }
    } catch (e: any) {
      console.error('Refresh token failed:', e)
      deleteCookie(event, 'shiki_token')
      deleteCookie(event, 'shiki_refresh')
      deleteCookie(event, 'shiki_session')
      throw createError({ statusCode: 401, statusMessage: 'Session expired' })
    }
  }

  try {
    const user = await $fetch<any>('https://shikimori.io/api/users/whoami', {
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