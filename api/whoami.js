// /api/whoami.js
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      res.statusCode = 401;
      return res.json({ error: 'No bearer token' });
    }
    const r = await fetch('https://shikimori.one/api/users/whoami', {
      headers: { Authorization: auth }
    });
    const data = await r.json();
    res.statusCode = r.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(e.message || e) }));
  }
}
