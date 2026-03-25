export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const clientId = config.shikiClientId || process.env.SHIKI_CLIENT_ID
  const redirectUri = config.shikiRedirectUri || process.env.SHIKI_REDIRECT_URI

  if (!clientId || !redirectUri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing OAuth configuration'
    })
  }

  // Get state from query (base64url encoded path/URL for return)
  const query = getQuery(event)
  const rawState = query.state ? String(query.state) : ''

  const authUrl = new URL('https://shikimori.io/oauth/authorize')
  authUrl.searchParams.set('client_id', String(clientId))
  authUrl.searchParams.set('redirect_uri', String(redirectUri))
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', '') // Add scopes if needed in future
  if (rawState) authUrl.searchParams.set('state', rawState)

  return sendRedirect(event, authUrl.toString())
})