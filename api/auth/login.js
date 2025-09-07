// /api/auth/login.js
export default function handler(req, res) {
  const cid = process.env.SHIKI_CLIENT_ID;
  const redirect = process.env.SHIKI_REDIRECT_URI;
  if (!cid || !redirect) {
    res.statusCode = 500;
    return res.end(`Missing env: ${!cid ? 'SHIKI_CLIENT_ID ' : ''}${!redirect ? 'SHIKI_REDIRECT_URI' : ''}`);
  }
  const qs = new URLSearchParams({
    client_id: cid,
    redirect_uri: redirect,
    response_type: 'code'
  });
  res.writeHead(302, { Location: `https://shikimori.one/oauth/authorize?${qs}` });
  res.end();
}
