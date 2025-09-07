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

    let FRONT = process.env.FRONTEND_ORIGIN;
    if (!FRONT) {
      const proto = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      FRONT = host.includes('localhost') ? 'http://localhost:5173' : `${proto}://${host}`;
    }
    // 302 на фронт, токен в hash (не уходит на сервер)
    res.writeHead(302, {
      Location: `${FRONT}/auth/callback#access_token=${encodeURIComponent(data.access_token)}`
    });
    res.end();
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e?.message || e));
  }
}
