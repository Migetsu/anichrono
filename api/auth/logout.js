// api/auth/logout.js
// Serverless функция для выхода из системы

export default async function handler(req, res) {
  try {
    // Получаем URL фронтенда для редиректа
    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    
    // Редиректим на главную страницу
    // Очистка токена происходит на клиентской стороне в store
    res.redirect(frontendOrigin);
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).send('Server error');
  }
}

