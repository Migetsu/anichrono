const KODIK_API_TOKEN = '0ee37704c7a66a5cb289fe2d5c78e884';
const KODIK_API_BASE = 'https://kodikapi.com';

/**
 * Поиск контента в Kodik по Shikimori ID
 * @param {string|number} shikimoriId - ID аниме из Shikimori
 * @param {object} options - Дополнительные параметры поиска
 * @returns {Promise<object>} Результат поиска
 */
export async function searchKodikByShikimoriId(shikimoriId, options = {}) {
  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    shikimori_id: String(shikimoriId),
    with_seasons: 'true',
    with_episodes: 'true',
    with_episodes_data: 'true',
    with_material_data: 'true',
    ...options
  });

  try {
    const response = await fetch(`${KODIK_API_BASE}/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
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
  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    with_seasons: 'true',
    with_episodes: 'true',
    with_episodes_data: 'true',
    with_material_data: 'true',
    ...filters
  });

  try {
    const response = await fetch(`${KODIK_API_BASE}/list?${params}`);
    
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
  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    id: String(kodikId),
    with_seasons: 'true',
    with_episodes: 'true',
    with_episodes_data: 'true'
  });

  try {
    const response = await fetch(`${KODIK_API_BASE}/list?${params}`);
    
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
