<script setup lang="ts">
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useScheduleStore } from '@/stores/schedule'
import { usePopularStore } from '@/stores/popular'
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import { slugify } from '@/utils/slugify'
import AppIcon from '@/components/ui/AppIcon.vue'

interface Feature {
  id: number
  title: string
  original: string
  poster: string
  score: number
  kind: string | null
  year: number | null
  episode: number | null
  at: Date | null
  genres: string[]
}

const scheduleStore = useScheduleStore()
const popularStore = usePopularStore()

const active = ref(0)

onMounted(() => {
  scheduleStore.loadSchedule()
  popularStore.loadPopular()
})

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
  const direct = item.poster?.main2xUrl || item.poster?.mainUrl || item.poster?.originalUrl
  if (direct) return direct

  const image = (item as unknown as { image?: { original?: string; preview?: string } }).image
  if (image?.original && !image.original.includes('missing')) return `https://shikimori.io${image.original}`
  if (image?.preview && !image.preview.includes('missing')) return `https://shikimori.io${image.preview}`
  return ''
}

const broadcast = computed<Feature[]>(() => {
  const now = Date.now()
  const horizon = now + 1000 * 60 * 60 * 72
  const floor = now - 1000 * 60 * 45

  const upcoming = scheduleStore.entries
    .filter(entry => entry.next_episode_at)
    .map(entry => ({
      entry,
      at: parseISO(entry.next_episode_at),
    }))
    .filter(({ at }) => {
      const time = at.getTime()
      return !Number.isNaN(time) && time >= floor && time <= horizon
    })
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, 8)

  return upcoming.map(({ entry, at }) => ({
    id: entry.anime.id,
    title: entry.anime.russian || entry.anime.name,
    original: entry.anime.name,
    poster: posterOf(entry.anime),
    score: Number(entry.anime.score) || 0,
    kind: entry.anime.kind ?? null,
    year: entry.anime.airedOn?.year ?? null,
    episode: entry.next_episode ?? null,
    at,
    genres: (entry.anime.genres || []).map(genre => genre.russian).filter(Boolean).slice(0, 3),
  }))
})

const fallback = computed<Feature[]>(() =>
  popularStore.popular.slice(0, 5).map(item => ({
    id: item.id,
    title: item.russian || item.name,
    original: item.name,
    poster: posterOf(item),
    score: Number(item.score) || 0,
    kind: item.kind ?? null,
    year: item.airedOn?.year ?? null,
    episode: null,
    at: null,
    genres: (item.genres || []).map(genre => genre.russian).filter(Boolean).slice(0, 3),
  })),
)

const features = computed(() => (broadcast.value.length ? broadcast.value : fallback.value))
const current = computed<Feature | null>(() => features.value[active.value] ?? features.value[0] ?? null)
const isLoading = computed(() => {
  const schedulePending = scheduleStore.loading && !scheduleStore.entries.length
  const popularPending = popularStore.loadingPopular && !popularStore.popular.length
  return !features.value.length && (schedulePending || popularPending)
})

watch(features, (list) => {
  if (active.value >= list.length) active.value = 0
})

const slotLabel = computed(() => {
  const at = current.value?.at
  if (!at) return 'В каталоге'
  if (isToday(at)) return `Сегодня, ${format(at, 'HH:mm')}`
  if (isTomorrow(at)) return `Завтра, ${format(at, 'HH:mm')}`
  return `${format(at, 'd MMM', { locale: ru })}, ${format(at, 'HH:mm')}`
})

const metaLine = computed(() => {
  const item = current.value
  if (!item) return ''
  return [
    item.score ? item.score.toFixed(1) : null,
    item.kind ? kindLabels[item.kind] ?? item.kind.toUpperCase() : null,
    item.year ? String(item.year) : null,
  ]
    .filter(Boolean)
    .join('  ·  ')
})

const railTime = (at: Date | null, episode: number | null) => {
  if (!at) return { time: '—', day: 'каталог', episode }
  const sameDay = isToday(at)
  return {
    time: format(at, 'HH:mm'),
    day: sameDay ? 'сегодня' : format(at, 'd MMM', { locale: ru }),
    episode,
  }
}

