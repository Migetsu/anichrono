<script lang="ts" setup>
import type { CatalogFilters, Genre, AnimeStatus, AnimeKind, AnimeRating, AnimeOrder } from '@/types/catalog'
import { STATUS_OPTIONS, KIND_OPTIONS, RATING_OPTIONS, ORDER_OPTIONS, SCORE_OPTIONS } from '@/types/catalog'
import FilterOrder from '@/components/catalog/FilterOrder.vue'
import FilterGroup from '@/components/catalog/FilterGroup.vue'
import FilterGenres from '@/components/catalog/FilterGenres.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{
  modelValue: CatalogFilters
  genres: Genre[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CatalogFilters): void
  (e: 'update:isOpen', value: boolean): void
}>()

const local = reactive<{
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
  genre: [],
})

let syncing = false

watch(() => props.modelValue, (value) => {
  syncing = true
  local.status = value.status ?? []
  local.kind = value.kind ?? []
  local.rating = value.rating ?? []
  local.order = value.order ?? 'popularity'
  local.score = value.score ? [value.score] : []
  local.genre = value.genre ?? []
  nextTick(() => {
    syncing = false
  })
}, { immediate: true })

watch(local, () => {
  if (syncing) return
  emit('update:modelValue', {
    ...props.modelValue,
    status: local.status.length ? [...local.status] : undefined,
    kind: local.kind.length ? [...local.kind] : undefined,
    rating: local.rating.length ? [...local.rating] : undefined,
    order: local.order,
    score: local.score.length ? local.score[0] : undefined,
    genre: local.genre.length ? [...local.genre] : undefined,
    page: 1,
  })
}, { deep: true })

const activeCount = computed(() => {
  let count = 0
  if (local.status.length) count++
  if (local.kind.length) count++
  if (local.rating.length) count++
  if (local.score.length) count++
  if (local.genre.length) count++
  if (local.order !== 'ranked' && local.order !== 'popularity') count++
  return count
})

function close() {
  emit('update:isOpen', false)
}

function reset() {
  syncing = false
  local.status = []
  local.kind = []
  local.rating = []
  local.order = 'popularity'
  local.score = []
  local.genre = []
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="filters" :class="{ 'filters--open': props.isOpen }">
    <div class="filters__veil" @click="close" />

    <aside class="filters__panel" aria-label="Фильтры каталога">
      <div class="filters__head">
        <h2 class="filters__title">Фильтры</h2>
        <button type="button" class="icon-btn filters__close" title="Закрыть" @click="close">
          <AppIcon name="close" :size="19" />
          <span class="visually-hidden">Закрыть</span>
        </button>
      </div>

      <div class="filters__body">
        <FilterOrder v-model="local.order" title="Сортировка" :options="ORDER_OPTIONS" />
        <FilterGroup v-model="local.status" title="Статус" :options="STATUS_OPTIONS" />
        <FilterGroup v-model="local.kind" title="Тип" :options="KIND_OPTIONS" />
        <FilterGroup v-model="local.score" title="Оценка" :options="SCORE_OPTIONS" />
        <FilterGroup v-model="local.rating" title="Возрастной рейтинг" :options="RATING_OPTIONS" />
        <FilterGenres v-model="local.genre" title="Жанры" :genres="props.genres" />
      </div>

      <div class="filters__foot">
        <button type="button" class="filters__reset" :disabled="!activeCount" @click="reset">
          Сбросить{{ activeCount ? ` (${activeCount})` : '' }}
        </button>
        <button type="button" class="btn btn--primary filters__done" @click="close">
          Готово
        </button>
      </div>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.filters {
  &__veil {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.72);
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--dur) var(--ease);
  }

  &__panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 201;
    display: flex;
    flex-direction: column;
    width: min(360px, 90vw);
    background: var(--paper-raised);
    border-left: 1px solid var(--rule-strong);
    transform: translateX(100%);
    transition: transform var(--dur) var(--ease);
  }

  &--open &__veil {
    opacity: 1;
    visibility: visible;
  }

  &--open &__panel {
    transform: translateX(0);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px var(--gutter);
    border-bottom: 1px solid var(--rule-strong);
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 18px var(--gutter) 24px;
    overscroll-behavior: contain;
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px var(--gutter) calc(14px + env(safe-area-inset-bottom, 0));
    border-top: 1px solid var(--rule-strong);
  }

  &__reset {
    flex: 1;
    height: 44px;
    border: 1px solid var(--rule-strong);
    border-radius: 2px;
    font-size: 14px;
    color: var(--ink-2);
    transition: color var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease),
      opacity var(--dur-fast) var(--ease);

    &:hover:not(:disabled) {
      color: var(--ink);
      border-color: var(--ink-3);
    }

    &:disabled {
      opacity: 0.45;
      cursor: default;
    }
  }

  &__done {
    flex: 1;
  }

  @include respond(laptop) {
    &__veil,
    &__close,
    &__foot,
    &__head {
      display: none;
    }

    &__panel {
      position: static;
      width: 100%;
      max-height: calc(100dvh - var(--masthead-h) - 40px);
      overflow-y: auto;
      overscroll-behavior: contain;
      padding-right: 6px;
      transform: none;
      background: transparent;
      border: 0;
      transition: none;
    }

    &__body {
      overflow: visible;
      padding: 0;
    }
  }
}
</style>
