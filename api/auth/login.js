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
  // the current request host. The page origin is passed in "state" so that
  // after authentication we can redirect the user back to the same site.
  let redirectUri = SHIKI_REDIRECT_URI || '';
  let state = '';

  // Fallback redirect URI based on the request host. Some deployments
  // (e.g. behind proxies) expose the original host via x-forwarded-host,
  // so prefer that value when available.
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!redirectUri && host) {
    const proto = req.headers['x-forwarded-proto'] || 'http';
    redirectUri = `${proto}://${host}/api/auth/callback`;
  }

  // Remember the origin of the page that initiated the login to redirect
  // the user back after the OAuth flow completes.
  try {
    if (req.headers.referer) {
      state = new URL(req.headers.referer).origin;
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
