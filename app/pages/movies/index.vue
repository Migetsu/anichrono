<script lang="ts" setup>
import { useIntersectionObserver } from '@vueuse/core'
import { useFilmSearch } from '@/composables/useFilmSearch'
import FilmCard from '@/components/FilmCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const siteUrl = 'https://anichrono.vercel.app'

useSeoMeta({
  title: 'Фильмы и сериалы — AniChrono',
  ogTitle: 'Фильмы и сериалы — AniChrono',
  description: 'Каталог фильмов и сериалов на AniChrono: поиск по жанрам, годам и рейтингу, просмотр в плеере.',
  ogDescription: 'Каталог фильмов и сериалов на AniChrono: поиск по жанрам, годам и рейтингу, просмотр в плеере.',
  ogImage: `${siteUrl}/logo.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Фильмы и сериалы — AniChrono',
  twitterDescription: 'Каталог фильмов и сериалов на AniChrono',
  twitterImage: `${siteUrl}/logo.jpg`,
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
  resetFilters,
} = useFilmSearch()

const loadMoreTrigger = ref<HTMLElement | null>(null)
const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i))

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
  { rootMargin: '240px' },
)

const headingMeta = computed(() => {
  if (isLoading.value) return 'Загружаем'
  if (error.value) return 'Ошибка загрузки'
  return `${films.value.length}${hasMore.value ? '+' : ''} тайтлов`
})

const sortOptions = [
  { value: 'popularity.desc', label: 'Популярные' },
  { value: 'vote_average.desc', label: 'По рейтингу' },
  { value: 'primary_release_date.desc', label: 'Новинки' },
]
</script>

<template>
  <div class="movies">
    <div class="container">
      <header class="movies__head">
        <div class="movies__heading">
          <h1 class="movies__title">Фильмы и сериалы</h1>
          <span class="movies__meta tabular">{{ headingMeta }}</span>
        </div>

        <div class="movies__toolbar">
          <div class="movies__search">
            <AppIcon class="movies__search-icon" name="search" :size="18" />
            <input
              v-model="searchQuery"
              type="text"
              class="movies__search-input"
              placeholder="Название фильма или сериала"
              autocomplete="off"
            >
            <button v-if="searchQuery" type="button" class="movies__search-clear" title="Очистить" @click="searchQuery = ''">
              <AppIcon name="close" :size="16" />
            </button>
          </div>
        </div>

        <div class="movies__filters">
          <div class="movies__tabs" role="tablist">
            <button
              type="button"
              class="movies__tab"
              :class="{ 'movies__tab--active': type === 'movie' }"
              role="tab"
              :aria-selected="type === 'movie'"
              @click="type = 'movie'"
            >
              Фильмы
            </button>
            <button
              type="button"
              class="movies__tab"
              :class="{ 'movies__tab--active': type === 'tv' }"
              role="tab"
              :aria-selected="type === 'tv'"
              @click="type = 'tv'"
            >
              Сериалы
            </button>
          </div>

          <div class="movies__selects">
            <select v-model="filters.genre_id" class="movies__select" :disabled="!!searchQuery">
              <option value="">Все жанры</option>
              <option v-for="genre in currentGenres" :key="genre.id" :value="genre.id">{{ genre.name }}</option>
            </select>

            <select v-model="filters.year" class="movies__select" :disabled="!!searchQuery">
              <option value="">Все годы</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>

            <select v-model="filters.sort_by" class="movies__select" :disabled="!!searchQuery">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>

            <button
              v-if="activeFiltersCount"
              type="button"
              class="movies__reset"
              @click="resetFilters"
            >
              Сбросить
            </button>
          </div>
        </div>
      </header>

      <div v-if="isLoading" class="movies__grid">
        <span v-for="n in 12" :key="n" class="movies__skeleton"></span>
      </div>

      <div v-else-if="error" class="movies__state">
        <p class="movies__state-title">Каталог не загрузился</p>
        <p class="movies__state-text">{{ error }}</p>
        <button type="button" class="btn btn--outline" @click="loadFilms(true)">Попробовать снова</button>
      </div>

      <div v-else-if="!films.length" class="movies__state">
        <p class="movies__state-title">Ничего не найдено</p>
        <p class="movies__state-text">Измените запрос или снимите фильтры.</p>
      </div>

      <template v-else>
        <div class="movies__grid">
          <FilmCard v-for="film in films" :key="film.id" :item="film" :type="type" />
        </div>

        <div ref="loadMoreTrigger" class="movies__more">
          <span v-if="isLoadingMore" class="movies__more-text">Загружаем ещё</span>
          <span v-else-if="!hasMore" class="movies__more-text">Это все тайтлы по этим фильтрам</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.movies {
  padding-block: 28px 64px;

  @include respond(tablet) {
    padding-block: 40px 88px;
  }

  &__head {
    padding-bottom: 16px;
    border-bottom: 1px solid var(--rule-strong);
    margin-bottom: 24px;
  }

  &__heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  &__title {
    font-size: clamp(30px, 4vw, 44px);
  }

  &__meta {
    font-size: 13px;
    color: var(--ink-3);
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 48px;
    padding-inline: 8px;
    margin-inline: -8px;
    border-bottom: 2px solid var(--rule-strong);
    transition: border-color var(--dur-fast) var(--ease),
      background-color var(--dur-fast) var(--ease);

    &:focus-within {
      border-color: var(--lapis);
      background: var(--lapis-tint);
    }
  }

  &__search-icon {
    color: var(--ink-3);
  }

  &__search-input {
    flex: 1;
    min-width: 0;
    height: 100%;
    font-size: 16px;
    color: var(--ink);

    &::placeholder {
      color: var(--ink-3);
    }

    &:focus-visible {
      outline: none;
    }
  }

  &__search-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 2px;
    color: var(--ink-3);

    &:hover {
      color: var(--ink);
      background: var(--paper-raised);
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 18px;
  }

  &__tabs {
    display: flex;
    gap: 20px;
  }

  &__tab {
    position: relative;
    padding-bottom: 8px;
    font-size: 14px;
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);

    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      bottom: -1px;
      height: 2px;
      background: var(--lapis);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--dur) var(--ease);
    }

    &:hover {
      color: var(--ink-2);
    }

    &--active {
      color: var(--ink);

      &::after {
        transform: scaleX(1);
      }
    }
  }

  &__selects {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  }

  &__select {
    height: 36px;
    padding: 0 24px 0 0;
    background-color: transparent;
    background-image: linear-gradient(45deg, transparent 50%, var(--ink-3) 50%),
      linear-gradient(135deg, var(--ink-3) 50%, transparent 50%);
    background-position: calc(100% - 9px) 15px, calc(100% - 4px) 15px;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    border-bottom: 1px solid var(--rule-strong);
    border-radius: 0;
    font-size: 13.5px;
    color: var(--ink-2);
    appearance: none;
    cursor: pointer;

    &:hover {
      border-color: var(--ink-3);
    }

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }

    option {
      background: var(--paper-raised);
      color: var(--ink);
    }
  }

  &__reset {
    font-size: 13px;
    color: var(--ink-3);
    border-bottom: 1px solid transparent;
    transition: color var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--ink);
      border-bottom-color: currentColor;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 18px 10px;

    @include respond(tablet) {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 24px 14px;
    }

    @include respond(laptop) {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 28px 18px;
    }
  }

  &__skeleton {
    display: block;
    aspect-ratio: 2 / 3;
    background: var(--paper-sunk);
    border-radius: 2px;
    animation: skeleton-pulse 1600ms var(--ease) infinite;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-block: 40px;
    max-width: 48ch;
  }

  &__state-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
  }

  &__state-text {
    font-size: 14px;
    color: var(--ink-3);
  }

  &__more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 32px;
    min-height: 64px;
  }

  &__more-text {
    font-size: 12.5px;
    color: var(--ink-3);
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
