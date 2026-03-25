<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useFilmSearch } from '@/composables/useFilmSearch'
import FilmCard from '@/components/FilmCard.vue'

useSeoMeta({
  title: 'Кино и Сериалы - AniChrono',
  ogTitle: 'Кино и Сериалы - AniChrono',
  description: 'Каталог фильмов и сериалов. Смотрите лучшие новинки кино в хорошем качестве.',
  ogDescription: 'Каталог фильмов и сериалов. Смотрите лучшие новинки кино в хорошем качестве.',
  ogImage: '/logo.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Кино и Сериалы - AniChrono',
  twitterDescription: 'Каталог фильмов и сериалов. Смотрите лучшие новинки кино в хорошем качестве.',
  twitterImage: '/logo.jpg'
})

const {
  type,
  searchQuery,
  films,
  currentGenres,
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  filters,
  loadGenres,
  loadFilms,
  handleLoadMore,
  resetFilters
} = useFilmSearch()

const loadMoreTrigger = ref<HTMLElement | null>(null)
const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i))

const isFiltersOpen = ref(false)

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.genre_id) count++
  if (filters.value.year) count++
  if (filters.value.sort_by !== 'popularity.desc') count++
  return count
})

onMounted(async () => {
  await loadGenres()
  await loadFilms(true)
})

useIntersectionObserver(
  loadMoreTrigger,
  (entries) => {
    const entry = entries[0]
    if (entry?.isIntersecting && hasMore.value && !isLoading.value && !isLoadingMore.value) {
      handleLoadMore()
    }
  },
  { rootMargin: '100px' }
)
</script>

<template>
  <div class="movies-page">
    <div class="container">
      <header class="movies-page__header">
        <h1 class="movies-page__title">Кино и Сериалы</h1>
        
        <div class="movies-page__tabs">
          <button 
            class="tab-btn" 
            :class="{ active: type === 'movie' }"
            @click="type = 'movie'"
          >Фильмы</button>
          <button 
            class="tab-btn" 
            :class="{ active: type === 'tv' }"
            @click="type = 'tv'"
          >Сериалы</button>
        </div>
      </header>

      <div class="licensing-warning">
        <Icon name="solar:info-circle-bold" size="24" class="warning-icon" />
        <div class="warning-text">
          <p>Функция просмотра фильмов и сериалов временно недоступна по техническим причинам (отсутствие видеоплеера). Раздел работает в режиме информационной базы.</p>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="catalog-toolbar">
        <div class="catalog-search">
          <Icon name="ic:round-search" class="catalog-search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск по названию..."
            class="catalog-search-input"
          >
          <Icon 
            v-if="searchQuery" 
            name="fa6-solid:xmark" 
            class="catalog-search-clear"
            @click="searchQuery = ''"
          />
        </div>

        <button 
          class="catalog-filter-btn"
          type="button"
          @click="isFiltersOpen = !isFiltersOpen"
        >
          <Icon name="mdi:filter-variant" />
          <span class="desktop-only">Фильтры</span>
          <span v-if="activeFiltersCount > 0" class="catalog-filter-badge">
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>

      <div class="filters-panel" v-show="isFiltersOpen">
        <div class="filters-row">
          <div class="filter-item">
            <select v-model="filters.genre_id" :disabled="!!searchQuery">
              <option value="">Все жанры</option>
              <option v-for="g in currentGenres" :key="g.id" :value="g.id">
                {{ g.name }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <select v-model="filters.year" :disabled="!!searchQuery">
              <option value="">Все годы</option>
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <div class="filter-item">
            <select v-model="filters.sort_by" :disabled="!!searchQuery">
              <option value="popularity.desc">Популярные</option>
              <option value="vote_average.desc">Рейтинговые</option>
              <option value="primary_release_date.desc">Новинки</option>
            </select>
          </div>

          <button class="btn-reset" @click="resetFilters">
            <Icon name="solar:restart-linear" size="18" />
            <span>Сбросить</span>
          </button>
        </div>
      </div>

      <!-- Grid -->
      <div v-if="isLoading" class="movies-grid">
        <div v-for="i in 10" :key="i" class="skeleton-card"></div>
      </div>

      <div v-else-if="error" class="movies-error">
        <Icon name="solar:danger-triangle-bold" size="40" />
        <p>{{ error }}</p>
        <button class="btn-retry" @click="loadFilms(true)">Попробовать снова</button>
      </div>

      <div v-else-if="films.length > 0">
        <div class="movies-grid">
          <FilmCard 
            v-for="film in films" 
            :key="film.id" 
            :item="film" 
            :type="type"
          />
        </div>

        <div v-if="hasMore" ref="loadMoreTrigger" class="load-more">
          <Icon v-if="isLoadingMore" name="eos-icons:loading" size="30" />
        </div>
      </div>

      <div v-else class="movies-empty">
        <Icon name="solar:clapperboard-play-linear" size="40" />
        <p>Ничего не найдено</p>
        <span v-if="searchQuery">Попробуйте изменить поисковый запрос</span>
        <span v-else>Попробуйте изменить фильтры</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.movies-page {
  padding-bottom: 5rem;
  margin-top: 70px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 3rem;
    align-items: center;

    @include respond(tablet-l) {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  &__title {
    font-size: 2.5rem;
    font-weight: 800;
  }

  &__tabs {
    display: flex;
    background: var(--surface);
    padding: 4px;
    border-radius: 12px;
    border: 1px solid var(--border);

    .tab-btn {
      padding: 10px 24px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: #777;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: var(--surface2);
        color: #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
    }
  }
}

.licensing-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(var(--accent-rgb), 0.1);
  border: 1px solid rgba(var(--accent-rgb), 0.3);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;

  .warning-icon {
    color: var(--accent);
    flex-shrink: 0;
  }

  .warning-text {
    p {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 500;
      line-height: 1.5;
    }
  }
}

.catalog-toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.catalog-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid var(--border);
  transition: all 0.3s ease;
  min-width: 250px;

  &:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.2);
  }

  &-icon {
    width: 22px;
    height: 22px;
    color: var(--muted);
    flex-shrink: 0;
  }

  &-input {
    flex: 1;
    background: transparent;
    color: var(--text);
    font-size: 1rem;
    border: none;
    outline: none;
    min-width: 0;

    &::placeholder {
      color: var(--muted);
    }
  }

  &-clear {
    width: 20px;
    height: 20px;
    color: var(--muted);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--accent);
    }
  }
}

