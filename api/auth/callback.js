// /api/auth/callback.js
export default async function handler(req, res) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host  = req.headers['x-forwarded-host']  || req.headers.host;
    const url   = new URL(req.url, `${proto}://${host}`);

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

    const front = new URL(process.env.FRONTEND_ORIGIN || 'https://anichrono.vercel.app');
    front.pathname = '/auth/callback'; // <— КЛЮЧЕВОЕ
    front.hash = `access_token=${encodeURIComponent(data.access_token)}`;

    res.writeHead(302, { Location: front.toString() });
    res.end();
  } catch (e) {
    res.statusCode = 500;
    res.end(`Internal error: ${e?.message || e}`);
  }
}
