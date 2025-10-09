


export default async function handler(req, res) {
  try {
    const clientId = process.env.SHIKI_CLIENT_ID;
    const redirectUri = process.env.SHIKI_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).send('Missing OAuth configuration');
    }

    // Принимаем state от фронтенда (base64url кодированный путь/URL для возврата)
    const rawState = (req.query && req.query.state) ? String(req.query.state) : '';

    const authUrl = new URL('https://shikimori.one/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', '');
    if (rawState) authUrl.searchParams.set('state', rawState);

    res.redirect(authUrl.toString());
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
}

