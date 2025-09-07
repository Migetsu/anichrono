// /api/auth/callback.js
export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');
    if (!code) { res.statusCode = 400; return res.end('Missing code'); }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SHIKI_CLIENT_ID,
      client_secret: process.env.SHIKI_CLIENT_SECRET,
      redirect_uri: process.env.SHIKI_REDIRECT_URI,
      code
    });

    const r = await fetch('https://shikimori.one/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });
    const data = await r.json();
    if (!r.ok || !data.access_token) {
      res.statusCode = r.status || 500;
      return res.end(`Token exchange failed: ${JSON.stringify(data)}`);
    }

    let frontendOrigin = process.env.FRONTEND_ORIGIN;
    if (!frontendOrigin) {
      if (req.headers.host && req.headers.host.includes('localhost')) {
        frontendOrigin = 'http://localhost:5173';
      } else {
        const proto = req.headers['x-forwarded-proto'] || 'https';
        frontendOrigin = `${proto}://${req.headers.host}`;
      }
    }
    // 302 на фронт, токен в hash (не уходит на сервер)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html>
<html><head><meta charset="utf-8"><title>Auth Callback</title></head>
<body>
<script>
  try { localStorage.setItem('shikiToken', ${JSON.stringify(data.access_token)}); } catch(e) {}
  const frontendOrigin = ${JSON.stringify(frontendOrigin)};
  location.replace(frontendOrigin);
</script>
</body></html>`);
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e?.message || e));
  }
}
