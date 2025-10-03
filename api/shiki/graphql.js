// api/shiki/graphql.js
// Serverless функция для проксирования GraphQL запросов к Shikimori API

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, variables } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'GraphQL query is required' });
    }

    // Проксируем запрос к Shikimori GraphQL API
    const response = await fetch('https://shikimori.one/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AniChrono/1.0'
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await response.json();

    // Возвращаем ответ от Shikimori
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Shikimori GraphQL error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

