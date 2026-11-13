<script lang="ts" setup>
import { useDebounceFn, useIntersectionObserver } from '@vueuse/core'
import { useSearch, ITEMS_PER_PAGE } from '@/composables/useSearch'
import { fetchCatalog, fetchGenres } from '@/lib/api/searchCatalog'
import FilterSidebar from '@/components/catalog/FilterSidebar.vue'
import AnimeCardSkeleton from '@/components/skeletons/AnimeCardSkeleton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const siteUrl = 'https://anichrono.vercel.app'

useSeoMeta({
  title: 'Каталог аниме — AniChrono',
  ogTitle: 'Каталог аниме — AniChrono',
  description: 'Полный каталог аниме на AniChrono. Ищите тайтлы по жанрам, году выхода, рейтингу и типу — TV, OVA, фильм, спешл.',
  ogDescription: 'Полный каталог аниме на AniChrono. Ищите тайтлы по жанрам, году выхода, рейтингу и типу — TV, OVA, фильм, спешл.',
  ogImage: `${siteUrl}/logo.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Каталог аниме — AniChrono',
  twitterDescription: 'Полный каталог аниме на AniChrono. Ищите тайтлы по жанрам, году выхода, рейтингу и типу — TV, OVA, фильм, спешл.',
  twitterImage: `${siteUrl}/logo.jpg`,
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/catalog` }],
})

const {
  filters,
  searchQuery,
  animes,
  genres,
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  activeFiltersCount,
  loadAnimes,
  handleLoadMore,
} = useSearch()

const isFiltersOpen = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)

// Server-rendered first page: crawlers and the first paint get real cards
// instead of an empty skeleton. Filters keep working client-side afterwards.
const { data: initial } = await useAsyncData('catalog-initial', async () => {
  const [genreList, page] = await Promise.all([
    fetchGenres().catch(() => []),
    fetchCatalog({ order: 'popularity', page: 1, limit: ITEMS_PER_PAGE }).catch(() => ({ items: [], rawCount: 0 })),
  ])
  return { genreList, page }
})

if (initial.value) {
  genres.value = initial.value.genreList
  animes.value = initial.value.page.items
  hasMore.value = initial.value.page.rawCount >= ITEMS_PER_PAGE
}

onMounted(() => {
  if (!animes.value.length) {
    loadAnimes(true)
  }
})

const applyFilters = useDebounceFn(() => {
  loadAnimes(true)
}, 350)

watch(filters, applyFilters, { deep: true })

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
  return `${animes.value.length}${hasMore.value ? '+' : ''} тайтлов`
})
</script>

<template>
  <div class="catalog">
    <div class="container">
      <header class="catalog__head">
        <div class="catalog__heading">
          <h1 class="catalog__title">Каталог</h1>
          <span class="catalog__meta tabular">{{ headingMeta }}</span>
        </div>

        <div class="catalog__toolbar">
          <div class="catalog__search">
            <AppIcon class="catalog__search-icon" name="search" :size="18" />
            <input
              v-model="searchQuery"
              type="text"
              class="catalog__search-input"
              placeholder="Название тайтла"
              autocomplete="off"
            >
            <button
              v-if="searchQuery"
              type="button"
              class="catalog__search-clear"
              title="Очистить"
              @click="searchQuery = ''"
            >
              <AppIcon name="close" :size="16" />
            </button>
          </div>

          <button type="button" class="catalog__filters-btn" @click="isFiltersOpen = true">
            <AppIcon name="menu" :size="16" />
            <span>Фильтры</span>
            <span v-if="activeFiltersCount" class="catalog__filters-count tabular">{{ activeFiltersCount }}</span>
          </button>
        </div>
      </header>

      <div class="catalog__layout">
        <FilterSidebar
          v-model="filters"
          class="catalog__filters"
          :genres="genres"
          :is-open="isFiltersOpen"
          @update:is-open="isFiltersOpen = $event"
        />

        <div class="catalog__results">
          <div v-if="isLoading" class="catalog__grid">
            <AnimeCardSkeleton v-for="i in 12" :key="i" />
          </div>

          <div v-else-if="error" class="catalog__state">
            <p class="catalog__state-title">Каталог не загрузился</p>
            <p class="catalog__state-text">{{ error }}</p>
            <button type="button" class="btn btn--outline" @click="loadAnimes(true)">Попробовать снова</button>
          </div>

          <div v-else-if="!animes.length" class="catalog__state">
            <p class="catalog__state-title">Ничего не найдено</p>
            <p class="catalog__state-text">Измените запрос или снимите часть фильтров.</p>
          </div>

          <template v-else>
            <div class="catalog__grid">
              <TitleCard v-for="anime in animes" :key="anime.id" :item="anime" />
            </div>

            <div ref="loadMoreTrigger" class="catalog__more">
              <span v-if="isLoadingMore" class="catalog__more-text">Загружаем ещё</span>
              <span v-else-if="!hasMore" class="catalog__more-text">Это все тайтлы по этим фильтрам</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.catalog {
  padding-block: 28px 64px;

  @include respond(tablet) {
    padding-block: 40px 80px;
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

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__search {
    display: flex;
    flex: 1;
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

  &__filters-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding-inline: 12px;
    border: 1px solid var(--rule-strong);
    border-radius: 2px;
    font-size: 13.5px;
    color: var(--ink);

    &:hover {
      border-color: var(--ink);
    }

    @include respond(laptop) {
      display: none;
    }
  }

  &__filters-count {
    padding: 1px 5px;
    background: var(--lapis);
    border-radius: 2px;
    color: var(--paper);
    font-size: 11px;
  }

  &__layout {
    display: block;

    @include respond(laptop) {
      display: grid;
      grid-template-columns: 232px minmax(0, 1fr);
      gap: 48px;
      align-items: start;
    }
  }

  &__filters {
    @include respond(laptop) {
      position: sticky;
      top: calc(var(--masthead-h) + 24px);
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
    line-height: 1.1;
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
</style>
