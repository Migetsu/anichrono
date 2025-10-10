export default function handler(req, res) {
  // Возвращаем только необходимые переменные окружения
  const config = {
    KODIK_API_TOKEN: process.env.KODIK_API_TOKEN,
    KODIK_API_URL: process.env.KODIK_API_URL,
  };

  // Проверяем, что все необходимые переменные установлены
  if (!config.KODIK_API_TOKEN || !config.KODIK_API_URL) {
    return res.status(500).json({ 
      error: 'Missing required environment variables',
      missing: {
        KODIK_API_TOKEN: !config.KODIK_API_TOKEN,
        KODIK_API_URL: !config.KODIK_API_URL
      }
    });
  }

  res.status(200).json(config);
}
