// api/user-rates.js
// Serverless функция для работы со списками пользователя (user rates)

export default async function handler(req, res) {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7); // Убираем "Bearer "
    const userAgent = process.env.SHIKI_USER_AGENT || 'AniChrono';

    // Обрабатываем разные HTTP методы
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, token, userAgent);
      case 'POST':
        return await handlePost(req, res, token, userAgent);
      case 'PUT':
        return await handlePut(req, res, token, userAgent);
      case 'DELETE':
        return await handleDelete(req, res, token, userAgent);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('User rates error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// GET - получение списков пользователя
async function handleGet(req, res, token, userAgent) {
  const { user_id, target_type, target_id, page, limit } = req.query;

  // Формируем URL с параметрами
  const url = new URL('https://shikimori.one/api/v2/user_rates');
  if (user_id) url.searchParams.set('user_id', user_id);
  if (target_type) url.searchParams.set('target_type', target_type);
  if (target_id) url.searchParams.set('target_id', target_id);
  if (page) url.searchParams.set('page', page);
  if (limit) url.searchParams.set('limit', limit);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': userAgent
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shikimori API GET error:', response.status, errorText);
    return res.status(response.status).json({ 
      error: 'Failed to fetch user rates',
      details: errorText 
    });
  }

  const data = await response.json();
  res.json(data);
}

// POST - создание нового рейта
async function handlePost(req, res, token, userAgent) {
  const { user_id, target_id, target_type, status } = req.body;

  if (!user_id || !target_id || !target_type || !status) {
    return res.status(400).json({ 
      error: 'Missing required fields: user_id, target_id, target_type, status' 
    });
  }

  const response = await fetch('https://shikimori.one/api/v2/user_rates', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_rate: {
        user_id,
        target_id,
        target_type,
        status
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shikimori API POST error:', response.status, errorText);
    return res.status(response.status).json({ 
      error: 'Failed to create user rate',
      details: errorText 
    });
  }

  const data = await response.json();
  res.json(data);
}

// PUT - обновление существующего рейта
async function handlePut(req, res, token, userAgent) {
  const { id } = req.query;
  const { status, episodes, score, text, rewatches } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing rate id' });
  }

  // Формируем объект обновления (только переданные поля)
  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (episodes !== undefined) updateData.episodes = episodes;
  if (score !== undefined) updateData.score = score;
  if (text !== undefined) updateData.text = text;
  if (rewatches !== undefined) updateData.rewatches = rewatches;

  const response = await fetch(`https://shikimori.one/api/v2/user_rates/${id}`, {
    method: 'PATCH', // Shikimori использует PATCH для обновления
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': userAgent,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_rate: updateData
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shikimori API PUT error:', response.status, errorText);
    return res.status(response.status).json({ 
      error: 'Failed to update user rate',
      details: errorText 
    });
  }

  const data = await response.json();
  res.json(data);
}

// DELETE - удаление рейта
async function handleDelete(req, res, token, userAgent) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing rate id' });
  }

  const response = await fetch(`https://shikimori.one/api/v2/user_rates/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': userAgent
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shikimori API DELETE error:', response.status, errorText);
    return res.status(response.status).json({ 
      error: 'Failed to delete user rate',
      details: errorText 
    });
  }

  // DELETE обычно возвращает 204 No Content или пустой объект
  if (response.status === 204) {
    return res.status(204).end();
  }

  const data = await response.json();
  res.json(data);
}

