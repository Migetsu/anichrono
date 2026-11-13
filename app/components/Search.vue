<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { useDebounceFn, onClickOutside } from '@vueuse/core'
import { searchAnime } from '@/lib/api/searchAnime'
import { slugify } from '@/utils/slugify'
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import { useUIStore } from '@/stores/ui'
import AppIcon from '@/components/ui/AppIcon.vue'

const query = ref('')
const results = ref<ShikimoriAnimeListItem[]>([])
const uiStore = useUIStore()
const isLoading = ref(false)
const isOpen = ref(false)
const isSettled = ref(false)
const searchContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

onClickOutside(searchContainer, () => {
  isOpen.value = false
})

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})

const debouncedSearch = useDebounceFn(async (searchQuery: string) => {
  if (searchQuery.length < 2) {
    results.value = []
    isOpen.value = false
    isSettled.value = false
    return
  }

  isLoading.value = true
  try {
    const data = await searchAnime(searchQuery, 50)
    results.value = data
    isOpen.value = true
  } catch {
    results.value = []
    isOpen.value = true
  } finally {
    isLoading.value = false
    isSettled.value = true
  }
}, 300)

watch(query, (newQuery) => {
  if (newQuery.length < 2) isSettled.value = false
  debouncedSearch(newQuery)
})

function clearSearch() {
  query.value = ''
  results.value = []
  isOpen.value = false
  isSettled.value = false
  inputRef.value?.focus()
}

function selectResult() {
  clearSearch()
  uiStore.closeSearchModal()
  uiStore.closeMobileMenu()
}

function metaFor(item: ShikimoriAnimeListItem) {
  return [item.airedOn?.year, item.kind?.toUpperCase(), item.score ? item.score.toFixed(1) : null]
    .filter(Boolean)
    .join('  ·  ')
}
</script>

<template>
  <div ref="searchContainer" class="search">
    <div class="search__field" :class="{ 'search__field--open': isOpen }">
      <AppIcon class="search__icon" name="search" :size="18" />
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="search__input"
        placeholder="Название тайтла"
        autocomplete="off"
        @focus="isOpen = results.length > 0"
      >
      <button
        v-if="query"
        type="button"
        class="search__clear"
        title="Очистить"
        @click="clearSearch"
      >
        <AppIcon name="close" :size="16" />
        <span class="visually-hidden">Очистить</span>
      </button>
    </div>

    <Transition name="drop">
      <div v-if="isOpen" class="search__results">
        <p v-if="isLoading && !results.length" class="search__state">Ищем…</p>
        <p v-else-if="isSettled && !results.length" class="search__state">
          Ничего не нашлось. Попробуйте другое написание или оригинальное название.
        </p>
        <template v-else>
          <NuxtLink
            v-for="item in results"
            :key="item.id"
            :to="`/animes/${item.id}-${slugify(item.name)}`"
            class="search__row"
            @click="selectResult"
          >
            <img
              v-if="item.poster?.previewUrl || item.poster?.mainUrl || item.poster?.originalUrl"
              class="search__poster"
              :src="item.poster.previewUrl || item.poster.mainUrl || item.poster.originalUrl"
              :alt="''"
              loading="lazy"
            >
            <span v-else class="search__poster search__poster--empty"></span>
            <span class="search__body">
              <span class="search__title">{{ item.russian || item.name }}</span>
              <span class="search__meta tabular">{{ metaFor(item) }}</span>
            </span>
            <AppIcon class="search__go" name="arrow-up-right" :size="16" />
          </NuxtLink>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.search {
  position: relative;
  width: 100%;

  &__field {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 52px;
    padding-inline: 8px;
    margin-inline: -8px;
    border-bottom: 2px solid var(--rule-strong);
    transition: border-color var(--dur-fast) var(--ease),
      background-color var(--dur-fast) var(--ease);

    &--open,
    &:focus-within {
      border-color: var(--lapis);
      background: var(--lapis-tint);
    }
  }

  &__icon {
    color: var(--ink-3);
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    font-size: 17px;
    color: var(--ink);

    &::placeholder {
      color: var(--ink-3);
    }

    &:focus-visible {
      outline: none;
    }
  }

  &__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--ink-3);
    border-radius: 2px;

    &:hover {
      color: var(--ink);
      background: var(--paper-raised);
    }
  }

  &__results {
    margin-top: 8px;
    max-height: min(420px, 60vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    border-top: 1px solid var(--rule);
  }

  &__state {
    padding: 20px 2px;
    font-size: 14px;
    color: var(--ink-3);
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 2px;
    border-bottom: 1px solid var(--rule);
    transition: background-color var(--dur-fast) var(--ease);

    &:hover {
      background: var(--paper-raised);

      .search__title {
        color: var(--lapis-deep);
      }

      .search__go {
        color: var(--lapis);
      }
    }
  }

  &__poster {
    width: 40px;
    height: 56px;
    object-fit: cover;
    border-radius: 2px;
    flex: none;

    &--empty {
      background: var(--paper-sunk);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__title {
    font-size: 15px;
    font-weight: 500;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color var(--dur-fast) var(--ease);
  }

  &__meta {
    font-size: 12.5px;
    color: var(--ink-3);
  }

  &__go {
    margin-left: auto;
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);
  }
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity var(--dur-fast) var(--ease);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
}
</style>
