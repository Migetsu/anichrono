<script lang="ts" setup>
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import { slugify } from '@/utils/slugify'
import ListMenu from '@/components/list/ListMenu.vue'

const props = defineProps<{
  item: ShikimoriAnimeListItem
  episode?: number
}>()

const kindLabels: Record<string, string> = {
  tv: 'ТВ-сериал',
  movie: 'Фильм',
  ova: 'OVA',
  ona: 'ONA',
  special: 'Спешл',
  tv_special: 'ТВ-спешл',
  music: 'Клип',
  pv: 'Проморолик',
  cm: 'Реклама',
}

const posterUrl = computed(() => {
  const poster = props.item.poster?.mainUrl || props.item.poster?.originalUrl
  if (poster) return poster

  const image = (props.item as unknown as { image?: { original?: string; preview?: string } }).image
  if (image?.original && !image.original.includes('missing')) return `https://shikimori.io${image.original}`
  if (image?.preview && !image.preview.includes('missing')) return `https://shikimori.io${image.preview}`

  return ''
})

const metaLine = computed(() =>
  [
    props.item.kind ? kindLabels[props.item.kind] ?? props.item.kind.toUpperCase() : null,
    props.item.airedOn?.year ? String(props.item.airedOn.year) : null,
  ]
    .filter(Boolean)
    .join('  ·  '),
)
</script>

<template>
  <div class="anime-card">
    <NuxtLink :to="`/animes/${item.id}-${slugify(item.name)}`" class="anime-card__link">
      <span class="anime-card__frame">
        <img v-if="posterUrl" :src="posterUrl" :alt="item.russian || item.name" class="anime-card__image" loading="lazy">
        <span v-else class="anime-card__image anime-card__image--empty"></span>

        <span v-if="Number(item.score)" class="anime-card__score tabular">
          {{ Number(item.score).toFixed(1) }}
        </span>
        <span v-if="episode" class="anime-card__episode tabular">
          эп. {{ episode }}
        </span>
      </span>

      <span class="anime-card__title">{{ item.russian || item.name }}</span>
      <span class="anime-card__meta tabular">{{ metaLine }}</span>
    </NuxtLink>

    <div class="anime-card__actions">
      <ListMenu :anime-id="Number(item.id)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.anime-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;

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
    transition: border-color var(--dur) var(--ease), transform var(--dur) var(--ease);
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

  &__score {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 3px 6px;
    background: rgba(10, 12, 15, 0.78);
    border-radius: 2px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--ink);
  }

  &__episode {
    position: absolute;
    left: 8px;
    bottom: 8px;
    padding: 3px 6px;
    background: var(--paper);
    border-radius: 2px;
    font-size: 11px;
    font-weight: 500;
    color: var(--ink);
  }

  &__title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.64em;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.32;
    transition: color var(--dur-fast) var(--ease);
  }

  &__meta {
    font-size: 12px;
    color: var(--ink-3);
  }

  &__actions {
    position: absolute;
    top: 6px;
    left: 6px;
    opacity: 0;
    transition: opacity var(--dur-fast) var(--ease);

    :deep(.list-menu__trigger) {
      background: var(--paper);
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

  &:hover &__actions,
  &:focus-within &__actions {
    opacity: 1;
  }

  // Touch screens have no hover state, so the bookmark must stay visible.
  @media (hover: none) {
    .anime-card__actions {
      opacity: 1;
    }
  }
}
</style>
