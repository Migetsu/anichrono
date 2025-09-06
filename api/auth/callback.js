export default async function handler(req, res) {
  console.log('Auth callback: start');
  const {
    SHIKI_CLIENT_ID,
    SHIKI_CLIENT_SECRET,
    SHIKI_REDIRECT_URI,
    SHIKI_USER_AGENT,
  } = process.env;
  const userAgent = SHIKI_USER_AGENT || 'anichrono-app';
  const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '';
  console.log('Auth callback: code', code, 'state', state);

  if (!SHIKI_CLIENT_ID || !SHIKI_CLIENT_SECRET) {
    console.error('Auth callback: missing OAuth configuration');
    res.statusCode = 500;
    res.end('Missing Shikimori OAuth configuration');
    return;
  }

  if (!code) {
    console.error('Auth callback: missing code');
    res.statusCode = 400;
    res.end('Missing code');
    return;
  }

  // Determine the redirect URI that was used during the authorization
  // request. It must match exactly; otherwise Shikimori rejects the token
  // exchange. Unlike the login handler, the "state" parameter here is used
  // only to remember the original page and should not influence redirect_uri.
  let redirectUri = SHIKI_REDIRECT_URI || '';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!redirectUri && host) {
    const proto = req.headers['x-forwarded-proto'] || 'http';
    redirectUri = `${proto}://${host}/api/auth/callback`;
  }

  if (!redirectUri) {
    console.error('Auth callback: missing redirect uri');
    res.statusCode = 500;
    res.end('Missing Shikimori redirect URI');
    return;
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: SHIKI_CLIENT_ID,
    client_secret: SHIKI_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  });

  try {
    console.log('Auth callback: requesting token');
    const response = await fetch('https://shikimori.one/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent,
      },
      body,
    });
    const data = await response.json();
    console.log('Auth callback: token response', data);

    if (data.access_token) {
      const refreshSnippet = data.refresh_token
        ? `localStorage.setItem('shikiRefreshToken', ${JSON.stringify(
            data.refresh_token,
          )});`
        : '';
      const redirectTarget = state || '/';
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<script>
        localStorage.setItem('shikiToken', ${JSON.stringify(
          data.access_token,
        )});
        ${refreshSnippet}
        window.location.href = ${JSON.stringify(redirectTarget)};
      </script>`);
    } else {
      console.error('Auth callback: authentication failed', data);
      res.statusCode = 400;
      res.end('Authentication failed');
    }
  } catch (e) {
    console.error('Auth callback: error', e);
    res.statusCode = 500;
    res.end('Authentication error');
  }
}
