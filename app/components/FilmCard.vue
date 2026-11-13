<script lang="ts" setup>
import type { TMDBMovie, TMDBTV } from '@/types/tmdb'
import { getTMDBImageUrl } from '@/lib/api/tmdb'

const props = defineProps<{
  item: TMDBMovie | TMDBTV
  type: 'movie' | 'tv'
}>()

const title = computed(() => (props.item as TMDBMovie).title || (props.item as TMDBTV).name)
const original = computed(() => (props.item as TMDBMovie).original_title || (props.item as TMDBTV).original_name)
const date = computed(() => (props.item as TMDBMovie).release_date || (props.item as TMDBTV).first_air_date)
const year = computed(() => (date.value ? new Date(date.value).getFullYear() : ''))
const posterUrl = computed(() => getTMDBImageUrl(props.item.poster_path, 'w342'))
const score = computed(() => (Number(props.item.vote_average) ? Number(props.item.vote_average).toFixed(1) : null))

const meta = computed(() =>
  [props.type === 'movie' ? 'Фильм' : 'Сериал', year.value || null].filter(Boolean).join('  ·  '),
)
</script>

<template>
  <NuxtLink :to="`/movies/${type}-${item.id}`" class="film-card">
    <span class="film-card__frame">
      <img v-if="posterUrl" :src="posterUrl" :alt="title" class="film-card__image" loading="lazy" decoding="async">
      <span v-else class="film-card__image film-card__image--empty"></span>
      <span v-if="score" class="film-card__score tabular">{{ score }}</span>
    </span>
    <span class="film-card__title">{{ title }}</span>
    <span class="film-card__meta tabular">{{ meta }}</span>
    <span v-if="original && original !== title" class="film-card__original">{{ original }}</span>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.film-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  color: var(--ink);

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

  &__original {
    font-size: 11.5px;
    color: var(--ink-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover &__frame {
    border-color: var(--rule-strong);
    transform: translateY(-2px);
  }

  &:hover &__title {
    color: var(--lapis-deep);
  }
}
</style>
