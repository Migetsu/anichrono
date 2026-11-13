<script setup lang="ts">
import { useLatestStore } from '@/stores/latest'
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import { slugify } from '@/utils/slugify'
import AppIcon from '@/components/ui/AppIcon.vue'
import ListMenu from '@/components/list/ListMenu.vue'

const latestStore = useLatestStore()
const railRef = ref<HTMLElement | null>(null)

onMounted(() => {
  latestStore.loadLatest()
})

const items = computed(() => latestStore.latest)

const isLoading = computed(() => latestStore.loadingLatest && !items.value.length)

function posterOf(item: ShikimoriAnimeListItem): string {
  return item.poster?.mainUrl || item.poster?.preview2xUrl || item.poster?.originalUrl || ''
}

const kindLabels: Record<string, string> = {
  tv: 'ТВ-сериал',
  movie: 'Фильм',
  ova: 'OVA',
  ona: 'ONA',
  special: 'Спешл',
  tv_special: 'ТВ-спешл',
  music: 'Клип',
}

function metaOf(item: ShikimoriAnimeListItem) {
  return [
    item.kind ? kindLabels[item.kind] ?? item.kind.toUpperCase() : null,
    item.airedOn?.year ? String(item.airedOn.year) : null,
    Number(item.score) ? Number(item.score).toFixed(1) : null,
  ]
    .filter(Boolean)
    .join('  ·  ')
}

function scrollBy(direction: 1 | -1) {
  const rail = railRef.value
  if (!rail) return
  rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
  <section class="section season">
    <div class="container">
      <div class="section-head season__head">
        <h2 class="section-title">Сейчас выходят</h2>
        <div class="season__tools">
          <span v-if="items.length" class="section-meta">Онгоинги, {{ items.length }}</span>
          <div v-if="items.length > 2" class="season__arrows">
            <button type="button" class="season__arrow" title="Назад" @click="scrollBy(-1)">
              <AppIcon name="chevron-left" :size="18" />
              <span class="visually-hidden">Назад</span>
            </button>
            <button type="button" class="season__arrow" title="Вперёд" @click="scrollBy(1)">
              <AppIcon name="chevron-right" :size="18" />
              <span class="visually-hidden">Вперёд</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="season__rail">
        <div v-for="n in 5" :key="n" class="season-card season-card--skeleton" aria-hidden="true">
          <span class="season-card__frame skeleton-block"></span>
          <span class="skeleton-block skeleton-block--line"></span>
          <span class="skeleton-block skeleton-block--line skeleton-block--short"></span>
        </div>
      </div>

      <div v-else-if="!items.length" class="season__empty">
        Онгоинги не загрузились.
        <NuxtLink to="/catalog" class="link-quiet">Открыть каталог</NuxtLink>
      </div>

      <div v-else ref="railRef" class="season__rail">
        <article v-for="item in items" :key="item.id" class="season-card">
          <NuxtLink :to="`/animes/${item.id}-${slugify(item.name)}`" class="season-card__link">
            <span class="season-card__frame">
              <img
                v-if="posterOf(item)"
                :src="posterOf(item)"
                :alt="item.russian || item.name"
                class="season-card__image"
                loading="lazy"
              >
              <span v-else class="season-card__image season-card__image--empty"></span>
            </span>
            <span class="season-card__title">{{ item.russian || item.name }}</span>
            <span class="season-card__meta tabular">{{ metaOf(item) }}</span>
          </NuxtLink>
          <div class="season-card__list">
            <ListMenu :anime-id="Number(item.id)" />
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.season__head {
  margin-bottom: 20px;
}

.season__tools {
  display: flex;
  align-items: center;
  gap: 16px;
}

.season__arrows {
  display: flex;
  gap: 6px;
}

.season__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--rule-strong);
  border-radius: 2px;
  color: var(--ink-2);
  transition: color var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease);

  &:hover {
    color: var(--ink);
    border-color: var(--ink);
  }
}

.season__rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 148px;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @include respond(tablet) {
    grid-auto-columns: 176px;
    gap: 20px;
  }

  @include respond(laptop) {
    grid-auto-columns: 196px;
  }
}

.season-card {
  position: relative;
  display: flex;
  flex-direction: column;
  scroll-snap-align: start;

  &__link {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: var(--ink);
  }

  &__frame {
    position: relative;
    display: block;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background: var(--paper-sunk);
    border: 1px solid var(--rule);
    border-radius: 2px;
    transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
      transform var(--dur) var(--ease);
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;

    &--empty {
      display: block;
      background: var(--paper-sunk);
    }
  }

  &__title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.32;
    min-height: 2.64em;
    transition: color var(--dur-fast) var(--ease);
  }

  &__meta {
    font-size: 12px;
    color: var(--ink-3);
  }

  &__list {
    position: absolute;
    top: 6px;
    right: 6px;
    opacity: 0;
    transition: opacity var(--dur-fast) var(--ease);

    :deep(.list-menu__trigger) {
      background: var(--paper-raised);
      border-color: var(--rule-strong);
      color: var(--ink-2);
    }
  }

  &:hover &__frame,
  &:focus-within &__frame {
    border-color: var(--rule-strong);
    transform: translateY(-2px);
  }

  &:hover &__title {
    color: var(--lapis-deep);
  }

  &:hover &__list,
  &:focus-within &__list {
    opacity: 1;
  }

  // Touch screens have no hover state, so the bookmark must stay visible.
  @media (hover: none) {
    .season-card__list {
      opacity: 1;
    }
  }

  &--skeleton {
    gap: 10px;
  }
}

.season__empty {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-block: 12px 4px;
  font-size: 14px;
  color: var(--ink-3);
}

.skeleton-block {
  display: block;
  background: var(--paper-sunk);
  border-radius: 2px;
  animation: block-pulse 1600ms var(--ease) infinite;

  &--line {
    height: 13px;
    width: 100%;
  }

  &--short {
    width: 56%;
  }
}

.season-card--skeleton .season-card__frame {
  border: 0;
  height: auto;
}

@keyframes block-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.55;
  }
}
</style>
