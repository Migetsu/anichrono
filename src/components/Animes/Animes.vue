<template>
  <main class="animes">
    <section class="anime" v-if="anime">
      <div class="anime__bg" :style="{ backgroundImage: `url(${anime.poster?.originalUrl || fallback})` }" />
      <div class="anime__veil"></div>

      <div class="container anime__content">
        <div class="anime__left">
          <img class="anime__poster" loading="lazy" :src="anime.poster?.originalUrl || fallback"
            :alt="anime.russian || anime.name" />
          <router-link class="button anime__watch" :to="`/watch/${anime.id}`">Смотреть</router-link>
        </div>

        <!-- общая сетка для правой колонки -->
        <div class="anime__right">
          <div class="anime__info glass">
            <h1 class="anime__title">{{ anime.russian || anime.name }}</h1>

            <ul class="anime__facts">
              <li v-if="anime.score" class="pill pill--gold">★ {{ anime.score }}</li>
              <li v-if="anime.status" class="pill">{{ statusLabel(anime.status) }}</li>
              <li v-if="anime.kind" class="pill">{{ kindLabel(anime.kind) }}</li>
              <li v-if="anime.episodes" class="pill">Эпизодов: {{ anime.episodes }}</li>
            </ul>

            <div class="anime__meta">
              <span v-if="anime.airedOn?.date">Премьера: {{ fmtDate(anime.airedOn.date) }}</span>
              <span v-if="anime.releasedOn?.date">Завершено: {{ fmtDate(anime.releasedOn.date) }}</span>
              <span v-if="anime.duration">Эпизод: ~{{ anime.duration }} мин.</span>
            </div>
          </div>

          <article class="panel panel--desc">
            <h2 class="panel__title">Описание</h2>
            <!-- <p class="desc">{{ anime.description || 'Описание недоступно.' }}</p> -->
            <div class="desc" v-html="safeDesc"></div>
          </article>

          <article class="panel panel--genres">
            <h2 class="panel__title">Жанры</h2>
            <div v-if="anime.genres?.length" class="chips">
              <span v-for="g in anime.genres" :key="g.id" class="chip">
                {{ g.russian || g.name }}
              </span>
            </div>
            <p v-else>—</p>
          </article>

          <article class="panel panel--studios">
            <h2 class="panel__title">Студии</h2>
            <div v-if="anime.studios?.length" class="chips">
              <span v-for="s in anime.studios" :key="s.id" class="chip">{{ s.name }}</span>
            </div>
            <p v-else>—</p>
          </article>
        </div>
      </div>
    </section>

    <!-- СООБЩЕНИЯ/ЛОАДЕР -->
    <section class="container state">
      <div v-if="loading" class="loader">Загрузка…</div>
      <div v-else-if="error" class="error">{{ error }}</div>
    </section>

    <!-- ПЛЕЕР -->
    <!-- <section class="container player" v-if="anime && !loading">
      <div class="player__wrapper">
        <iframe src="https://www.youtube.com/embed/5PS0bAhbgP0" title="Anime trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
    </section> -->
  </main>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchAnimeById } from '@/scripts/fetchAnimeById'
import DOMPurify from 'dompurify'

const route = useRoute()
const anime = ref(null)
const loading = ref(true)
const error = ref('')
const fallback = '/placeholder.jpg'

async function load(id) {
  loading.value = true
  error.value = ''
  anime.value = null
  try {
    anime.value = await fetchAnimeById(id)
  } catch (e) {
    error.value = String(e.message || e)
  } finally {
    console.log(anime.value)
    loading.value = false
  }
}

// разрешённые теги/атрибуты
const ALLOWED_TAGS = ['div', 'p', 'br', 'a', 'span', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li']
const ALLOWED_ATTR = ['href', 'title']

DOMPurify.addHook('afterSanitizeAttributes', node => {
  node.removeAttribute?.('class')
  node.removeAttribute?.('style')
    // убираем любые data-*
    ;[...(node.attributes || [])].forEach(attr => {
      if (attr.name.startsWith('data-')) node.removeAttribute(attr.name)
    })
  // ссылки — безопасно в новой вкладке
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer nofollow')
  }
})

const safeDesc = computed(() => {
  const html = anime.value?.descriptionHtml || ''
  return html
    ? DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      USE_PROFILES: { html: true }
    })
    : '' // пусто — чтобы не вставлять "undefined"
})

watch(
  () => route.params.id,
  id => { if (id != null) load(Number(id)) },
  { immediate: true }
)

// Вспомогательные форматтеры (без зависимостей)
function fmtDate(isoLike) {
  // ожидаем 'YYYY-MM-DD' или ISO
  const d = new Date(isoLike)
  if (String(d) === 'Invalid Date') return isoLike
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
}
function statusLabel(s) {
  const map = { anons: 'Анонс', ongoing: 'Онгоинг', released: 'Вышло' }
  return map[s] || s
}
function kindLabel(k) {
  const map = { tv: 'TV', movie: 'Фильм', ova: 'OVA', ona: 'ONA', special: 'Спешл' }
  return map[k] || k
}
</script>

<style scoped>
:root {
  --c-bg: #0b1220;
  --c-surface: #111b27;
  --c-border: rgba(255, 255, 255, .08);
  --c-text: #e7ecf3;
  --c-dim: #a9b3c3;
  --c-accent: #7aa2ff;
  --c-gold: #ffcf66;
}

