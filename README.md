# AniChrono

AniChrono — веб‑приложение на Vue 3 для изучения актуальных аниме‑релизов и ведения личного списка просмотра через сервис [Shikimori](https://shikimori.one/). Клиент собирается с помощью Vite и развёртывается на Vercel, где также выполняются серверные функции для OAuth‑авторизации.

## Возможности
- просмотр свежих релизов, популярных и продолжающихся тайтлов;
- получение подробной информации о каждом аниме, включая жанры, студии и трейлеры;
- просмотр пользовательских рейтингов и списка «хочу посмотреть»;
- авторизация через Shikimori и синхронизация прогресса.

## Стек
- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/);
- [Pinia](https://pinia.vuejs.org/) для глобального состояния;
- [Vue Router](https://router.vuejs.org/) для навигации;
- SCSS для оформления;
- [axios](https://axios-http.com/) для HTTP‑запросов;
- [vue‑lazyload](https://github.com/hilongjw/vue-lazyload) для ленивой загрузки изображений;
- [Swiper](https://swiperjs.com/) для слайдеров;
- серверные функции Vercel на Node.js.

## Установка
1. Убедитесь, что установлен Node.js версии ≥18.
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Скопируйте файл `.env.example` в `.env` и заполните переменные окружения.

## Переменные окружения
Файл `.env` должен содержать параметры OAuth‑авторизации в Shikimori:

```dotenv
SHIKI_CLIENT_ID=
SHIKI_CLIENT_SECRET=
SHIKI_REDIRECT_URI=http://localhost:3000/api/auth/callback
SHIKI_USER_AGENT=
```

- `SHIKI_REDIRECT_URI` должен совпадать с адресом, указанным в настройках приложения на Shikimori.
- `SHIKI_USER_AGENT` отправляется в заголовке `User-Agent` при запросах к API.

## Режим разработки
Запуск фронтенда без серверных функций:
```bash
npm run dev
```

Для проверки OAuth и серверных функций используйте локальный сервер Vercel (порт 3000):
```bash
npm run dev:vercel
```

## Сборка и предпросмотр
```bash
npm run build   # production‑сборка в каталог dist
npm run preview # локальный предпросмотр собранного приложения
```

## Структура проекта
```
.
├─ api/          # серверные функции (OAuth, whoami, user-rates)
├─ public/       # статические файлы
├─ src/
│  ├─ components/  # Vue‑компоненты интерфейса
│  ├─ routers/     # маршруты приложения
│  ├─ stores/      # Pinia‑сторы
│  └─ scripts/     # утилиты для работы с API Shikimori
├─ index.html
└─ vercel.json     # настройки прокси и маршрутов для Vercel
```

## Деплой
Проект ориентирован на платформу [Vercel](https://vercel.com/). Файл `vercel.json` содержит прокси для запросов к Shikimori и перенаправление путей `/auth/*` на соответствующие функции в `api/`. Для публикации выполните:
```bash
npm run build
```
и загрузите содержимое каталога `dist` или настройте автоматический деплой через Vercel.

## Лицензия
Проект распространяется по лицензии [MIT](./LICENSE).
