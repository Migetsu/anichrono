// /api/auth/callback.js
export default async function handler(req, res) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = new URL(req.url, `${proto}://${host}`);

    const code = url.searchParams.get('code');
    if (!code) { res.statusCode = 400; return res.end('Missing code'); }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SHIKI_CLIENT_ID,
      client_secret: process.env.SHIKI_CLIENT_SECRET,
      redirect_uri: process.env.SHIKI_REDIRECT_URI, // = https://.../api/auth/callback
      code
    });

    const tokenResp = await fetch('https://shikimori.one/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });
    const data = await tokenResp.json();
    if (!tokenResp.ok || !data.access_token) {
      res.statusCode = tokenResp.status || 500;
      return res.end(`Token exchange failed: ${JSON.stringify(data)}`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    const token = JSON.stringify(data.access_token)
    res.end(`<!doctype html><html><body><script>
      try {
        localStorage.setItem('shiki_access_token', ${token});
        localStorage.setItem('shikiToken', ${token});
      } catch(e) {}
      location.replace('/')
    </script></body></html>`)
  } catch (e) {
    res.statusCode = 500;
    res.end(`Internal error: ${e?.message || e}`);
  }
}
