<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { fetchTMDBDetails, getTMDBImageUrl } from '@/lib/api/tmdb'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || '')
const [type, id] = slug.value.split('-') as ['movie' | 'tv', string]

const film = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const playerUrl = ref<string | null>(null)

useSeoMeta({
  title: computed(() => film.value ? `${film.value.title || film.value.name} - AniChrono` : 'Загрузка...'),
  ogTitle: computed(() => film.value ? `${film.value.title || film.value.name} - AniChrono` : 'Загрузка...'),
  description: computed(() => film.value ? film.value.overview : 'Смотрите фильмы и сериалы на AniChrono'),
  ogDescription: computed(() => film.value ? film.value.overview : 'Смотрите фильмы и сериалы на AniChrono'),
  ogImage: computed(() => film.value?.poster_path ? getTMDBImageUrl(film.value.poster_path, 'w500') : '/logo.jpg'),
  twitterCard: 'summary_large_image',
  twitterTitle: computed(() => film.value ? `${film.value.title || film.value.name} - AniChrono` : 'Загрузка...'),
  twitterDescription: computed(() => film.value ? film.value.overview : 'Смотрите фильмы и сериалы на AniChrono'),
  twitterImage: computed(() => film.value?.poster_path ? getTMDBImageUrl(film.value.poster_path, 'w500') : '/logo.jpg')
})

onMounted(async () => {
  try {
    isLoading.value = true
    const res = await fetchTMDBDetails(id, type)
    if (!res) throw new Error('Фильм не найден')
    film.value = res

  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="film-details">
    <div v-if="film" class="container">
      <nav class="breadcrumb-nav">
        <NuxtLink to="/" class="breadcrumb-item">Главная</NuxtLink>
        <NuxtLink to="/movies" class="breadcrumb-item">Фильмы</NuxtLink>
        <span class="breadcrumb-item breadcrumb-item--active">{{ film.title || film.name }}</span>
      </nav>

      <div class="film-hero">
        <div class="film-hero__poster">
          <img :src="getTMDBImageUrl(film.poster_path, 'original')" :alt="film.title || film.name">
        </div>

        <div class="film-hero__content">
          <h1 class="film-hero__title">{{ film.title || film.name }}</h1>
          <p class="film-hero__original">{{ film.original_title || film.original_name }}</p>

          <div class="film-hero__badges">
            <span class="badge" v-if="film.vote_average">{{ film.vote_average.toFixed(1) }} TMDB</span>
            <span class="badge">{{ type === 'movie' ? 'Фильм' : 'Сериал' }}</span>
            <span class="badge" v-if="film.release_date || film.first_air_date">
              {{ new Date(film.release_date || film.first_air_date).getFullYear() }}
            </span>
          </div>

          <div class="film-hero__meta">
            <div class="meta-line">
              <span class="label">Жанры:</span>
              <span class="val">{{ film.genres?.map((g: any) => g.name).join(' • ') }}</span>
            </div>
            <div class="meta-line" v-if="film.runtime">
              <span class="label">Длительность:</span>
              <span class="val">{{ film.runtime }} мин</span>
            </div>
            <div class="meta-line" v-if="film.number_of_seasons">
              <span class="label">Сезонов:</span>
              <span class="val">{{ film.number_of_seasons }}</span>
            </div>
            <div class="meta-line" v-if="film.status">
              <span class="label">Статус:</span>
              <span class="val">{{ film.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <section class="film-description">
        <h2 class="section-title">Описание</h2>
        <p class="film-description__text">{{ film.overview || 'Описание отсутствует' }}</p>
      </section>
    </div>

    <div v-else-if="isLoading" class="film-loading">
        <Icon name="eos-icons:loading" size="40" />
        <p>Загрузка данных...</p>
    </div>

    <div v-else-if="error" class="film-error">
        <Icon name="solar:danger-triangle-bold" size="40" />
        <p>{{ error }}</p>
        <NuxtLink to="/movies" class="btn-back">Вернуться в каталог</NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.film-details {
  padding-bottom: 5rem;
  margin-top: 70px;
}

.breadcrumb-nav {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 0;
  font-size: 0.9rem;
  .breadcrumb-item {
    color: #666;
    text-decoration: none;
    &:hover { color: #fff; }
    &--active { color: #fff; font-weight: 700; }
  }
}

.film-hero {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-bottom: 4rem;

  @include respond(tablet-l) {
    flex-direction: row;
    align-items: flex-start;
  }

  &__poster {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    border-radius: 20px;
    overflow: hidden;
    @include respond(tablet-l) { margin: 0; }
    
    img { width: 100%; display: block; aspect-ratio: 2/3; object-fit: cover; }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    @include respond(tablet-l) { font-size: 3.5rem; }
  }

  &__original {
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 2rem;
  }

  &__badges {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;

    .badge {
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #aaa;
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-bottom: 3rem;

    .meta-line {
      display: flex;
      gap: 1rem;
      .label { color: #444; width: 140px; flex-shrink: 0; }
      .val { color: #fff; font-weight: 600; }
    }
  }

  &__actions {
    .btn-watch {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 32px;
      background: #fff;
      color: #000;
      border-radius: 12px;
      border: none;
      font-weight: 800;
      font-size: 1.1rem;
      cursor: pointer;
      transition: transform 0.2s;
      &:hover { transform: scale(1.02); }
    }
    .no-player { color: #555; font-style: italic; }
  }
}

.section-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    font-weight: 800;
}

.film-description {
    &__text {
        font-size: 1.1rem;
        line-height: 1.8;
        color: #999;
        max-width: 900px;
    }
}

.film-loading, .film-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10rem 0;
    gap: 1rem;
    color: #444;
}

.btn-back {
    margin-top: 1rem;
    color: var(--accent);
    text-decoration: none;
}
</style>