/* Общая сетка */
.animes {
  margin-top: 80px;
  color: var(--c-text);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.error {
  color: #ff6b6b;
  margin: 12px 0;
}

.state {
  min-height: 48px;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 18px;
  background-color: rgba(20, 20, 20, 0.7);;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color .2s;
  margin-top: 15px;
}

.button:hover {
  background-color: rgba(20, 20, 20, 1);
}

.anime {
  position: relative;
  min-height: 420px;
  display: flex;
  align-items: center;
  padding: 28px 0 32px;
  overflow: hidden;
}

.anime__bg {
  position: absolute;
  inset: 0;
  /* если хочешь видеть фоновую картинку полностью по ширине, раскомментируй: */
  /* background-size: 100% auto; background-position: top center; */
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
  filter: saturate(1.1) brightness(0.6);
}

.anime__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 15, 25, .2) 0%, rgba(10, 15, 25, .6) 70%, rgba(10, 15, 25, .9) 100%);
  z-index: 1;
  backdrop-filter: blur(5px);
}

.anime__content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 200px 1fr;
  /* постер + правая колонка */
  gap: 32px;
  width: 100%;
  padding: 0 16px;
}

.anime__poster {
  width: 200px;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .5);
}

.anime__right {
  grid-column: 2;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(12, 1fr);
}

.anime__info {
  grid-column: 1 / -1;
}

.panel--desc {
  grid-column: 1 / -1;
}

.panel--genres {
  grid-column: 1 / 10;
}

/* 9/12 ≈ 75% */
.panel--studios {
  grid-column: 10 / -1;
}

/* 3/12 ≈ 25% */

.glass {
  background: rgba(17, 27, 39, .55);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 16px 18px;
  backdrop-filter: blur(6px);
}

.anime__title {
  margin: 0;
  font-weight: 800;
  font-size: clamp(22px, 4vw, 36px);
  color: #fff;
}

.anime__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 6px 0 10px;
  padding: 0;
  list-style: none;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  background: rgba(255, 255, 255, .08);
  color: #fff;
  border: 1px solid var(--c-border);
}

.pill--gold {
  background: rgba(255, 207, 102, .1);
  border-color: rgba(255, 207, 102, .35);
  color: gold;
}

.anime__meta {
  display: flex;
  gap: 16px;
  color: #fff;
  font-size: 13px;
  flex-wrap: wrap;
}

@media (max-width: 780px) {
  .anime__content {
    grid-template-columns: 1fr;
    gap: 20px;
    justify-items: center;
  }

  .anime__right {
    grid-column: 1;
    width: 100%;
  }

  .glass {
    padding: 14px;
  }
}

/* BODY */
.body {
  padding: 28px 0 44px;
}

.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (max-width: 900px) {
  .anime__content {
    grid-template-columns: 1fr;
    gap: 20px;
    justify-items: center;
  }

  .anime__poster {
    width: 160px;
    grid-row: auto;
  }

  .anime__right {
    grid-column: 1;
    grid-template-columns: 1fr;
  }

  .panel--genres,
  .panel--studios,
  .panel--desc,
  .anime__info {
    grid-column: 1 / -1;
  }
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: 2fr 1fr;
  }

  .panel--full {
    grid-column: 1 / -1;
  }
}

.panel {
  background: rgba(17, 27, 39, .55);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .18);
}

.panel__title {
  margin: 0 0 12px;
  font-size: 26px;
  letter-spacing: .2px;
  color: #fff;
}

.desc {
  white-space: pre-line;
  line-height: 1.7;
  color: var(--c-text);
}

/* базовая типографика блока описания */
.desc {
  color: #fff;
  /* белый текст */
  font-size: 15.5px;
  /* подкорректированный размер */
  line-height: 1.75;
  /* комфортный межстрочный */
  letter-spacing: .1px;
}

/* отступы между абзацами/списками */
.desc :where(p, ul, ol) {
  margin: 0 0 12px;
}

/* списки — немного воздуха и отступ слева */
.desc :where(ul, ol) {
  padding-left: 20px;
}

.desc li {
  margin: 4px 0;
}

/* переносы <br> не дают больших дыр — полагаемся на line-height */
.desc br {
  line-height: 1.2;
}

/* ссылки */
:deep(.desc a) {
  color: var(--c-accent, #7aa2ff);
  text-decoration: none;
  /* border-bottom: 1px dashed rgba(122, 162, 255, .5); */
  transition: border-color .2s, color .2s, opacity .2s;
}

:deep(.desc a:hover) {
  border-bottom-color: rgba(122, 162, 255, .9);
  color: #9bb6ff;
}

/* выделения */
.desc :where(strong, b) {
  font-weight: 700;
}

.desc :where(em, i) {
  font-style: italic;
}

/* на очень узких экранах — чуть менее плотный текст */
@media (max-width: 600px) {
  .desc {
    font-size: 15px;
    line-height: 1.7;
  }
}

/* Chips */
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(122, 162, 255, .12);
  color: #fff;
  border: 1px solid rgba(122, 162, 255, .28);
}

/* Player */
.player {
  padding: 8px 0 40px;
}

.player__wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(0, 0, 0, .35);
  border: 1px solid var(--c-border);
}

.player__wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Loader */
.loader {
  width: 100%;
  padding: 14px;
  text-align: center;
  color: var(--c-dim);
  border-radius: 10px;
  background: rgba(255, 255, 255, .04);
  border: 1px dashed var(--c-border);
}
</style>