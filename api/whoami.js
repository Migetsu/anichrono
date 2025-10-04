// api/whoami.js
// Serverless функция для получения информации о текущем пользователе

export default async function handler(req, res) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7); // Убираем "Bearer "

    // Запрашиваем информацию о пользователе у Shikimori
    const userAgent = process.env.SHIKI_USER_AGENT || 'AniChrono';
    const response = await fetch('https://shikimori.one/api/users/whoami', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': userAgent
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shikimori API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch user data',
        details: errorText 
      });
    }

    const userData = await response.json();
    res.json(userData);
  } catch (err) {
    console.error('Whoami error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

