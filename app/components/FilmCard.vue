<script lang="ts" setup>
import type { TMDBMovie, TMDBTV } from '@/types/tmdb'
import { getTMDBImageUrl } from '@/lib/api/tmdb'

const props = defineProps<{
  item: TMDBMovie | TMDBTV
  type: 'movie' | 'tv'
}>()

const title = computed(() => (props.item as TMDBMovie).title || (props.item as TMDBTV).name)
const date = computed(() => (props.item as TMDBMovie).release_date || (props.item as TMDBTV).first_air_date)
const year = computed(() => date.value ? new Date(date.value).getFullYear() : '')
const posterUrl = computed(() => getTMDBImageUrl(props.item.poster_path))
</script>

<template>
  <NuxtLink :to="`/movies/${type}-${item.id}`" class="film-card">
    <div class="film-card__poster-wrap">
      <img v-if="posterUrl" :src="posterUrl" :alt="title" class="film-card__poster">
      <div v-else class="film-card__no-poster">
        <Icon name="solar:clapperboard-play-linear" size="40" />
      </div>
      <div class="film-card__score" v-if="item.vote_average">
        <Icon name="solar:star-bold" size="10" />
        {{ item.vote_average.toFixed(1) }}
      </div>
    </div>
    <div class="film-card__body">
      <h3 class="film-card__title" :title="title">{{ title }}</h3>
      <div class="film-card__meta">
        <span class="film-card__type">{{ type === 'movie' ? 'Фильм' : 'Сериал' }}</span>
        <span class="film-card__year" v-if="year">{{ year }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.film-card {
  display: flex;
  flex-direction: column;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    background: var(--surface3);
    border-color: rgba(var(--accent-rgb), 0.5);
    box-shadow: 0 12px 30px rgba(0,0,0,0.3);

    .film-card__poster {
      transform: scale(1.05);
    }
  }

  &__poster-wrap {
    position: relative;
    padding-top: 150%;
    overflow: hidden;
    background: #111;
  }

  &__poster {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &__no-poster {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
  }

  &__score {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.7);
    padding: 4px 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--gold);
    font-size: 11px;
    font-weight: 700;
    z-index: 2;
  }

  &__body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 8px;
  }

  &__title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 2.6em;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--muted);
    margin-top: auto;
  }

  &__type {
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
  }

  &__year {
    color: var(--chrono);
  }
}
</style>
