<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { fetchTMDBDetails } from '~/lib/api/tmdb'

const route = useRoute()
const router = useRouter()
const slug = computed(() => (route.params.slug as string) || '')
const [type, id] = slug.value.split('-') as ['movie' | 'tv', string]

const film = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

interface PlayerSource {
  id: string;
  name: string;
  url: string;
}
const sources = ref<PlayerSource[]>([])
const activeSourceId = ref<string>('')

useSeoMeta({
  title: computed(() => film.value ? `Смотреть ${film.value.title || film.value.name} онлайн - AniChrono` : 'Загрузка...'),
  description: computed(() => film.value ? `Смотреть ${film.value.title || film.value.name} онлайн в хорошем качестве.` : '')
})

onMounted(async () => {
  try {
    isLoading.value = true
    const res = await fetchTMDBDetails(id, type)
    if (!res) throw new Error('Фильм не найден')
    film.value = res

    const availableSources: PlayerSource[] = []
    
    // 1. Пытаемся получить Kodik (Аниме и некоторые сериалы/фильмы)
    if (res.external_ids?.imdb_id) {
      try {
        const k: any = await $fetch('/api/kodik/search', { params: { imdb_id: res.external_ids.imdb_id } })
        if (k?.results?.length > 0) {
          availableSources.push({
            id: 'kodik',
            name: 'Kodik (Основной)',
            url: k.results[0].link
          })
        }
      } catch (e) {
        console.error('Kodik fetch error', e)
      }
    }

    // 2. Добавляем запасные открытые балансеры, если есть IMDB ID
    if (res.external_ids?.imdb_id) {
      const imdbId = res.external_ids.imdb_id
      
      availableSources.push({
        id: 'dbgo',
        name: 'Резерв 1 (DBGO)',
        url: `https://dbgo.fun/imdb/${imdbId}`
      })

      availableSources.push({
        id: 'vidsrc',
        name: 'Резерв 2 (VidSrc)',
        url: `https://vidsrc.me/embed/${type}?imdb=${imdbId}`
      })

      availableSources.push({
        id: 'superembed',
        name: 'Резерв 3 (SuperEmbed)',
        url: `https://multiembed.mov/?video_id=${imdbId}&tmdb=${res.id}`
      })
    }

    if (availableSources.length > 0) {
      sources.value = availableSources
      activeSourceId.value = availableSources[0].id
    } else {
      error.value = 'По техническим причинам и лицензионным соображениям данный плеер недоступен.'
    }

  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
})

const activeSourceUrl = computed(() => {
  const source = sources.value.find(s => s.id === activeSourceId.value)
  return source ? source.url : null
})

const heroStyle = computed(() => {
  if (!film.value?.backdrop_path) return {}
  const bgUrl = `https://image.tmdb.org/t/p/original${film.value.backdrop_path}`
  return {
    backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 17, 0.4) 0%, rgba(15, 15, 17, 1) 100%), url(${bgUrl})`
  }
})

function goBack() {
  const currentType = route.query.type === 'tv' ? 'tv' : 'movie'
  router.push({
    path: `/movies/${route.params.slug}`,
    query: { type: currentType }
  })
}
</script>

<template>
  <div class="watch-page" :style="heroStyle">
    <div v-if="film" class="watch-page__container container">
      <nav class="breadcrumb-nav">
        <NuxtLink to="/" class="breadcrumb-item">Главная</NuxtLink>
        <NuxtLink to="/movies" class="breadcrumb-item">Фильмы</NuxtLink>
        <NuxtLink :to="`/movies/${slug}`" class="breadcrumb-item">{{ film.title || film.name }}</NuxtLink>
        <span class="breadcrumb-item breadcrumb-item--active">Просмотр</span>
      </nav>

      <header class="watch-header">
        <button class="back-btn" @click="goBack">
          <Icon name="solar:arrow-left-linear" size="24" />
          <span>К тайтлу</span>
        </button>
        
        <h1 class="title">
          Смотреть {{ film.title || film.name }}
          <span class="year" v-if="film.release_date || film.first_air_date">
            ({{ new Date(film.release_date || film.first_air_date).getFullYear() }})
          </span>
        </h1>
      </header>

      <div class="player-container">
        <!-- Вкладки плееров -->
        <div class="player-tabs" v-if="sources.length > 1">
          <button 
            v-for="source in sources" 
            :key="source.id"
            class="tab-btn"
            :class="{ active: activeSourceId === source.id }"
            @click="activeSourceId = source.id"
          >
            {{ source.name }}
          </button>
        </div>

        <div v-if="isLoading" class="player-loading">
          <Icon name="eos-icons:loading" size="48" class="loading-icon" />
          <span>Поиск источников видео...</span>
        </div>
        
        <div v-else-if="error" class="player-error">
          <Icon name="solar:danger-triangle-bold" size="48" class="error-icon" />
          <h3>Плеер недоступен</h3>
          <p>{{ error }}</p>
          <button class="retry-btn" @click="goBack">Вернуться назад</button>
        </div>

        <div v-else-if="activeSourceUrl" class="player-wrapper">
          <div class="player-aspect">
            <!-- Ключ key заставляет iframe перезагружаться при смене URL -->
            <iframe :key="activeSourceUrl" :src="activeSourceUrl" frameborder="0" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.watch-page {
  min-height: calc(100vh - var(--header-height));
  padding: 2rem 0;
  background-size: cover;
  background-position: center 20%;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;
  
  &__container {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
  }
}

.breadcrumb-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0 0 1.5rem 0;
  font-size: 0.9rem;

  .breadcrumb-item {
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: #fff; }
    &--active { color: #fff; font-weight: 700; }
  }
}

.watch-header {
  margin-bottom: 2rem;
  
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255,255,255,0.7);
    background: rgba(15, 15, 17, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1.5rem;
    
    &:hover {
      color: #fff;
      background: rgba(15, 15, 17, 0.8);
      transform: translateX(-5px);
    }
  }

  .title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    
    .year {
      color: rgba(255,255,255,0.7);
      font-weight: 400;
    }
  }
}

.player-container {
  width: 100%;
  background: #0f0f11;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);

  .player-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: #1a1a1c;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--accent) transparent;

    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--accent);
      border-radius: 10px;
    }

    .tab-btn {
      padding: 0.5rem 1rem;
      border: 1px solid rgba(255,255,255,0.1);
      background: transparent;
      color: rgba(255,255,255,0.6);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;

      &:hover {
        background: rgba(255,255,255,0.05);
        color: #fff;
      }

      &.active {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }
    }
  }

  .player-wrapper {
    width: 100%;
  }

  .player-aspect {
    aspect-ratio: 16/9;
    width: 100%;
    
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }

  .player-loading, .player-error {
    aspect-ratio: 16/9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: #888;
    text-align: center;
    padding: 2rem;

    .loading-icon {
      color: var(--accent);
    }
  }

  .player-error {
    .error-icon {
      color: #ff4d4d;
    }

    h3 {
      color: #fff;
      font-size: 1.5rem;
      margin: 0;
    }

    p {
      margin: 0 0 1rem;
      max-width: 400px;
      line-height: 1.5;
    }

    .retry-btn {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}

@media (max-width: 768px) {
  .watch-page {
    padding: 1rem 0;
  }
  
  .watch-header {
    .title {
      font-size: 1.5rem;
    }
  }
  
  .player-container {
    border-radius: 8px;
  }
}
</style>
