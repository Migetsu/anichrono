// api/auth/callback.js
import fetch from 'node-fetch'; // Vercel Node среда поддерживает fetch, но safe to import.

export default async function handler(req, res) {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing code');

    const tokenRes = await fetch('https://shikimori.one/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SHIKI_CLIENT_ID,
        client_secret: process.env.SHIKI_CLIENT_SECRET,
        code,
        redirect_uri: process.env.SHIKI_REDIRECT_URI
      })
    });

    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      return res.status(502).send('Token exchange failed: ' + txt);
    }

    const tokenJson = await tokenRes.json();
    // tokenJson.access_token, refresh_token, expires_in

    // Сохраняем токен в httpOnly cookie (безопасно для браузера)
    const maxAge = tokenJson.expires_in || 3600;
    res.setHeader('Set-Cookie', `shiki_token=${tokenJson.access_token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
    // Можно сохранить refresh_token в другой cookie с httpOnly или в базу.

    // Редирект на фронт (например, /)
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
