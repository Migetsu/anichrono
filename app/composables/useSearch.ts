import { ref, watch, computed } from 'vue'
import { useDebounceFn, useIntersectionObserver } from '@vueuse/core'
import { fetchCatalog, fetchGenres } from '@/lib/api/searchCatalog'
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import type { CatalogFilters, Genre } from '@/types/catalog'

export const ITEMS_PER_PAGE = 20

// State can be global if we want to persist search results when navigating away and back.
// For now, let's keep it local to the composable instance (fresh search on mount) 
// or maybe global if `useSearch` is used in multiple places? 
// Usually catalog state is page-specific. Let's make it a factory function.

export function useSearch() {
  // State
  const filters = ref<CatalogFilters>({
    order: 'popularity',
    page: 1,
    limit: ITEMS_PER_PAGE
  })
  
  const searchQuery = ref('')
  const animes = ref<ShikimoriAnimeListItem[]>([])
  const genres = ref<Genre[]>([])
  
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  
  // Actions
  async function loadGenres() {
      try {
          const res = await fetchGenres()
          genres.value = res || []
      } catch (e) {
          console.warn('Failed to load genres', e)
          genres.value = []
      }
  }

  async function loadAnimes(reset = true) {
      if (reset) {
          isLoading.value = true
          animes.value = []
          filters.value.page = 1
          hasMore.value = true
          error.value = null
      } else {
          if (isLoading.value || isLoadingMore.value || !hasMore.value) return
          isLoadingMore.value = true
      }

      try {
          const searchParam = searchQuery.value?.trim()
          const currentFilters: CatalogFilters = {
              ...filters.value,
              limit: ITEMS_PER_PAGE,
              ...(searchParam && searchParam.length >= 2 ? { search: searchParam } : {})
          }

          const result = await fetchCatalog(currentFilters)

          if (!result) throw new Error('No data received')

          if (reset) {
              animes.value = result
          } else {
              animes.value = [...animes.value, ...result]
          }

          if (result.length < ITEMS_PER_PAGE) {
              hasMore.value = false
          }
      } catch (e: any) {
          console.error('Failed to load catalog:', e)
          if (reset) error.value = e.message || 'Ошибка загрузки'
      } finally {
          isLoading.value = false
          isLoadingMore.value = false
      }
  }

  function handleLoadMore() {
      if (hasMore.value) {
          filters.value.page = (filters.value.page || 1) + 1
          loadAnimes(false)
      }
  }

  function resetFilters() {
      filters.value = {
          order: 'popularity',
          page: 1,
          limit: ITEMS_PER_PAGE
      }
      searchQuery.value = ''
      loadAnimes(true)
  }

  // Watchers
  const debouncedSearch = useDebounceFn(() => {
      loadAnimes(true)
  }, 400)

  watch(searchQuery, (newVal, oldVal) => {
      if (newVal !== oldVal) debouncedSearch()
  })

  // Computed
  const activeFiltersCount = computed(() => {
      let count = 0
      if (filters.value.status?.length) count++
      if (filters.value.kind?.length) count++
      if (filters.value.rating?.length) count++
      if (filters.value.score) count++
      if (filters.value.season) count++
      if (filters.value.genre?.length) count++
      if (filters.value.order && filters.value.order !== 'ranked' && filters.value.order !== 'popularity') count++
      return count
  })

  return {
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
  }
}
