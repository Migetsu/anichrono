


export default async function handler(req, res) {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }

    
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
    const expiresIn = tokenJson.expires_in || 86400; 

    if (!accessToken) {
      return res.status(502).send('No access token received');
    }

    
    res.setHeader('Set-Cookie', [
      `shiki_token=${accessToken}; Path=/; Max-Age=${expiresIn}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      `shiki_token_client=${accessToken}; Path=/; Max-Age=${expiresIn}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    ]);

    
    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

    // Если был передан state — это base64url путь/URL для возврата
    let target = '/?auth=success'
    try {
      if (typeof state === 'string' && state.length > 0) {
        // base64url -> base64
        const b64 = state.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = Buffer.from(b64, 'base64').toString('utf8');
        if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
          // Безопасность: разрешаем только свой origin
          const url = new URL(decoded);
          const allowed = new URL(frontendOrigin);
          if (url.origin === allowed.origin) {
            target = url.pathname + url.search + (url.search ? '&' : '?') + 'auth=success'
          }
        } else {
          // Относительный путь
          target = decoded + (decoded.includes('?') ? '&' : '?') + 'auth=success'
        }
      }
    } catch {}

    res.redirect(frontendOrigin + target);
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send('Server error');
  }
}