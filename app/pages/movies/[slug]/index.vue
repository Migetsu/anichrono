<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { fetchTMDBDetails, getTMDBImageUrl } from '@/lib/api/tmdb'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppCrumbs from '@/components/ui/AppCrumbs.vue'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || '')
const [type, id] = slug.value.split('-') as ['movie' | 'tv', string]

const siteUrl = 'https://anichrono.vercel.app'

const { data, pending, error: loadError } = await useAsyncData(
  () => `film-${slug.value}`,
  async () => (await fetchTMDBDetails(id, type)) ?? null,
  { watch: [slug] },
)

const film = computed<Record<string, any> | null>(() => data.value ?? null)
const isLoading = computed(() => pending.value)
const error = computed(() => (loadError.value ? loadError.value.message || 'Ошибка загрузки' : null))

const title = computed<string>(() => film.value?.title || film.value?.name || '')
const original = computed<string>(() => film.value?.original_title || film.value?.original_name || '')
const year = computed<number | null>(() => {
  const value = film.value?.release_date || film.value?.first_air_date
  return value ? new Date(value).getFullYear() : null
})

const canonical = computed(() => `${siteUrl}/movies/${type}-${id}`)

const seoTitle = computed(() => {
  if (!film.value) return 'Фильмы и сериалы — AniChrono'
  return `${title.value}${year.value ? ` (${year.value})` : ''} — смотреть онлайн | AniChrono`
})

const seoDescription = computed(() => {
  const item = film.value
  if (!item) return 'Каталог фильмов и сериалов на AniChrono.'
  const facts = [
    type === 'movie' ? 'Фильм' : 'Сериал',
    year.value ? `${year.value} год` : null,
    Number(item.vote_average) ? `рейтинг ${Number(item.vote_average).toFixed(1)}` : null,
    Array.isArray(item.genres) && item.genres.length ? item.genres.slice(0, 3).map((genre: any) => genre.name).join(', ') : null,
  ].filter(Boolean)
  const summary = item.overview ? String(item.overview).replace(/\s+/g, ' ').trim() : ''
  return [facts.join(' · '), summary.slice(0, 160)].filter(Boolean).join('. ')
    || `Смотреть ${title.value} онлайн на AniChrono.`
})

const posterUrl = computed(() =>
  film.value?.poster_path ? getTMDBImageUrl(film.value.poster_path, 'w500') : `${siteUrl}/logo.jpg`,
)

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDescription,
  ogDescription: seoDescription,
  ogImage: posterUrl,
  ogType: 'video.movie',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: posterUrl,
  robots: 'index, follow',
})

useHead(computed(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: film.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'movie' ? 'Movie' : 'TVSeries',
          name: title.value,
          alternateName: original.value || undefined,
          description: film.value.overview?.slice(0, 500),
          image: film.value.poster_path ? getTMDBImageUrl(film.value.poster_path, 'w500') : undefined,
          url: canonical.value,
          inLanguage: 'ru',
          genre: Array.isArray(film.value.genres) ? film.value.genres.map((genre: any) => genre.name) : undefined,
          datePublished: film.value.release_date || film.value.first_air_date || undefined,
          numberOfSeasons: film.value.number_of_seasons || undefined,
          numberOfEpisodes: film.value.number_of_episodes || undefined,
          aggregateRating: Number(film.value.vote_average)
            ? {
                '@type': 'AggregateRating',
                ratingValue: Number(film.value.vote_average),
                bestRating: 10,
                worstRating: 1,
                ratingCount: film.value.vote_count || undefined,
              }
            : undefined,
        }),
      }]
    : [],
})))

const statusLabels: Record<string, string> = {
  Released: 'Вышло',
  'Returning Series': 'Продолжается',
  Ended: 'Завершён',
  Canceled: 'Отменён',
  'In Production': 'В производстве',
  Planned: 'Запланирован',
  Rumored: 'Слухи',
  Pilot: 'Пилот',
}

const metaLine = computed(() => {
  const item = film.value
  if (!item) return ''
  return [
    type === 'movie' ? 'Фильм' : 'Сериал',
    year.value ? String(year.value) : null,
    Number(item.vote_average) ? `${Number(item.vote_average).toFixed(1)} TMDB` : null,
  ]
    .filter(Boolean)
    .join('  ·  ')
})

