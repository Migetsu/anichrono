export default function handler(req, res) {
  console.log('Auth login: start');
  const { SHIKI_CLIENT_ID, SHIKI_REDIRECT_URI } = process.env;

  if (!SHIKI_CLIENT_ID) {
    console.error('Auth login: missing client id');
    res.statusCode = 500;
    res.end('Missing Shikimori OAuth configuration');
    return;
  }

  // Determine redirect URI. Prefer explicit env variable, but fall back to
  // the origin from the request (useful for local development on different ports).
  let redirectUri = SHIKI_REDIRECT_URI || '';
  let state = '';
  try {
    if (!redirectUri && req.headers.referer) {
      const origin = new URL(req.headers.referer).origin;
      redirectUri = `${origin}/api/auth/callback`;
      state = origin;
    }
  } catch (e) {
    console.error('Auth login: failed to parse referer', e);
  }

  if (!redirectUri) {
    console.error('Auth login: missing redirect uri');
    res.statusCode = 500;
    res.end('Missing Shikimori redirect URI');
    return;
  }

  const url = new URL('https://shikimori.one/oauth/authorize');
  url.searchParams.set('client_id', SHIKI_CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  if (state) url.searchParams.set('state', state);

  const authUrl = url.toString();
  console.log('Auth login: redirecting to', authUrl);
  res.writeHead(302, { Location: authUrl });
  res.end();
}