const linkFor = (id: number, title: string) => `/animes/${id}-${slugify(title)}`
</script>

<template>
  <section class="hero">
    <div class="container hero__inner">
      <div v-if="isLoading" class="hero__skeleton" aria-hidden="true">
        <div class="hero__skeleton-text">
          <span class="block block--slot"></span>
          <span class="block block--title"></span>
          <span class="block block--title block--short"></span>
          <span class="block block--meta"></span>
          <span class="block block--actions"></span>
        </div>
        <div class="block block--poster"></div>
      </div>

      <div v-else-if="!current" class="hero__empty">
        <h1 class="hero__empty-title">Эфир не загрузился</h1>
        <p class="hero__empty-text">
          Расписание живёт на данных Shikimori. Попробуйте обновить страницу через минуту или
          откройте каталог.
        </p>
        <div class="hero__actions">
          <NuxtLink to="/catalog" class="btn btn--primary">Открыть каталог</NuxtLink>
          <NuxtLink to="/schedule" class="btn btn--outline">Расписание</NuxtLink>
        </div>
      </div>

      <template v-else>
        <div class="hero__grid">
          <div class="hero__text rise">
            <p class="hero__slot">
              <span v-if="current.at" class="hero__dot" aria-hidden="true"></span>
              <span class="tabular">{{ slotLabel }}</span>
            </p>

            <h1 class="hero__title">{{ current.title }}</h1>

            <p v-if="current.original && current.original !== current.title" class="hero__original">
              {{ current.original }}
            </p>

            <p class="hero__meta tabular">{{ metaLine }}</p>

            <p v-if="current.genres.length" class="hero__genres">
              {{ current.genres.join(', ') }}
            </p>

            <div class="hero__actions">
              <NuxtLink :to="linkFor(current.id, current.title)" class="btn btn--primary">
                <AppIcon name="play" :size="15" />
                <span>Смотреть</span>
              </NuxtLink>
              <NuxtLink to="/schedule" class="btn btn--outline">Расписание</NuxtLink>
            </div>
          </div>

          <NuxtLink
            :to="linkFor(current.id, current.title)"
            class="hero__poster"
            :aria-label="`Открыть ${current.title}`"
          >
            <img
              v-if="current.poster"
              :src="current.poster"
              :alt="current.title"
              class="hero__image"
              fetchpriority="high"
              decoding="async"
            >
            <span v-else class="hero__image hero__image--empty" aria-hidden="true"></span>
            <span v-if="current.episode" class="hero__stamp" aria-hidden="true">
              <span class="hero__stamp-num tabular">{{ String(current.episode).padStart(2, '0') }}</span>
              <span class="hero__stamp-label">серия</span>
            </span>
          </NuxtLink>
        </div>

        <div v-if="features.length > 1" class="hero__rail" aria-label="Ближайшие эфиры">
          <button
            v-for="(item, index) in features"
            :key="`${item.id}-${index}`"
            type="button"
            class="rail-item"
            :class="{ 'rail-item--active': index === active }"
            :aria-pressed="index === active"
            @click="active = index"
          >
            <span class="rail-item__time tabular">{{ railTime(item.at, item.episode).time }}</span>
            <span class="rail-item__name">{{ item.title }}</span>
            <span class="rail-item__day">{{ railTime(item.at, item.episode).day }}</span>
          </button>
        </div>
      </template>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  padding-top: 24px;
  border-bottom: 1px solid var(--rule-strong);

  @include respond(tablet) {
    padding-top: 40px;
  }
}

.hero__inner {
  padding-bottom: 0;
}

.hero__grid {
  display: grid;
  gap: 28px;
  padding-bottom: 32px;

  @include respond(tablet) {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
    align-items: start;
    gap: 40px;
    padding-bottom: 40px;
  }

  @include respond(laptop) {
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 64px;
  }
}

.hero__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding-top: 4px;

  @include respond(tablet) {
    align-self: center;
    padding-block: 24px;
  }
}

