<template>
  <main class="anime">
    <!-- HERO -->
    <section class="hero" v-if="anime">
      <div class="hero__bg" :style="{ backgroundImage: `url(${anime.poster?.originalUrl || fallback})` }" />
      <div class="hero__veil"></div>

      <div class="container hero__content">
        <img class="hero__poster" :src="anime.poster?.originalUrl || fallback" :alt="anime.russian || anime.name" />

        <!-- общая сетка для правой колонки -->
        <div class="hero__right">
          <div class="hero__info glass">
            <h1 class="hero__title">{{ anime.russian || anime.name }}</h1>

            <ul class="hero__facts">
              <li v-if="anime.score" class="pill pill--gold">★ {{ anime.score }}</li>
              <li v-if="anime.status" class="pill">{{ statusLabel(anime.status) }}</li>
              <li v-if="anime.kind" class="pill">{{ kindLabel(anime.kind) }}</li>
              <li v-if="anime.episodes" class="pill">Эпизодов: {{ anime.episodes }}</li>
            </ul>

            <div class="hero__meta">
              <span v-if="anime.airedOn?.date">Премьера: {{ fmtDate(anime.airedOn.date) }}</span>
              <span v-if="anime.releasedOn?.date">Завершено: {{ fmtDate(anime.releasedOn.date) }}</span>
              <span v-if="anime.duration">Эпизод: ~{{ anime.duration }} мин.</span>
            </div>
          </div>

          <article class="panel panel--desc">
            <h2 class="panel__title">Описание</h2>
            <p class="desc">{{ anime.description || 'Описание недоступно.' }}</p>
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
    <section class="container player" v-if="anime && !loading">
      <div class="player__wrapper">
        <iframe src="https://www.youtube.com/embed/5PS0bAhbgP0" title="Anime trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchAnimeById } from '@/scripts/fetchAnimeById'

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
    loading.value = false
  }
}

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
.anime {
  margin-top: 96px;
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

/* HERO */
.hero {
  position: relative;
  min-height: 420px;
  display: flex;
  align-items: center;
  padding: 28px 0 32px;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  /* если хочешь видеть фоновую картинку полностью по ширине, раскомментируй: */
  /* background-size: 100% auto; background-position: top center; */
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
  filter: saturate(1.05) contrast(1.02);
}

.hero__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 15, 25, .2) 0%, rgba(10, 15, 25, .6) 70%, rgba(10, 15, 25, .9) 100%);
  z-index: 1;
}

.hero__content {
  position: relative; z-index: 2;
  display: grid;
  grid-template-columns: 200px 1fr; /* постер + правая колонка */
  gap: 32px;
  width: 100%;
  padding: 0 16px;
}

.hero__poster {
  width: 200px; aspect-ratio: 2/3; object-fit: cover;
  border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.5);
}

.hero__right {
  grid-column: 2;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(12, 1fr);
}

.hero__info { grid-column: 1 / -1; }
.panel--desc { grid-column: 1 / -1; }
.panel--genres { grid-column: 1 / 10; }  /* 9/12 ≈ 75% */
.panel--studios { grid-column: 10 / -1; } /* 3/12 ≈ 25% */

.glass {
  background: rgba(17, 27, 39, .55);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 16px 18px;
  backdrop-filter: blur(6px);
}

.hero__title {
  margin: 0;
  font-weight: 800;
  font-size: clamp(22px, 4vw, 36px);
}

.hero__facts {
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
  color: var(--c-text);
  border: 1px solid var(--c-border);
}

.pill--gold {
  background: rgba(255, 207, 102, .1);
  border-color: rgba(255, 207, 102, .35);
  color: var(--c-gold);
}

.hero__meta {
  display: flex;
  gap: 16px;
  color: var(--c-dim);
  font-size: 13px;
  flex-wrap: wrap;
}

@media (max-width: 780px) {
  .hero__content {
    grid-template-columns: 1fr;
    gap: 20px;
    justify-items: center;
  }

  .hero__right {
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
  .hero__content { grid-template-columns: 1fr; gap: 20px; justify-items: center; }
  .hero__poster { width: 160px; grid-row: auto; }
  .hero__right { grid-column: 1; grid-template-columns: 1fr; }
  .panel--genres, .panel--studios, .panel--desc, .hero__info { grid-column: 1 / -1; }
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
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .18);
}

.panel__title {
  margin: 0 0 12px;
  font-size: 18px;
  letter-spacing: .2px;
}

.desc {
  white-space: pre-line;
  line-height: 1.7;
  color: var(--c-text);
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
  color: var(--c-text);
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
