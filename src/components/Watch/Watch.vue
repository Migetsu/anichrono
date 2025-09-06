<template>
  <main class="watch">
    <section class="container" v-if="anime && trailerUrl">
      <h1 class="watch__title">{{ anime.russian || anime.name }}</h1>
      <div class="player__wrapper">
        <iframe
          :src="trailerUrl"
          :title="anime.russian || anime.name"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </section>

    <section class="container state">
      <div v-if="loading" class="loader">Загрузка…</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!trailerUrl" class="error">Трейлер недоступен</div>
    </section>
  </main>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchAnimeById } from '@/scripts/fetchAnimeById'

const route = useRoute()
const anime = ref(null)
const loading = ref(true)
const error = ref('')

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

const trailerUrl = computed(() => {
  const video = anime.value?.videos?.[0]
  return video?.playerUrl || video?.url || ''
})

watch(
  () => route.params.id,
  id => { if (id != null) load(Number(id)) },
  { immediate: true }
)
</script>

<style scoped>
.watch {
  margin-top: 80px;
  color: #fff;
}

.watch__title {
  margin: 0 0 16px;
  font-size: 26px;
  font-weight: 700;
  text-align: center;
}

.player__wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(0, 0, 0, .35);
  border: 1px solid rgba(255, 255, 255, .08);
}

.player__wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.state {
  padding: 20px 0;
}

.error {
  color: #ff6b6b;
  text-align: center;
}

.loader {
  width: 100%;
  padding: 14px;
  text-align: center;
  color: #a9b3c3;
  border-radius: 10px;
  background: rgba(255, 255, 255, .04);
  border: 1px dashed rgba(255, 255, 255, .08);
}
</style>
