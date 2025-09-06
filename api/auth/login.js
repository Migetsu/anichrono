export default function handler(req, res) {
  console.log('Auth login: start');
  const { SHIKI_CLIENT_ID, SHIKI_REDIRECT_URI } = process.env;

  if (!SHIKI_CLIENT_ID || !SHIKI_REDIRECT_URI) {
    console.error('Auth login: missing OAuth configuration');
    res.statusCode = 500;
    res.end('Missing Shikimori OAuth configuration');
    return;
  }

  const authUrl = `https://shikimori.one/oauth/authorize?client_id=${SHIKI_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    SHIKI_REDIRECT_URI,
  )}`;
  console.log('Auth login: redirecting to', authUrl);
  res.writeHead(302, { Location: authUrl });
  res.end();
}