.catalog-filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--surface2);
  border-radius: 12px;
  color: var(--text);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid var(--border);
  min-width: 50px;
  cursor: pointer;

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover {
    background: var(--surface3);
    border-color: var(--accent);
  }
}

.catalog-filter-badge {
  background: var(--accent);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 4px;
}

.filters-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.filters-row {
  display: flex;
  flex-direction: column;
  gap: 16px;

  @include respond(tablet) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;
    
    select {
      width: 100%;
      background: var(--surface2);
      border: 1px solid var(--border);
      color: #fff;
      padding: 0 16px;
      height: 48px;
      border-radius: 10px;
      outline: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;

      &:disabled { opacity: 0.3; cursor: not-allowed; }
      &:focus { border-color: var(--accent); }
    }
  }

  .btn-reset {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 24px;
    height: 48px;
    background: rgba(244, 63, 94, 0.1);
    border: 1px solid rgba(244, 63, 94, 0.2);
    color: #f43f5e;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;

    @include respond(tablet) {
      width: auto;
      flex: 0 0 auto;
    }

    &:hover { 
      background: rgba(244, 63, 94, 0.2); 
      border-color: rgba(244, 63, 94, 0.3); 
    }
  }
}

.desktop-only {
  display: none;
  @include respond(mobile-l) { display: inline; }
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @include respond(mobile-l) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  @include respond(tablet) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }

  @include respond(laptop) {
    grid-template-columns: repeat(5, 1fr);
  }
}

.skeleton-card {
  aspect-ratio: 2/3.5;
  background: var(--surface);
  border-radius: 16px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 0.8; }
  100% { opacity: 0.5; }
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
  color: var(--accent);
}

.movies-error, .movies-empty {
  text-align: center;
  padding: 5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #444;

  p { font-size: 1.25rem; font-weight: 700; color: #777; }
  span { font-size: 0.9rem; color: #555; }
}

.btn-retry {
  margin-top: 1rem;
  padding: 12px 24px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}
</style>
