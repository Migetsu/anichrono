import { ref, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { fetchTMDBGenres, fetchTMDBDiscover, searchTMDB } from '@/lib/api/tmdb'
import type { TMDBGenre } from '@/types/tmdb'

export function useFilmSearch() {
  const type = ref<'movie' | 'tv'>('movie')
  const searchQuery = ref('')
  const genres = ref<{ movie: TMDBGenre[], tv: TMDBGenre[] }>({ movie: [], tv: [] })
  const films = ref<any[]>([])
  
  const filters = ref({
    genre_id: '',
    year: '',
    sort_by: 'popularity.desc',
    page: 1
  })

  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)

  async function loadGenres() {
    try {
      const res = await fetchTMDBGenres()
      genres.value = res
    } catch (e) {
      console.warn('Failed to load TMDB genres', e)
    }
  }

  async function loadFilms(reset = true) {
    if (reset) {
      isLoading.value = true
      films.value = []
      filters.value.page = 1
      hasMore.value = true
      error.value = null
    } else {
      if (isLoading.value || isLoadingMore.value || !hasMore.value) return
      isLoadingMore.value = true
    }

    try {
      let res: any
      const searchParam = searchQuery.value?.trim()

      if (searchParam && searchParam.length >= 2) {
        res = await searchTMDB(searchParam, type.value, filters.value.page)
      } else {
        res = await fetchTMDBDiscover({
          type: type.value,
          page: filters.value.page,
          genre_id: filters.value.genre_id,
          year: filters.value.year,
          sort_by: filters.value.sort_by
        })
      }

      if (reset) {
        films.value = res.results
      } else {
        films.value = [...films.value, ...res.results]
      }

      if (res.page >= res.total_pages) {
        hasMore.value = false
      }
    } catch (e: any) {
      console.error('Failed to load TMDB films:', e)
      if (reset) error.value = e.message || 'Ошибка загрузки'
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  function handleLoadMore() {
    if (hasMore.value) {
      filters.value.page++
      loadFilms(false)
    }
  }

  function resetFilters() {
    filters.value = {
      genre_id: '',
      year: '',
      sort_by: 'popularity.desc',
      page: 1
    }
    searchQuery.value = ''
    loadFilms(true)
  }

  // Watchers
  watch(type, () => loadFilms(true))
  
  const debouncedSearch = useDebounceFn(() => {
    loadFilms(true)
  }, 500)

  watch(searchQuery, (newVal, oldVal) => {
    if (newVal !== oldVal) debouncedSearch()
  })

  watch(
    () => [filters.value.genre_id, filters.value.year, filters.value.sort_by],
    () => {
      loadFilms(true)
    }
  )

  const currentGenres = computed(() => {
    return type.value === 'movie' ? genres.value.movie : genres.value.tv
  })

  return {
    type,
    searchQuery,
    films,
    genres,
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
  }
}
