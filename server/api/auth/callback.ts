export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const clientId = config.shikiClientId || process.env.SHIKI_CLIENT_ID
  const clientSecret = config.shikiClientSecret || process.env.SHIKI_CLIENT_SECRET
  const redirectUri = config.shikiRedirectUri || process.env.SHIKI_REDIRECT_URI

  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing authorization code'
    })
  }

  try {
    const tokenRes = await $fetch<any>('https://shikimori.io/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': process.env.SHIKI_USER_AGENT || 'AniChrono'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: String(clientId || ''),
        client_secret: String(clientSecret || ''),
        code: String(code || ''),
        redirect_uri: String(redirectUri || '')
      })
    })

    const accessToken = tokenRes.access_token
    const refreshToken = tokenRes.refresh_token
    const expiresIn = tokenRes.expires_in || 86400
    const THIRTY_DAYS = 30 * 24 * 60 * 60

    if (!accessToken) {
      throw createError({
        statusCode: 502,
        statusMessage: 'No access token received'
      })
    }

    // Set Access Token cookie
    setCookie(event, 'shiki_token', accessToken, {
      path: '/',
      maxAge: expiresIn,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    // Set Refresh Token cookie (Long-lived, httpOnly)
    if (refreshToken) {
      setCookie(event, 'shiki_refresh', refreshToken, {
        path: '/',
        maxAge: THIRTY_DAYS,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
    }

    // Client-readable cookie to indicate session existence (boolean flag only)
    setCookie(event, 'shiki_session', '1', {
      path: '/',
      maxAge: THIRTY_DAYS, // Keep session active for 30 days
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    // Determine redirect target
    let target = '/?auth=success'
    try {
      if (state && state.length > 0) {
        // base64url -> base64
        const b64 = state.replace(/-/g, '+').replace(/_/g, '/')
        // Use Buffer (Node.js) to decode
        const decoded = Buffer.from(b64, 'base64').toString('utf8')

        // Simple validation: only allow relative paths or same origin (implied by redirect logic being generic here)
        // For safety, we prefer relative paths. If absolute, we'd need to check origin.
        // Assuming the state generator only puts relative paths or we trust the state.
        // Let's implement basic safety: if it starts with http, ignore it (or strict check).

        if (decoded.startsWith('/')) {
          target = decoded + (decoded.includes('?') ? '&' : '?') + 'auth=success'
        }
      }
    } catch (e) {
      // ignore decode errors
    }

    return sendRedirect(event, target)

  } catch (err: any) {
    console.error('Token exchange failed:', err)
    throw createError({
      statusCode: 502,
      statusMessage: 'Token exchange failed',
      data: err.data || err.message
    })
  }
})