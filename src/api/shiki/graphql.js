// api/shiki/graphql.js  (Node serverless - Vercel / Netlify style)
import fetch from 'node-fetch'; // Vercel node has global fetch in newer runtimes

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body;
    // если нужна авторизация, добавьте здесь заголовки / ключи
    // например: 'User-Agent' или токен, в env -> process.env.SHIKI_TOKEN
    const upstreamRes = await fetch('https://shikimori.one/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.SHIKI_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const json = await upstreamRes.json();
    res.status(upstreamRes.status).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Proxy error' });
  }
}