.hero__slot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: var(--ink-2);
}

.hero__dot {
  width: 7px;
  height: 7px;
  background: var(--signal-dot);
  border-radius: 50%;
}

.hero__title {
  font-size: clamp(34px, 7.4vw, 76px);
  line-height: 0.94;
  letter-spacing: -0.005em;
  max-width: 16ch;
  text-wrap: balance;
}

.hero__meta {
  font-size: 14px;
  color: var(--ink-2);
}

.hero__original {
  margin-top: -8px;
  font-size: 14px;
  color: var(--ink-3);
  letter-spacing: 0.005em;
}

.hero__genres {
  font-size: 13.5px;
  color: var(--ink-3);
  max-width: 44ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.hero__poster {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 2 / 3;
  justify-self: start;
  background: var(--paper-sunk);
  border: 1px solid var(--rule-strong);
  border-radius: 2px;

  @include respond(tablet) {
    width: min(100%, 300px);
    justify-self: end;
    margin-right: 12px;
    transition: border-color var(--dur) var(--ease), transform var(--dur) var(--ease);

    &:hover {
      border-color: var(--ink);
      transform: translateY(-2px);
    }
  }

  @include respond(laptop) {
    width: 340px;
  }
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;

  &--empty {
    background: var(--paper-sunk);
  }
}

.hero__stamp {
  position: absolute;
  left: -10px;
  bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 54px;
  padding: 7px 0 5px;
  background: var(--paper);
  border: 1px solid var(--seal);
  color: var(--seal);
  transform: rotate(-3deg);

  @include respond(tablet) {
    left: -16px;
    width: 60px;
    padding: 8px 0 6px;
  }
}

.hero__stamp-num {
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 600;
  line-height: 1;

  @include respond(tablet) {
    font-size: 24px;
  }
}

.hero__stamp-label {
  font-size: 10.5px;
  color: var(--seal);
  letter-spacing: 0.02em;
  opacity: 0.82;
}

.hero__rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 132px;
  overflow-x: auto;
  border-top: 1px solid var(--rule-strong);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @include respond(tablet) {
    grid-auto-columns: 152px;
  }

  @include respond(laptop) {
    grid-auto-columns: minmax(0, 1fr);
    overflow: hidden;
  }
}

.rail-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 14px 14px 18px;
  text-align: left;
  border-right: 1px solid var(--rule);
  color: var(--ink-2);
  transition: background-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);

  &::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: -1px;
    height: 2px;
    background: var(--lapis);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform var(--dur) var(--ease);
  }

  &:last-child {
    border-right: 0;
  }

  &:hover {
    color: var(--ink);
    background: var(--paper-raised);
  }

  &--active {
    color: var(--ink);

    &::before {
      transform: scaleX(1);
    }
  }

  &__time {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 500;
    line-height: 1;
  }

  &__name {
    font-size: 12.5px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__day {
    font-size: 11.5px;
    color: var(--ink-3);
  }
}

.hero__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding-block: 48px;
}

.hero__empty-title {
  font-size: clamp(28px, 5vw, 44px);
}

.hero__empty-text {
  max-width: 48ch;
  font-size: 15px;
  color: var(--ink-2);
}

/* skeleton */

.hero__skeleton {
  display: grid;
  gap: 28px;
  padding-block: 16px 40px;

  @include respond(tablet) {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
    align-items: start;
    gap: 40px;
  }
}

.hero__skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block {
  display: block;
  background: var(--paper-sunk);
  border-radius: 2px;
  animation: block-pulse 1600ms var(--ease) infinite;

  &--slot {
    width: 180px;
    height: 14px;
  }

  &--title {
    width: 88%;
    height: 56px;
  }

  &--short {
    width: 56%;
  }

  &--meta {
    width: 220px;
    height: 14px;
  }

  &--actions {
    width: 260px;
    height: 44px;
    margin-top: 8px;
  }

  &--poster {
    width: min(100%, 340px);
    aspect-ratio: 2 / 3;
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
