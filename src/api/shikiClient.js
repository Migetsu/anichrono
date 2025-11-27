const CACHE_PREFIX = 'shiki_cache_';
const TTL = 30 * 60 * 1000; // 30 минут

// Ограничитель запросов для избежания rate limit
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500; // Минимум 1.5 секунды между запросами

function getCache(key) {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.time < TTL) {
      return parsed.data;
    } else {
      // Удаляем протухший кэш
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
  } catch (e) {
    console.warn('Error reading from cache:', e);
    return null;
  }
}

function setCache(key, data) {
  try {
    const item = JSON.stringify({ data, time: Date.now() });
    localStorage.setItem(CACHE_PREFIX + key, item);
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      // Если место кончилось, чистим старый кэш
      try {
        console.warn('Storage quota exceeded, clearing old cache...');
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        // Удаляем все (можно оптимизировать и удалять только старые, но для простоты сносим всё)
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Пробуем записать снова
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, time: Date.now() }));
      } catch (retryError) {
        console.error('Failed to clear and set cache:', retryError);
      }
    } else {
      console.warn('Error setting cache:', e);
    }
  }
}

export async function shikiGQL(query, variables = {}) {
  // Создаем хеш ключа для сокращения длины (простая версия)
  // Для надежности лучше использовать полный JSON, но localStorage имеет лимиты на длину ключа
  // В данном случае используем JSON, так как запросы не очень длинные
  const keyRaw = JSON.stringify({ query, variables });
  
  // Простая хэш-функция для ключа, чтобы не хранить огромные JSON в ключах
  let hash = 0;
  for (let i = 0; i < keyRaw.length; i++) {
    const char = keyRaw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const key = hash.toString();

  const cachedData = getCache(key);
  if (cachedData) {
    return cachedData;
  }
  
  // Ограничиваем частоту запросов
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
  
  const res = await fetch('https://shikimori.one/api/graphql', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'User-Agent': 'AniChrono/1.0'
    },
    body: JSON.stringify({ query, variables })
  });
  
  // Проверяем статус ответа перед парсингом JSON
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  // Проверяем, что ответ содержит JSON
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
  }
  
  const json = await res.json();
  if (json.errors) {
    const msg = json.errors?.[0]?.message || 'GraphQL error';
    throw new Error(msg);
  }
  
  setCache(key, json.data);
  return json.data;
}