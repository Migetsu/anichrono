<template>
  <main class="anime">
    <section class="hero" v-if="anime">
      <div
        class="hero__bg"
        :style="{ backgroundImage: `url(${anime.poster?.originalUrl || fallback})` }"
      />
      <div class="hero__shade"></div>

      <div class="container hero__content">
        <img
          class="hero__poster"
          :src="anime.poster?.originalUrl || fallback"
          :alt="anime.russian || anime.name"
        />
        <div class="hero__info">
          <h1 class="hero__title">{{ anime.russian || anime.name }}</h1>
          <ul class="hero__facts">
            <li v-if="anime.score">★ {{ anime.score }}</li>
            <li v-if="anime.status">Статус: {{ anime.status }}</li>
            <li v-if="anime.episodes">Эпизодов: {{ anime.episodes }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="container player" v-if="anime">
      <div class="player__wrapper">
        <iframe
          src="https://www.youtube.com/embed/5PS0bAhbgP0"
          title="Anime trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </section>

    <section class="container body">
      <div v-if="loading">Загрузка…</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else-if="anime" class="grid">
        <article class="panel panel--full">
          <h2 class="panel__title">Описание</h2>
          <p class="desc">{{ anime.description || 'Описание недоступно.' }}</p>
        </article>

        <article class="panel">
          <h2 class="panel__title">Информация</h2>
          <ul class="info">
            <li v-if="anime.kind">Тип: {{ anime.kind }}</li>
            <li v-if="anime.rating">Рейтинг: {{ anime.rating }}</li>
            <li v-if="anime.airedOn">Премьера: {{ anime.airedOn }}</li>
            <li v-if="anime.releasedOn">Завершено: {{ anime.releasedOn }}</li>
            <li v-if="anime.duration">Длительность эпизода: {{ anime.duration }} мин.</li>
            <li v-if="anime.episodesAired">Вышло эпизодов: {{ anime.episodesAired }}</li>
          </ul>
        </article>

        <article class="panel">
          <h2 class="panel__title">Жанры</h2>
          <p v-if="anime.genres?.length">{{ anime.genres.map(g => g.russian || g.name).join(', ') }}</p>
          <p v-else>—</p>
        </article>

        <article class="panel">
          <h2 class="panel__title">Студии</h2>
          <p v-if="anime.studios?.length">{{ anime.studios.map(s => s.name).join(', ') }}</p>
          <p v-else>—</p>
        </article>
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
  id => {
    if (id != null) load(Number(id))
  },
  { immediate: true }
)
</script>

<style scoped>
.anime { margin-top: 100px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.error { color: #ff6b6b; margin-top: 12px; }

/* Hero */
.hero { position: relative; height: min(60vh, 520px); min-height: 320px; }
.hero__bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
}
.hero__shade {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.65) 70%, rgba(0,0,0,.85) 100%);
}
.hero__content {
  position: relative; z-index: 1;
  height: 100%;
  display: flex; align-items: flex-end; gap: 24px;
  padding-bottom: 24px;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,.5);
}
.hero__poster {
  width: 180px;
  flex-shrink: 0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
}
.hero__info { flex: 1; }
.hero__title {
  margin: 0 0 8px;
  font-weight: 800;
  font-size: clamp(20px, 4vw, 36px);
}
.hero__facts {
  list-style: none; padding: 0; margin: 0;
  display: flex; gap: 16px; opacity: .9;
  flex-wrap: wrap;
}
@media (max-width: 600px) {
  .hero__content { flex-direction: column; align-items: center; text-align: center; }
  .hero__poster { width: 140px; }
}

/* Player */
.player { padding: 24px 0; }
.player__wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}
.player__wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Info */
.info { list-style: none; padding: 0; margin: 0; display: grid; gap: 4px; }

/* Body */
.body { padding: 24px 0 40px; }
.grid {
  display: grid; gap: 16px;
  grid-template-columns: 1fr;
}
@media (min-width: 900px) {
  .grid { grid-template-columns: 2fr 1fr; }
}
.panel {
  background: #111b27;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
}
.panel--full { grid-column: 1 / -1; }
.panel__title { margin: 0 0 12px; font-size: 18px; }
.desc { white-space: pre-line; line-height: 1.6; }
</style>
