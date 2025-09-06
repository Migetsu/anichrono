export default function handler(req, res) {
  const { SHIKI_CLIENT_ID, SHIKI_REDIRECT_URI } = process.env;
  const authUrl = `https://shikimori.one/oauth/authorize?client_id=${SHIKI_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SHIKI_REDIRECT_URI)}`;
  res.writeHead(302, { Location: authUrl });
  res.end();
}
