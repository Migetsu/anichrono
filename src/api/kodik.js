// Переменные окружения для Kodik API
const KODIK_API_TOKEN = import.meta.env.VITE_KODIK_API_TOKEN;
const KODIK_API_URL = import.meta.env.VITE_KODIK_API_URL;

// Отладочная информация
console.log('Kodik API Config:', {
  token: KODIK_API_TOKEN ? '***' + KODIK_API_TOKEN.slice(-4) : 'NOT SET',
  url: KODIK_API_URL || 'NOT SET',
  hasToken: !!KODIK_API_TOKEN,
  hasUrl: !!KODIK_API_URL
});

/**
 * Поиск контента в Kodik по Shikimori ID
 * @param {string|number} shikimoriId - ID аниме из Shikimori
 * @param {object} options - Дополнительные параметры поиска
 * @returns {Promise<object>} Результат поиска
 */
export async function searchKodikByShikimoriId(shikimoriId, options = {}) {
  if (!KODIK_API_TOKEN || !KODIK_API_URL) {
    throw new Error('Kodik API configuration is missing. Check VITE_KODIK_API_TOKEN and VITE_KODIK_API_URL environment variables.');
  }

  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    shikimori_id: String(shikimoriId),
    with_seasons: 'true',
    with_episodes: 'true',
    with_episodes_data: 'true',
    with_material_data: 'true',
    ...options
  });

  const url = `${KODIK_API_URL}/search?${params}`;
  console.log('Kodik API запрос:', {
    url: url.replace(KODIK_API_TOKEN, '***'),
    shikimoriId,
    token: KODIK_API_TOKEN ? '***' + KODIK_API_TOKEN.slice(-4) : 'NOT SET'
  });

  try {
    const response = await fetch(url);
    
    console.log('Kodik API ответ:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kodik API ошибка:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Kodik API данные:', data);
    return data;
  } catch (error) {
    console.error('Ошибка поиска в Kodik API:', error);
    throw error;
  }
}

/**
 * Получение списка всех материалов с фильтрацией
 * @param {object} filters - Параметры фильтрации
 * @returns {Promise<object>} Список материалов
 */
export async function getKodikList(filters = {}) {
  if (!KODIK_API_TOKEN || !KODIK_API_URL) {
    throw new Error('Kodik API configuration is missing. Check VITE_KODIK_API_TOKEN and VITE_KODIK_API_URL environment variables.');
  }

  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    with_seasons: 'true',
    with_episodes: 'true',
    with_episodes_data: 'true',
    with_material_data: 'true',
    ...filters
  });

  try {
    const response = await fetch(`${KODIK_API_URL}/list?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка получения списка из Kodik API:', error);
    throw error;
  }
}

/**
 * Получение информации о сезонах и сериях
 * @param {string} kodikId - ID материала в Kodik
 * @returns {Promise<object>} Информация о сезонах и сериях
 */
export async function getKodikSeasons(kodikId) {
  if (!KODIK_API_TOKEN || !KODIK_API_URL) {
    throw new Error('Kodik API configuration is missing. Check VITE_KODIK_API_TOKEN and VITE_KODIK_API_URL environment variables.');
  }

  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    id: String(kodikId),
    with_seasons: 'true',
    with_episodes: 'true',
    with_episodes_data: 'true'
  });

  try {
    const response = await fetch(`${KODIK_API_URL}/list?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка получения сезонов из Kodik API:', error);
    throw error;
  }
}
