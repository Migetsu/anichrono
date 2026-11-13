<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { format, parseISO } from 'date-fns'
import { useScheduleStore } from '@/stores/schedule'
import type { CalendarEntry } from '@/types/schedule'
import { slugify } from '@/utils/slugify'
import AppIcon from '@/components/ui/AppIcon.vue'

const siteUrl = 'https://anichrono.vercel.app'

useSeoMeta({
  title: 'Календарь аниме — расписание онгоингов | AniChrono',
  ogTitle: 'Календарь аниме — расписание онгоингов | AniChrono',
  description: 'Расписание выхода новых эпизодов аниме по дням недели. Следите за онгоингами и не пропускайте выход новых серий.',
  ogDescription: 'Расписание выхода новых эпизодов аниме по дням недели. Следите за онгоингами и не пропускайте выход новых серий.',
  ogImage: `${siteUrl}/logo.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Календарь аниме — расписание онгоингов | AniChrono',
  twitterDescription: 'Расписание выхода новых эпизодов аниме по дням недели.',
  twitterImage: `${siteUrl}/logo.jpg`,
})

const scheduleStore = useScheduleStore()
const { groupedSchedule, loading, error } = storeToRefs(scheduleStore)

// Seed the store on the server so the schedule is present in the HTML for
// crawlers and on the first paint.
const { data: calendarSsr } = await useAsyncData('schedule-ssr', () =>
  $fetch<CalendarEntry[]>('/api/calendar').catch(() => [] as CalendarEntry[]),
)

if (calendarSsr.value?.length) {
  scheduleStore.$patch({ entries: calendarSsr.value, fetchedAt: Date.now() })
}

onMounted(() => {
  scheduleStore.loadSchedule()
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

const totalEpisodes = computed(() =>
  groupedSchedule.value.reduce((sum, day) => sum + day.entries.length, 0),
)

const metaLine = computed(() => {
  if (loading.value) return 'Загружаем'
  if (error.value) return 'Ошибка загрузки'
  return `${groupedSchedule.value.length} дн. · ${totalEpisodes.value} серий`
})

function timeOf(value: string) {
  const date = parseISO(value)
  return Number.isNaN(date.getTime()) ? '—' : format(date, 'HH:mm')
}

function subOf(entry: { anime: { kind?: string | null; airedOn?: { year: number | null } } }) {
  const kind = entry.anime.kind ? kindLabels[entry.anime.kind] ?? entry.anime.kind : null
  const year = entry.anime.airedOn?.year ? String(entry.anime.airedOn.year) : null
  return [kind, year].filter(Boolean).join('  ·  ')
}

function pluralEpisodes(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'серия'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'серии'
  return 'серий'
}

function posterOf(entry: { anime: { poster?: { originalUrl?: string; mainUrl?: string }; image?: { original?: string; preview?: string } } }) {
  const direct = entry.anime.poster?.originalUrl || entry.anime.poster?.mainUrl
  if (direct) return direct
  const image = entry.anime.image
  if (image?.original && !image.original.includes('missing')) return `https://shikimori.io${image.original}`
  if (image?.preview && !image.preview.includes('missing')) return `https://shikimori.io${image.preview}`
  return ''
}
</script>

<template>
  <div class="schedule">
    <div class="container">
      <header class="schedule__head">
        <div class="schedule__heading">
          <h1 class="schedule__title">Расписание</h1>
          <span class="schedule__meta tabular">{{ metaLine }}</span>
        </div>
      </header>

      <div v-if="loading" class="schedule__days">
        <div v-for="n in 3" :key="n" class="schedule__skeleton">
          <span class="schedule__skeleton-title"></span>
          <div class="schedule__slots">
            <span v-for="row in 4" :key="row" class="schedule__skeleton-row"></span>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="schedule__state">
        <p class="schedule__state-title">Расписание не загрузилось</p>
        <p class="schedule__state-text">{{ error }}</p>
        <button type="button" class="btn btn--outline" @click="scheduleStore.loadSchedule(true)">
          Попробовать снова
        </button>
      </div>

      <div v-else-if="!groupedSchedule.length" class="schedule__state">
        <p class="schedule__state-title">Эфиров пока нет</p>
        <p class="schedule__state-text">Как только Shikimori отдаст календарь, серии появятся здесь.</p>
      </div>

      <div v-else class="schedule__days">
        <section v-for="day in groupedSchedule" :key="day.date" class="schedule__day">
          <div class="schedule__day-head">
            <h2 class="schedule__day-title" :class="{ 'schedule__day-title--today': day.isToday }">
              {{ day.label }}
            </h2>
            <span class="schedule__day-count tabular">
              {{ day.entries.length }} {{ pluralEpisodes(day.entries.length) }}
            </span>
          </div>

          <ul class="schedule__slots">
            <li v-for="entry in day.entries" :key="entry.anime.id" class="schedule__slot">
              <NuxtLink
                :to="`/animes/${entry.anime.id}-${slugify(entry.anime.name)}`"
                class="schedule__link"
              >
                <span class="schedule__time tabular">{{ timeOf(entry.next_episode_at) }}</span>

                <span class="schedule__poster">
                  <img
                    v-if="posterOf(entry)"
                    :src="posterOf(entry)"
                    :alt="entry.anime.russian || entry.anime.name"
                    loading="lazy"
                  >
                </span>

                <span class="schedule__body">
                  <span class="schedule__name">{{ entry.anime.russian || entry.anime.name }}</span>
                  <span class="schedule__sub tabular">{{ subOf(entry) }}</span>
                </span>

                <span class="schedule__episode tabular">эп. {{ entry.next_episode }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.schedule {
  padding-block: 28px 64px;

  @include respond(tablet) {
    padding-block: 40px 80px;
  }

  &__head {
    padding-bottom: 16px;
    border-bottom: 1px solid var(--rule-strong);
    margin-bottom: 28px;
  }

  &__heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }

  &__title {
    font-size: clamp(30px, 4vw, 44px);
  }

  &__meta {
    font-size: 13px;
    color: var(--ink-3);
  }

  &__days {
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  &__day-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 4px;
  }

  &__day-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--ink-2);

    &--today {
      color: var(--ink);
    }
  }

  &__day-count {
    font-size: 12.5px;
    color: var(--ink-3);
  }

  &__slots {
    display: grid;
    grid-template-columns: 1fr;

    @include respond(tablet) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 40px;
    }
  }

  &__slot {
    border-bottom: 1px solid var(--rule);
  }

  &__link {
    display: grid;
    grid-template-columns: 48px 40px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding-block: 10px;
    color: var(--ink);
    transition: background-color var(--dur-fast) var(--ease);

    &:hover {
      background: var(--paper-raised);

      .schedule__name {
        color: var(--lapis-deep);
      }
    }
  }

  &__time {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 500;
    color: var(--ink);
  }

  &__poster {
    display: block;
    width: 40px;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background: var(--paper-sunk);
    border: 1px solid var(--rule);
    border-radius: 2px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  &__name {
    font-size: 14.5px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color var(--dur-fast) var(--ease);
  }

  &__sub {
    font-size: 12px;
    color: var(--ink-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__episode {
    font-size: 12.5px;
    color: var(--ink-3);
    white-space: nowrap;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-block: 40px;
    max-width: 48ch;
  }

  &__state-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
  }

  &__state-text {
    font-size: 14px;
    color: var(--ink-3);
  }

  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__skeleton-title {
    display: block;
    width: 220px;
    height: 22px;
    background: var(--paper-sunk);
    border-radius: 2px;
    animation: skeleton-pulse 1600ms var(--ease) infinite;
  }

  &__skeleton-row {
    display: block;
    height: 62px;
    background: var(--paper-sunk);
    border-radius: 2px;
    animation: skeleton-pulse 1600ms var(--ease) infinite;
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
