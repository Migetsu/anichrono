

const cache = new Map();
const TTL = 30 * 60 * 1000; // Увеличиваем кэш до 30 минут

// Ограничитель запросов для избежания rate limit
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500; // Минимум 1.5 секунды между запросами
export async function shikiGQL(query, variables = {}) {
  const key = JSON.stringify({ query, variables });
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < TTL) {
    return cached.data;
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
  cache.set(key, { data: json.data, time: Date.now() });
  return json.data;
}