const stats = computed(() => {
  const item = film.value
  if (!item) return []
  return [
    { label: 'Оценка', value: Number(item.vote_average) ? Number(item.vote_average).toFixed(1) : '—' },
    type === 'movie'
      ? { label: 'Длительность', value: item.runtime ? `${item.runtime} мин` : '—' }
      : { label: 'Сезоны', value: item.number_of_seasons ? String(item.number_of_seasons) : '—' },
    type === 'tv'
      ? { label: 'Эпизоды', value: item.number_of_episodes ? String(item.number_of_episodes) : '—' }
      : { label: 'Голоса', value: item.vote_count ? String(item.vote_count) : '—' },
    { label: 'Статус', value: statusLabels[item.status] ?? item.status ?? '—' },
  ]
})

const seasons = computed<Array<{ season_number: number, episode_count: number, name?: string }>>(() =>
  type === 'tv' && Array.isArray(film.value?.seasons)
    ? film.value!.seasons.filter((season: any) => season.season_number > 0)
    : [],
)

const crumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Фильмы', to: '/movies' },
  { label: title.value || 'Тайтл' },
])
</script>

<template>
  <div class="film">
    <div class="container">
      <div v-if="isLoading" class="film__skeleton" aria-hidden="true">
        <span class="film__skeleton-poster"></span>
        <div class="film__skeleton-body">
          <span class="film__skeleton-line film__skeleton-line--short"></span>
          <span class="film__skeleton-line film__skeleton-line--title"></span>
          <span class="film__skeleton-line"></span>
          <span class="film__skeleton-line film__skeleton-line--short"></span>
        </div>
      </div>

      <div v-else-if="error || !film" class="film__state">
        <p class="film__state-title">Тайтл не открылся</p>
        <p class="film__state-text">{{ error }}</p>
        <NuxtLink to="/movies" class="btn btn--outline">К фильмам</NuxtLink>
      </div>

      <template v-else>
        <AppCrumbs :items="crumbs" />

        <header class="film__hero">
          <div class="film__poster">
            <img v-if="film.poster_path" :src="getTMDBImageUrl(film.poster_path, 'w500')" :alt="title" fetchpriority="high">
            <span v-else class="film__poster-empty"></span>
          </div>

          <div class="film__info">
            <p class="film__meta tabular">{{ metaLine }}</p>
            <h1 class="film__title">{{ title }}</h1>
            <p v-if="original && original !== title" class="film__original">{{ original }}</p>

            <dl class="film__stats">
              <div v-for="stat in stats" :key="stat.label" class="film__stat">
                <dt class="film__stat-label">{{ stat.label }}</dt>
                <dd class="film__stat-value tabular">{{ stat.value }}</dd>
              </div>
            </dl>

            <p v-if="film.genres?.length" class="film__genres">
              {{ film.genres.map((genre: any) => genre.name).join(', ') }}
            </p>

            <div class="film__actions">
              <NuxtLink :to="`/movies/${slug}/watch`" class="btn btn--primary">
                <AppIcon name="play" :size="15" />
                <span>Смотреть</span>
              </NuxtLink>
              <NuxtLink to="/movies" class="btn btn--quiet">Все фильмы</NuxtLink>
            </div>
          </div>
        </header>

        <section class="section film__about">
          <div class="section-head">
            <h2 class="section-title">Описание</h2>
          </div>
          <p v-if="film.overview" class="film__overview">{{ film.overview }}</p>
          <p v-else class="film__none">Описание пока не добавили.</p>
        </section>

        <section v-if="seasons.length" class="section film__seasons">
          <div class="section-head">
            <h2 class="section-title">Сезоны</h2>
            <span class="section-meta">{{ seasons.length }} сезонов</span>
          </div>

          <ol class="seasons">
            <li v-for="season in seasons" :key="season.season_number" class="seasons__row">
              <NuxtLink :to="`/movies/${slug}/watch?season=${season.season_number}&episode=1`" class="seasons__link">
                <span class="seasons__number tabular">{{ String(season.season_number).padStart(2, '0') }}</span>
                <span class="seasons__name">{{ season.name || `Сезон ${season.season_number}` }}</span>
                <span class="seasons__count tabular">{{ season.episode_count }} серий</span>
                <AppIcon class="seasons__go" name="arrow-up-right" :size="15" />
              </NuxtLink>
            </li>
          </ol>
        </section>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.film {
  padding-block: 20px 64px;

  @include respond(tablet) {
    padding-block: 28px 88px;
  }

  &__hero {
    display: grid;
    gap: 24px;
    padding-block: 24px 8px;

    @include respond(tablet) {
      grid-template-columns: 232px minmax(0, 1fr);
      gap: 40px;
      align-items: start;
    }

    @include respond(laptop) {
      grid-template-columns: 268px minmax(0, 1fr);
      gap: 56px;
    }
  }

  &__poster {
    width: min(100%, 280px);
    aspect-ratio: 2 / 3;
    border: 1px solid var(--rule-strong);
    border-radius: 2px;
    overflow: hidden;
    background: var(--paper-sunk);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @include respond(tablet) {
      width: 100%;
    }
  }

  &__poster-empty {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
  }

  &__meta {
    font-size: 13px;
    color: var(--ink-3);
  }

  &__title {
    margin-top: 10px;
    font-size: clamp(28px, 5vw, 52px);
    line-height: 0.98;
  }

  &__original {
    margin-top: 8px;
    font-size: 14px;
    color: var(--ink-3);
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    margin-block: 24px 16px;
    border-top: 1px solid var(--rule-strong);
    border-bottom: 1px solid var(--rule);

    @include respond(tablet) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  &__stat {
    padding: 12px 12px 12px 0;
    border-right: 1px solid var(--rule);

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      border-right: 0;
    }

    @include respond(tablet) {
      padding: 14px 16px;
    }
  }

  &__stat-label {
    font-size: 11.5px;
    color: var(--ink-3);
    margin-bottom: 2px;
  }

  &__stat-value {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 500;
    line-height: 1.1;
  }

  &__genres {
    font-size: 13.5px;
    color: var(--ink-2);
    max-width: 60ch;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 24px;
  }

  &__overview {
    padding-top: 18px;
    max-width: 78ch;
    font-size: 15px;
    line-height: 1.7;
    color: var(--ink-2);
  }

  &__none {
    padding-top: 16px;
    font-size: 14px;
    color: var(--ink-3);
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-block: 56px;
    max-width: 52ch;
  }

  &__state-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 600;
  }

  &__state-text {
    font-size: 14px;
    color: var(--ink-3);
  }

  &__skeleton {
    display: grid;
    gap: 24px;
    padding-block: 24px;

    @include respond(tablet) {
      grid-template-columns: 232px minmax(0, 1fr);
      gap: 40px;
    }
  }

  &__skeleton-poster {
    display: block;
    width: 100%;
    aspect-ratio: 2 / 3;
    background: var(--paper-sunk);
    border-radius: 2px;
    animation: skeleton-pulse 1600ms var(--ease) infinite;
  }

  &__skeleton-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-top: 8px;
  }

  &__skeleton-line {
    display: block;
    width: 80%;
    height: 16px;
    background: var(--paper-sunk);
    border-radius: 2px;
    animation: skeleton-pulse 1600ms var(--ease) infinite;

    &--short {
      width: 32%;
      height: 12px;
    }

    &--title {
      width: 70%;
      height: 48px;
    }
  }
}

.seasons {
  display: flex;
  flex-direction: column;

  &__row {
    border-bottom: 1px solid var(--rule);
  }

  &__link {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto 18px;
    align-items: center;
    gap: 14px;
    padding-block: 12px;
    color: var(--ink);
    transition: background-color var(--dur-fast) var(--ease);

    &:hover {
      background: var(--paper-raised);

      .seasons__name {
        color: var(--lapis-deep);
      }
    }
  }

  &__number {
    font-family: var(--font-display);
    font-size: 17px;
    color: var(--ink-3);
  }

  &__name {
    font-size: 14.5px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color var(--dur-fast) var(--ease);
  }

  &__count {
    font-size: 12.5px;
    color: var(--ink-3);
  }

  &__go {
    color: var(--ink-3);
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
