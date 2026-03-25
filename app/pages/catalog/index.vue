<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useSearch } from '@/composables/useSearch'
import FilterSidebar from '@/components/catalog/FilterSidebar.vue'
import AnimeCardSkeleton from '@/components/skeletons/AnimeCardSkeleton.vue'

useSeoMeta({
  title: 'Каталог аниме - AniChrono',
  ogTitle: 'Каталог аниме - AniChrono',
  description: 'Полный каталог аниме. Найдите любимые тайтлы по жанрам, годам и рейтингу.',
  ogDescription: 'Полный каталог аниме. Найдите любимые тайтлы по жанрам, годам и рейтингу.',
  ogImage: '/logo.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Каталог аниме - AniChrono',
  twitterDescription: 'Полный каталог аниме. Найдите любимые тайтлы по жанрам, годам и рейтингу.',
  twitterImage: '/logo.jpg'
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
    
    loadGenres,
    loadAnimes,
    handleLoadMore,
    resetFilters
} = useSearch()

const isFiltersOpen = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)

// Init
onMounted(async () => {
    // Check if data is already loaded (e.g. from SSR or navigation) or explicitly reload?
    // useSearch returns fresh state by default.
    await loadGenres()
    await loadAnimes(true)
})

// Scroll Observer
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

function openFilters() {
  isFiltersOpen.value = true
}
</script>

<template>
  <div class="catalog">
    <div class="container">
      <h1 class="catalog-title">Каталог аниме</h1>
      
      <!-- Search and Filter Bar -->
      <div class="catalog-toolbar">
        <div class="catalog-search">
          <Icon name="ic:round-search" class="catalog-search-icon" />
          <input 
            v-model="searchQuery"
            type="text"
            class="catalog-search-input"
            placeholder="Поиск по названию..."
          >
          <Icon 
            v-if="searchQuery" 
            name="fa6-solid:xmark" 
            class="catalog-search-clear"
            @click="() => { searchQuery = ''; loadAnimes(true) }"
          />
        </div>
        
        <button 
          class="catalog-filter-btn"
          type="button"
          @click="openFilters"
        >
          <Icon name="mdi:filter-variant" />
          <span>Фильтры</span>
          <span v-if="activeFiltersCount > 0" class="catalog-filter-badge">
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="catalog-grid">
        <AnimeCardSkeleton v-for="i in 12" :key="i" />
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="catalog-error">
        <Icon name="mdi:alert-circle" class="catalog-error-icon" />
        <p>{{ error }}</p>
        <button class="catalog-error-retry" @click="loadAnimes(true)">
          Попробовать снова
        </button>
      </div>
      
      <!-- Anime Grid -->
      <div v-else-if="animes.length > 0" class="catalog-grid">
        <TitleCard 
            v-for="anime in animes" 
            :key="anime.id" 
            :item="anime" 
        />
      </div>
      
      <!-- Empty State -->
      <div v-else class="catalog-empty">
        <Icon name="mdi:movie-search-outline" class="catalog-empty-icon" />
        <p>Ничего не найдено</p>
        <span>Попробуйте изменить параметры поиска</span>
      </div>
      
      <!-- Infinite Scroll Trigger -->
      <div 
        v-if="animes.length > 0 && hasMore" 
        ref="loadMoreTrigger" 
        class="catalog-load-more-trigger"
      ></div>
      
      <!-- Loading More Indicator -->
      <div v-if="isLoadingMore" class="catalog-loading-more">
        <Icon name="eos-icons:loading" class="catalog-loading-more-icon" />
        <span>Загрузка...</span>
      </div>
      
      <!-- End of Results -->
      <div v-if="animes.length > 0 && !hasMore && !isLoadingMore" class="catalog-end">
        <p>Все тайтлы загружены</p>
      </div>
    </div>
    
    <!-- Filter Sidebar -->
    <ClientOnly>
      <FilterSidebar
        v-model="filters"
        :is-open="isFiltersOpen"
        @update:is-open="(val) => { isFiltersOpen = val }"
        :genres="genres"
        @apply="() => loadAnimes(true)"
        @reset="resetFilters"
      />
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.catalog {
  padding: 40px 0 60px;
  min-height: 80vh;
  
  @include respond(tablet-l) {
    margin-top: 70px;
  }

  &-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 32px;
    text-align: center;
  }

  &-toolbar {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }

  &-search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface);
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid var(--border);
    transition: all 0.3s ease;

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

  &-filter-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: var(--surface2);
    border-radius: 12px;
    color: var(--text);
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid var(--border);

    svg {
      width: 22px;
      height: 22px;
    }

    &:hover {
      background: var(--surface3);
      border-color: var(--accent);
    }
  }

  &-filter-badge {
    background: var(--accent);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: 4px;
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @include respond(tablet) {
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    @include respond(tablet-l) {
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    @include respond(laptop) {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  &-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;

    &-icon {
      width: 80px;
      height: 80px;
      color: var(--muted);
      margin-bottom: 20px;
      opacity: 0.5;
    }

    p {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    span {
      font-size: 0.875rem;
      color: var(--muted);
    }
  }

  &-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;

    &-icon {
      width: 80px;
      height: 80px;
      color: var(--accent);
      margin-bottom: 20px;
    }

    p {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 20px;
    }

    &-retry {
      padding: 12px 24px;
      background: var(--accent);
      color: #fff;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--accent2);
        transform: translateY(-2px);
      }
    }
  }

  &-load-more-trigger {
    height: 1px;
    width: 100%;
    margin: 40px 0;
  }

  &-loading-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--muted);
    gap: 16px;

    &-icon {
      width: 32px;
      height: 32px;
      color: var(--accent);
      animation: spin 1s linear infinite;
    }
  }

  &-end {
    text-align: center;
    padding: 40px 20px;
    color: var(--muted);
    font-size: 0.875rem;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>