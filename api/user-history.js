// api/user-history.js
// Serverless функция для получения истории пользователя

export default async function handler(req, res) {
  try {
    const { user_id, limit = 3, page = 1 } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    const userAgent = process.env.SHIKI_USER_AGENT || 'AniChrono';
    
    // Запрос к API Shikimori для получения истории с пагинацией
    const url = `https://shikimori.one/api/users/${user_id}/history?limit=${limit}&page=${page}&target_type=Anime`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shikimori API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch user history',
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('User history error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
