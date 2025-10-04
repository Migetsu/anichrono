// api/auth/callback.js
// Serverless функция для OAuth callback от Shikimori

export default async function handler(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    // Обмениваем code на access_token
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
      console.error('Token exchange failed:', txt);
      return res.status(502).send('Token exchange failed: ' + txt);
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    const expiresIn = tokenJson.expires_in || 86400; // По умолчанию 24 часа

    if (!accessToken) {
      return res.status(502).send('No access token received');
    }

    // Сохраняем токен в HttpOnly cookie для безопасности
    res.setHeader('Set-Cookie', [
      `shiki_token=${accessToken}; Path=/; Max-Age=${expiresIn}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      `shiki_token_client=${accessToken}; Path=/; Max-Age=${expiresIn}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    ]);

    // Получаем URL фронтенда для редиректа
    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    
    // Редиректим на фронтенд БЕЗ токена в URL
    res.redirect(frontendOrigin + '/?auth=success');
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send('Server error');
  }
}