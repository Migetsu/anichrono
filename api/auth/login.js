


export default async function handler(req, res) {
  try {
    const clientId = process.env.SHIKI_CLIENT_ID;
    const redirectUri = process.env.SHIKI_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).send('Missing OAuth configuration');
    }

    
    const authUrl = new URL('https://shikimori.one/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', '');

    res.redirect(authUrl.toString());
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
}

