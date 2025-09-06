export default async function handler(req, res) {
  console.log('Auth callback: start');
  const { SHIKI_CLIENT_ID, SHIKI_CLIENT_SECRET, SHIKI_REDIRECT_URI } =
    process.env;
  const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const code = searchParams.get('code');
  console.log('Auth callback: code', code);

  if (!SHIKI_CLIENT_ID || !SHIKI_CLIENT_SECRET || !SHIKI_REDIRECT_URI) {
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

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: SHIKI_CLIENT_ID,
    client_secret: SHIKI_CLIENT_SECRET,
    code,
    redirect_uri: SHIKI_REDIRECT_URI,
  });

  try {
    console.log('Auth callback: requesting token');
    const response = await fetch('https://shikimori.one/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await response.json();
    console.log('Auth callback: token response', data);

    if (data.access_token) {
      const refreshSnippet = data.refresh_token
        ? `localStorage.setItem('shikiRefreshToken', '${data.refresh_token}');`
        : '';
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<script>
        localStorage.setItem('shikiToken', '${data.access_token}');
        ${refreshSnippet}
        window.location.href = '/';
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
