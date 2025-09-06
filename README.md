# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Auth (Shikimori) — важные примечания

- Redirect URI в Shikimori должен строго совпадать с тем, что передаётся из `/auth/login` через `redirect_uri`.
  - DEV (через vercel dev): `http://localhost:3000/api/auth/callback`
  - PROD: `https://<ваш-домен>/api/auth/callback`
- Локальная разработка OAuth: используйте `vercel dev` (порт 3000). Кнопка входа в интерфейсе указывает на `/auth/login`, который через `vercel.json` переписывается на серверную функцию `/api/auth/login`.
- Для запросов к `whoami` фронтенд стучится на `/api/whoami`. Если вы запускаете чистый Vite без `vercel dev`, в сторе предусмотрен fallback на Vite‑proxy `/shiki/api/users/whoami`.
- Токен и refresh‑токен сохраняются в `localStorage` на странице `/api/auth/callback`. Если после логина ключ `shikiToken` не появился — проверьте Redirect URI.
- Все обращения к API Shikimori должны содержать заголовок `User-Agent`. Значение задаётся через переменную окружения `SHIKI_USER_AGENT`.

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

Для входа через Shikimori должны быть определены переменные окружения `SHIKI_CLIENT_ID`, `SHIKI_CLIENT_SECRET`, `SHIKI_REDIRECT_URI` и `SHIKI_USER_AGENT`. Пример файла с настройками находится в `.env.example`. Скопируйте его в `.env` и при необходимости измените значения.

На Vercel доступны следующие серверные функции:

- `/auth/login` – перенаправляет пользователя на страницу авторизации;
- `/auth/callback` – обрабатывает редирект OAuth и сохраняет токен в `localStorage`;
- `/auth/logout` – очищает токен и возвращает на главную страницу.

Авторизация доступна только в продакшн-среде Vercel. При запуске `npm run dev` локально эти маршруты недоступны, поэтому для проверки входа используйте развернутое приложение на Vercel.

После авторизации в навигации отображается кнопка выхода.
