import { loadEnv } from './utils/loadEnv.js';
loadEnv();

export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No bearer token' });
    }
    const r = await fetch('https://shikimori.one/api/users/whoami', {
      headers: { Authorization: auth }
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}

