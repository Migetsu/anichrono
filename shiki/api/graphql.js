// api/shiki/graphql.js
import fetch from 'node-fetch';

export default async function (req, res) {
  try {
    // Получаем токен из cookie установленной в callback
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/(?:^|; )shiki_token=([^;]+)/);
    const token = match ? match[1] : null;

    // Если нужен серверный токен (без login) — можно использовать client credentials flow,
    // но Shikimori может не поддерживать. Обычно нужен токен пользователя.
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': process.env.SHIKI_USER_AGENT || 'AniChrono/1.0'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Проксируем запрос к GraphQL-эндпоинту Shikimori
    const upstream = await fetch('https://shikimori.one/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    });

    const json = await upstream.json();
    res.status(upstream.status).json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'proxy error' });
  }
}
