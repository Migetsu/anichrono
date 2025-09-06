# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Деплой

Проект готов к размещению на [Vercel](https://vercel.com). Конфигурация находится в файле `vercel.json` и включает проксиирование запросов к API Shikimori:

```json
{
  "rewrites": [
    {
      "source": "/shiki/:path*",
      "destination": "https://shikimori.one/:path*"
    }
  ]
}
```

Благодаря этой настройке запрос `fetch('/shiki/api/graphql')` автоматически отправляется на `https://shikimori.one/api/graphql`.

Для подготовки приложения выполните production-сборку:

```bash
npm run build
```

Полученные файлы из каталога `dist` будут использованы при деплое.

## Авторизация

Для входа через Shikimori должны быть определены переменные окружения `SHIKI_CLIENT_ID`, `SHIKI_CLIENT_SECRET` и `SHIKI_REDIRECT_URI`. Пример файла с настройками находится в `.env.example`. Скопируйте его в `.env` и при необходимости измените значения.

Добавлены серверные функции:

- `/auth/login` – перенаправляет пользователя на страницу авторизации;
- `/auth/callback` – обрабатывает редирект OAuth и сохраняет токен в `localStorage`;
- `/auth/logout` – очищает токен и возвращает на главную страницу.

При запуске `npm run dev` эти маршруты обслуживаются встроенным middleware Vite, поэтому авторизация доступна локально без отдельного сервера. Для локального тестирования используйте редирект `http://localhost:5173/auth/callback` и установите `SHIKI_REDIRECT_URI` на этот адрес. На Vercel запросы к `/auth/*` автоматически перенаправляются на соответствующие серверные функции.

После авторизации в навигации отображается кнопка выхода.
