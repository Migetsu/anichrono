export default async function handler(req, res) {
  const { SHIKI_CLIENT_ID, SHIKI_CLIENT_SECRET, SHIKI_REDIRECT_URI } = process.env;
  const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const code = searchParams.get('code');

  if (!code) {
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
    const response = await fetch('https://shikimori.one/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await response.json();

    if (data.access_token) {
      const refreshSnippet = data.refresh_token
        ? `localStorage.setItem('shikiRefreshToken', ${JSON.stringify(data.refresh_token)});`
        : '';
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<script>
        localStorage.setItem('shikiToken', ${JSON.stringify(data.access_token)});
        ${refreshSnippet}
        window.location.href = '/';
      </script>`);
    } else {
      res.statusCode = 400;
      res.end('Authentication failed');
    }
  } catch (e) {
    res.statusCode = 500;
    res.end('Authentication error');
  }
}
