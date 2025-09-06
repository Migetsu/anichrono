// /api/whoami.js
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || '';
    console.log('whoami: start with header', auth);
    if (!auth.startsWith('Bearer ')) {
      console.error('whoami: no bearer token');
      return res.status(401).json({ error: 'No bearer token' });
    }
    console.log('whoami: requesting user');
    const userAgent = process.env.SHIKI_USER_AGENT || 'anichrono-app';
    const r = await fetch('https://shikimori.one/api/users/whoami', {
      headers: { Authorization: auth, 'User-Agent': userAgent },
    });
    const data = await r.json();
    console.log('whoami: response status', r.status);
    if (!r.ok) return res.status(r.status).json(data);
    res.status(200).json(data);
  } catch (e) {
    console.error('whoami: error', e);
    res.status(500).json({ error: String(e.message || e) });
  }
}
