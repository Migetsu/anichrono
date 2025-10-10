let cachedConfig = null;
let configPromise = null;

/**
 * Получает конфигурацию переменных окружения с сервера
 * @returns {Promise<{KODIK_API_TOKEN: string, KODIK_API_URL: string}>}
 */
export async function getEnvConfig() {
  // Если конфигурация уже загружена, возвращаем её
  if (cachedConfig) {
    return cachedConfig;
  }

  // Если запрос уже выполняется, ждём его завершения
  if (configPromise) {
    return configPromise;
  }

  // Создаём новый запрос
  configPromise = fetch('/api/env-config')
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to load environment config: ${response.status} - ${errorData.error || response.statusText}`);
      }
      
      const config = await response.json();
      cachedConfig = config;
      return config;
    })
    .catch((error) => {
      console.error('Ошибка загрузки конфигурации:', error);
      // Возвращаем fallback конфигурацию для разработки
      const fallbackConfig = {
        KODIK_API_TOKEN: import.meta.env.VITE_KODIK_API_TOKEN || '',
        KODIK_API_URL: import.meta.env.VITE_KODIK_API_URL || 'https://kodikapi.com'
      };
      cachedConfig = fallbackConfig;
      return fallbackConfig;
    })
    .finally(() => {
      configPromise = null;
    });

  return configPromise;
}

/**
 * Очищает кэш конфигурации (для тестирования)
 */
export function clearConfigCache() {
  cachedConfig = null;
  configPromise = null;
}
