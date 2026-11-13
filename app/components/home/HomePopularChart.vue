<script setup lang="ts">
import { usePopularStore } from '@/stores/popular'
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import { slugify } from '@/utils/slugify'
import ListMenu from '@/components/list/ListMenu.vue'

const popularStore = usePopularStore()

onMounted(() => {
  popularStore.loadPopular()
})

const items = computed(() => popularStore.popular)
const isLoading = computed(() => popularStore.loadingPopular && !items.value.length)

const kindLabels: Record<string, string> = {
  tv: 'ТВ-сериал',
  movie: 'Фильм',
  ova: 'OVA',
  ona: 'ONA',
  special: 'Спешл',
  tv_special: 'ТВ-спешл',
  music: 'Клип',
}

function posterOf(item: ShikimoriAnimeListItem): string {
  return item.poster?.previewUrl || item.poster?.mainUrl || item.poster?.originalUrl || ''
}

function subOf(item: ShikimoriAnimeListItem) {
  const kind = item.kind ? kindLabels[item.kind] ?? item.kind.toUpperCase() : null
  const year = item.airedOn?.year ? String(item.airedOn.year) : null
  const genre = item.genres?.[0]?.russian || null
  return [kind, year, genre].filter(Boolean).join('  ·  ')
}
</script>

<template>
  <section class="section top">
    <div class="container">
      <div class="section-head top__head">
        <h2 class="section-title">Популярное за всё время</h2>
        <span class="section-meta">Топ-10 по оценкам Shikimori</span>
      </div>

      <div v-if="isLoading" class="top__list">
        <div v-for="n in 6" :key="n" class="top__row top__row--skeleton" aria-hidden="true">
          <span class="skeleton-block skeleton-block--rank"></span>
          <span class="skeleton-block skeleton-block--thumb"></span>
          <span class="skeleton-block skeleton-block--title"></span>
        </div>
      </div>

      <div v-else-if="!items.length" class="top__empty">
        Популярное не загрузилось.
        <NuxtLink to="/catalog" class="link-quiet">Открыть каталог</NuxtLink>
      </div>

      <ol v-else class="top__list">
        <li v-for="(item, index) in items" :key="item.id" class="top__row">
          <NuxtLink :to="`/animes/${item.id}-${slugify(item.name)}`" class="top__link">
            <span class="top__rank tabular">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="top__thumb">
              <img
                v-if="posterOf(item)"
                :src="posterOf(item)"
                :alt="item.russian || item.name"
                class="top__image"
              >
              <span v-else class="top__image top__image--empty"></span>
            </span>
            <span class="top__body">
              <span class="top__title">{{ item.russian || item.name }}</span>
              <span class="top__sub tabular">{{ subOf(item) }}</span>
            </span>
            <span v-if="Number(item.score)" class="top__score tabular">
              {{ Number(item.score).toFixed(1) }}
            </span>
          </NuxtLink>
          <ListMenu class="top__list-menu" :anime-id="Number(item.id)" />
        </li>
      </ol>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.top__head {
  margin-bottom: 8px;
}

.top__list {
  display: flex;
  flex-direction: column;

  @include respond(laptop) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(5, auto);
    grid-auto-flow: column;
    column-gap: 56px;
  }
}

.top__row {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--rule);
  margin-inline: -12px;
  padding-inline: 12px;
  transition: background-color var(--dur-fast) var(--ease);

  &:hover {
    background: var(--paper-raised);

    .top__title {
      color: var(--lapis-deep);
    }

    .top__thumb {
      border-color: var(--rule-strong);
    }
  }
}

.top__link {
  display: grid;
  grid-template-columns: 34px 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
  padding-block: 12px;

  @include respond(tablet) {
    grid-template-columns: 44px 52px minmax(0, 1fr) 52px;
    gap: 18px;
    padding-block: 14px;
  }
}

.top__rank {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--ink-3);

  @include respond(tablet) {
    font-size: 20px;
  }
}

.top__row:nth-child(-n + 3) .top__rank {
  color: var(--ink);
}

.top__thumb {
  display: block;
  width: 44px;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: var(--paper-sunk);
  border: 1px solid var(--rule);
  border-radius: 2px;
  transition: border-color var(--dur) var(--ease);

  @include respond(tablet) {
    width: 52px;
  }
}

.top__image {
  width: 100%;
  height: 100%;
  object-fit: cover;

  &--empty {
    display: block;
    background: var(--paper-sunk);
  }
}

.top__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.top__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--dur-fast) var(--ease);

  @include respond(tablet) {
    font-size: 16px;
  }
}

.top__sub {
  font-size: 12.5px;
  color: var(--ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top__score {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--ink);
  text-align: right;

  @include respond(tablet) {
    font-size: 19px;
  }
}

.top__list-menu {
  flex: none;
  margin-left: 4px;
}

.top__empty {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-block: 16px;
  font-size: 14px;
  color: var(--ink-3);
}

/* skeleton */

.top__row--skeleton {
  display: grid;
  grid-template-columns: 34px 44px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  padding-block: 16px;

  @include respond(tablet) {
    grid-template-columns: 52px 52px minmax(0, 1fr);
    gap: 20px;
  }
}

.skeleton-block {
  display: block;
  background: var(--paper-sunk);
  border-radius: 2px;
  animation: block-pulse 1600ms var(--ease) infinite;

  &--rank {
    width: 22px;
    height: 18px;
  }

  &--thumb {
    width: 44px;
    aspect-ratio: 2 / 3;
  }

  &--title {
    width: 60%;
    height: 15px;
  }
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
