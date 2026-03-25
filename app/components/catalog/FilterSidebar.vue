<script lang="ts" setup>
import type { CatalogFilters, Genre, AnimeStatus, AnimeKind, AnimeRating, AnimeOrder } from '@/types/catalog'
import { STATUS_OPTIONS, KIND_OPTIONS, RATING_OPTIONS, ORDER_OPTIONS, SCORE_OPTIONS } from '@/types/catalog'
import FilterOrder from '@/components/catalog/FilterOrder.vue'
import FilterGroup from '@/components/catalog/FilterGroup.vue'
import FilterGenres from '@/components/catalog/FilterGenres.vue'

const props = defineProps<{
  modelValue: CatalogFilters
  genres: Genre[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CatalogFilters): void
  (e: 'update:isOpen', value: boolean): void
  (e: 'apply'): void
  (e: 'reset'): void
}>()

const sidebarRef = ref<HTMLElement | null>(null)

// Local filter state
const localFilters = reactive<{
  status: AnimeStatus[]
  kind: AnimeKind[]
  rating: AnimeRating[]
  order: AnimeOrder
  score: number[]
  genre: number[]
}>({
  status: [],
  kind: [],
  rating: [],
  order: 'popularity',
  score: [],
  genre: []
})

// Sync with props
watch(() => props.modelValue, (val) => {
  localFilters.status = val.status ?? []
  localFilters.kind = val.kind ?? []
  localFilters.rating = val.rating ?? []
  localFilters.order = val.order ?? 'popularity'
  localFilters.score = val.score ? [val.score] : []
  localFilters.genre = val.genre ?? []
}, { immediate: true })



function close() {
  emit('update:isOpen', false)
}

function applyFilters() {
  const newFilters: CatalogFilters = {
    ...props.modelValue,
    status: localFilters.status.length > 0 ? localFilters.status : undefined,
    kind: localFilters.kind.length > 0 ? localFilters.kind : undefined,
    rating: localFilters.rating.length > 0 ? localFilters.rating : undefined,
    order: localFilters.order,
    score: localFilters.score.length > 0 ? localFilters.score[0] : undefined,
    genre: localFilters.genre.length > 0 ? localFilters.genre : undefined,
    page: 1 // Reset page on filter change
  }
  
  emit('update:modelValue', newFilters)
  emit('apply')
  close()
}

function resetFilters() {
  localFilters.status = []
  localFilters.kind = []
  localFilters.rating = []
  localFilters.order = 'popularity'
  localFilters.score = []
  localFilters.genre = []
  
  emit('reset')
}

const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.status.length > 0) count++
  if (localFilters.kind.length > 0) count++
  if (localFilters.rating.length > 0) count++
  if (localFilters.score.length > 0) count++
  if (localFilters.genre.length > 0) count++
  // Don't count 'popularity' as active filter since it's the default
  if (localFilters.order !== 'ranked' && localFilters.order !== 'popularity') count++
  return count
})
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="props.isOpen" 
      class="filter-sidebar" 
      :class="{ 'filter-sidebar--visible': props.isOpen }"
      @click.self="close"
    >
      <div class="filter-sidebar-panel" ref="sidebarRef">
          <div class="filter-sidebar-header">
            <h3>Фильтры</h3>
            <button class="filter-sidebar-close" @click="close">
              <Icon name="mdi:close" />
            </button>
          </div>
          
          <div class="filter-sidebar-content">
            <FilterOrder
              title="Сортировка"
              :options="ORDER_OPTIONS"
              v-model="localFilters.order"
            />
            
            <FilterGroup
              title="Статус"
              :options="STATUS_OPTIONS"
              v-model="localFilters.status"
            />
            
            <FilterGroup
              title="Тип"
              :options="KIND_OPTIONS"
              v-model="localFilters.kind"
            />
            
            <FilterGroup
              title="Оценка"
              :options="SCORE_OPTIONS"
              v-model="localFilters.score"
            />
            
            <FilterGroup
              title="Рейтинг"
              :options="RATING_OPTIONS"
              v-model="localFilters.rating"
            />
            
            <FilterGenres
              title="Жанры"
              :genres="genres"
              v-model="localFilters.genre"
            />
          </div>
          
          <div class="filter-sidebar-footer">
            <button 
              v-if="activeFiltersCount > 0"
              class="filter-sidebar-reset"
              @click="resetFilters"
            >
              Сбросить ({{ activeFiltersCount }})
            </button>
            <button 
              class="filter-sidebar-apply"
              @click="applyFilters"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.filter-sidebar {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  pointer-events: auto;

  &-panel {
    width: 100%;
    max-width: 380px;
    height: 100%;
    background: var(--surface2);
    display: flex;
    flex-direction: column;
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
    }
  }

  &-close {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: var(--muted);
    transition: all 0.2s ease;
    background: transparent;
    border: none;
    cursor: pointer;

    svg {
      width: 24px;
      height: 24px;
    }

    &:hover {
      background: rgba(var(--accent-rgb), 0.1);
      color: var(--accent);
    }
  }

  &-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 3px;
    }
  }

  &-footer {
    padding: 20px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    @include respond(mobile-l) {
      padding: 16px;
      gap: 8px;
    }
  }

  &-reset {
    flex: 1;
    min-width: 140px;
    padding: 12px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
  }

  &-apply {
    flex: 1;
    min-width: 140px;
    padding: 12px;
    border-radius: 10px;
    background: var(--accent);
    color: #fff;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;

    &:hover {
      background: var(--accent2);
      transform: translateY(-2px);
    }
  }
}

// Sidebar transition
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(100%);
}
</style>