<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { fetchAnimeDetails } from '@/lib/api/animeDetails'
import type { ShikimoriAnimeFull } from '@/types/shikimori'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const slug = computed(() => (route.params.slug as string) || '')
const animeId = computed(() => slug.value.split('-')[0] || '')

const anime = ref<ShikimoriAnimeFull | null>(null)
const playerUrl = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

useSeoMeta({
  title: computed(() => anime.value ? `Смотреть ${anime.value.russian || anime.value.name} онлайн - AniChrono` : 'Загрузка...'),
  description: computed(() => anime.value ? `Смотреть аниме ${anime.value.russian || anime.value.name} онлайн в хорошем качестве.` : '')
})

onMounted(async () => {
  try {
    isLoading.value = true
    const d = await fetchAnimeDetails(animeId.value)
    if (!d) throw new Error('Аниме не найдено')
    anime.value = d
    
    const k: any = await $fetch('/api/kodik/search', { params: { shikimori_id: d.id } })
    if (k?.results?.length > 0) {
      playerUrl.value = k.results[0].link
    } else {
      error.value = 'Плеер временно недоступен'
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="watch-page">
    <div v-if="anime" class="container">
      <nav class="breadcrumb-nav">
        <NuxtLink to="/" class="breadcrumb-item">Главная</NuxtLink>
        <NuxtLink to="/catalog" class="breadcrumb-item">Каталог</NuxtLink>
        <NuxtLink :to="`/animes/${slug}`" class="breadcrumb-item">{{ anime.russian || anime.name }}</NuxtLink>
        <span class="breadcrumb-item breadcrumb-item--active">Просмотр</span>
      </nav>

      <header class="watch-header">
        <NuxtLink :to="`/animes/${slug}`" class="btn-back">
          <Icon name="solar:alt-arrow-left-linear" size="20" />
          <span>Назад к описанию</span>
        </NuxtLink>
        <h1 class="watch-title">{{ anime.russian || anime.name }}</h1>
      </header>

      <main class="watch-content">
        <div v-if="isLoading" class="watch-loading">
          <Icon name="eos-icons:loading" size="40" />
          <p>Загрузка плеера...</p>
        </div>
        
        <div v-else-if="error" class="watch-error">
          <Icon name="solar:danger-triangle-bold" size="40" />
          <p>{{ error }}</p>
        </div>

        <div v-else-if="playerUrl" class="player-wrapper">
          <div class="player-aspect">
            <iframe :src="playerUrl" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.watch-page {
  min-height: 100vh;
  padding-bottom: 5rem;
}

.breadcrumb-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.5rem 0;
  font-size: 0.9rem;

  .breadcrumb-item {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: #fff; }
    &--active { color: #fff; font-weight: 700; }
  }
}

.watch-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @include respond(tablet-l) {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #888;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  &:hover { color: #fff; }
}

.watch-title {
  font-size: 1.5rem;
  font-weight: 800;
  @include respond(tablet-l) { font-size: 2rem; }
}

.watch-content {
  border-radius: 16px;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-wrapper {
  width: 100%;
}

.player-aspect {
  aspect-ratio: 16/9;
  width: 100%;
  iframe { width: 100%; height: 100%; }
}

.watch-loading, .watch-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #666;
  text-align: center;
}

.watch-error { color: #ef5350; }
</style>
