<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { fetchAnimeDetails, fetchRelatedAnimes } from '@/lib/api/animeDetails'
import type { ShikimoriAnimeFull } from '@/types/shikimori'
import { slugify } from '@/utils/slugify'
import { useListsStore } from '@/stores/lists'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppCrumbs from '@/components/ui/AppCrumbs.vue'
import ListMenu from '@/components/list/ListMenu.vue'

const route = useRoute()
const lists = useListsStore()
const auth = useAuthStore()
const siteUrl = 'https://anichrono.vercel.app'

const slug = computed(() => (route.params.slug as string) || '')
const animeId = computed(() => slug.value.split('-')[0] || '')

// Rendered on the server as well: crawlers must get the real title, text and
// metadata instead of an empty client-side skeleton.
const { data, pending, error: loadError } = await useAsyncData(
  () => `anime-${animeId.value}`,
  async () => {
    const details = await fetchAnimeDetails(animeId.value)
    if (!details) return null
    const relations = await fetchRelatedAnimes(animeId.value).catch(() => [])
    return { details, relations }
  },
  { watch: [animeId] },
)

const anime = computed<ShikimoriAnimeFull | null>(() => data.value?.details ?? null)
const related = computed(() => data.value?.relations ?? [])
const playerUrl = ref<string | null>(null)
const isLoading = computed(() => pending.value)
const error = computed(() => (loadError.value ? loadError.value.message || 'Ошибка загрузки' : null))

const kindLabels: Record<string, string> = {
  tv: 'ТВ-сериал',
  movie: 'Фильм',
  ova: 'OVA',
  ona: 'ONA',
  special: 'Спешл',
  tv_special: 'ТВ-спешл',
  music: 'Клип',
}

const seasonLabels: Record<string, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Лето',
  fall: 'Осень',
}

const rateLabels: Record<string, string> = {
  g: 'G',
  pg: '6+',
  pg_13: '12+',
  r: '16+',
  r_plus: '18+',
  rx: '18+',
}

const title = computed(() => anime.value?.russian || anime.value?.name || '')

const metaLine = computed(() => {
  const item = anime.value
  if (!item) return ''
  const season = item.season ? seasonLabels[item.season.split('_')[0] ?? ''] : null
  const year = item.airedOn?.year ? String(item.airedOn.year) : null
  const seasonYear = [season, year].filter(Boolean).join(' ')
  return [
    item.kind ? kindLabels[item.kind] ?? item.kind.toUpperCase() : null,
    seasonYear || null,
    item.rating ? rateLabels[item.rating] ?? null : null,
  ]
    .filter(Boolean)
    .join('  ·  ')
})

const stats = computed(() => {
  const item = anime.value
  if (!item) return []
  return [
    { label: 'Оценка', value: item.score ? Number(item.score).toFixed(2) : '—' },
    { label: 'Эпизоды', value: item.episodes ? String(item.episodes) : item.episodesAired ? `${item.episodesAired}+` : '—' },
    { label: 'Серия', value: item.duration ? `${item.duration} мин` : '—' },
    {
      label: 'Статус',
      value: item.status === 'ongoing' ? 'Выходит' : item.status === 'released' ? 'Вышло' : item.status === 'anons' ? 'Анонс' : '—',
    },
  ]
})

const description = computed(() => {
  if (!anime.value?.descriptionHtml) return ''
  return anime.value.descriptionHtml.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
})

const relationLabels: Record<string, string> = {
  adaptation: 'Адаптация',
  alternative_setting: 'Другая вселенная',
  alternative_version: 'Другая версия',
  character: 'Персонаж',
  full_story: 'Полная история',
  other: 'Другое',
  parent_story: 'Основная история',
  prequel: 'Приквел',
  sequel: 'Сиквел',
  side_story: 'Сайд-стори',
  spin_off: 'Спин-офф',
  summary: 'Пересказ',
}

function relationLabel(kind: string | undefined, text: string | undefined) {
  if (kind && relationLabels[kind]) return relationLabels[kind]
  return text || ''
}

const chronology = computed(() =>
  [...related.value]
    .filter(item => !!item.anime)
    .sort((a, b) => (a.anime.airedOn?.year || 0) - (b.anime.airedOn?.year || 0)),
)

function posterOf(item: ShikimoriAnimeFull) {
  const direct = item.poster?.originalUrl || item.poster?.mainUrl
  return direct || ''
}

const canonical = computed(() =>
  anime.value
    ? `${siteUrl}/animes/${anime.value.id}-${slugify(anime.value.name)}`
    : `${siteUrl}${route.path}`,
)

const seoTitle = computed(() => {
  if (!anime.value) return 'Аниме — AniChrono'
  return `${title.value} — смотреть онлайн и расписание серий | AniChrono`
})

const seoDescription = computed(() => {
  const item = anime.value
  if (!item) return 'Каталог аниме, расписание эфира и просмотр онлайн на AniChrono.'
  const facts = [
    item.kind ? kindLabels[item.kind] ?? null : null,
    item.airedOn?.year ? `${item.airedOn.year} год` : null,
    item.episodes ? `${item.episodes} эпизодов` : null,
    item.genres?.length ? item.genres.slice(0, 4).map(genre => genre.russian).filter(Boolean).join(', ') : null,
  ].filter(Boolean)
  const summary = item.description ? item.description.replace(/\s+/g, ' ').trim() : ''
  return [facts.join(' · '), summary.slice(0, 160)].filter(Boolean).join('. ')
    || `Смотреть ${title.value} онлайн на AniChrono.`
})

const posterUrl = computed(() => anime.value?.poster?.originalUrl || `${siteUrl}/logo.jpg`)

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDescription,
  ogDescription: seoDescription,
  ogImage: posterUrl,
  ogType: 'video.tv_show',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: posterUrl,
  robots: 'index, follow',
})

useHead(computed(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: anime.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': anime.value.kind === 'movie' ? 'Movie' : 'TVSeries',
          name: title.value,
          alternateName: anime.value.name,
          description: anime.value.description?.replace(/\s+/g, ' ').slice(0, 500),
          image: anime.value.poster?.originalUrl,
          url: canonical.value,
          inLanguage: 'ru',
          genre: (anime.value.genres || []).map(genre => genre.russian).filter(Boolean),
          numberOfEpisodes: anime.value.episodes || undefined,
          datePublished: anime.value.airedOn?.date || anime.value.airedOn?.year?.toString(),
          aggregateRating: anime.value.score
            ? {
                '@type': 'AggregateRating',
                ratingValue: Number(anime.value.score),
                bestRating: 10,
                worstRating: 1,
              }
            : undefined,
        }),
      }]
    : [],
})))

onMounted(async () => {
  if (auth.isAuthorized) {
    lists.ensureRates().catch(() => {})
  }

  const id = anime.value?.id
  if (!id) return

  const kodik = await $fetch<{ results?: { link: string }[] }>('/api/kodik/search', {
    params: { shikimori_id: id },
  }).catch(() => null)

  if (kodik?.results?.length) playerUrl.value = kodik.results[0]?.link ?? null
})
</script>

<template>
  <div class="title">
    <div class="container">
      <div v-if="isLoading" class="title__skeleton" aria-hidden="true">
        <span class="title__skeleton-poster"></span>
        <div class="title__skeleton-body">
          <span class="title__skeleton-line title__skeleton-line--short"></span>
          <span class="title__skeleton-line title__skeleton-line--title"></span>
          <span class="title__skeleton-line"></span>
          <span class="title__skeleton-line title__skeleton-line--short"></span>
        </div>
      </div>

      <div v-else-if="error || !anime" class="title__state">
        <p class="title__state-title">Тайтл не открылся</p>
        <p class="title__state-text">{{ error || 'Shikimori не отдал данные об этом аниме.' }}</p>
        <NuxtLink to="/catalog" class="btn btn--outline">Вернуться в каталог</NuxtLink>
      </div>

      <template v-else>
        <AppCrumbs :items="[
          { label: 'Главная', to: '/' },
          { label: 'Каталог', to: '/catalog' },
          { label: title },
        ]" />

        <header class="title__hero">
          <div class="title__poster">
            <img v-if="posterOf(anime)" :src="posterOf(anime)" :alt="title">
            <span v-else class="title__poster-empty"></span>
          </div>

          <div class="title__info">
            <p class="title__meta tabular">{{ metaLine }}</p>
            <h1 class="title__name">{{ title }}</h1>
            <p v-if="anime.name && anime.name !== title" class="title__original">{{ anime.name }}</p>

            <dl class="title__stats">
              <div v-for="stat in stats" :key="stat.label" class="title__stat">
                <dt class="title__stat-label">{{ stat.label }}</dt>
                <dd class="title__stat-value tabular">{{ stat.value }}</dd>
              </div>
            </dl>

            <p v-if="anime.genres?.length" class="title__genres">
              {{ anime.genres.map(genre => genre.russian).join(', ') }}
            </p>

            <div class="title__actions">
              <NuxtLink v-if="playerUrl" :to="`/animes/${slug}/watch`" class="btn btn--primary">
                <AppIcon name="play" :size="15" />
                <span>Смотреть</span>
              </NuxtLink>

              <ListMenu v-if="auth.isAuthorized" :anime-id="anime.id" label="В списки" />
              <NuxtLink to="/schedule" class="btn btn--quiet">Расписание</NuxtLink>
            </div>
          </div>
        </header>

        <section class="section title__about">
          <div class="section-head">
            <h2 class="section-title">Описание</h2>
          </div>
          <div v-if="description" class="prose" v-html="description"></div>
          <p v-else class="title__none">Описание пока не добавили.</p>
        </section>

        <section v-if="chronology.length" class="section title__chronology">
          <div class="section-head">
            <h2 class="section-title">Хронология</h2>
            <span class="section-meta">{{ chronology.length }} связанных тайтлов</span>
          </div>

          <ol class="chrono">
            <li v-for="link in chronology" :key="link.anime.id" class="chrono__row">
              <NuxtLink :to="`/animes/${link.anime.id}-${slugify(link.anime.name)}`" class="chrono__link">
                <span class="chrono__relation">{{ relationLabel(link.relationKind, link.relationText) }}</span>
                <span class="chrono__poster">
                  <img
                    v-if="link.anime.poster?.mainUrl || link.anime.poster?.originalUrl"
                    :src="link.anime.poster.mainUrl || link.anime.poster.originalUrl"
                    alt=""
                    loading="lazy"
                  >
                </span>
                <span class="chrono__body">
                  <span class="chrono__name">{{ link.anime.russian || link.anime.name }}</span>
                  <span class="chrono__sub tabular">
                    {{ link.anime.kind ? kindLabels[link.anime.kind] ?? link.anime.kind : '' }}
                    <template v-if="link.anime.airedOn?.year"> · {{ link.anime.airedOn.year }}</template>
                  </span>
                </span>
                <span v-if="Number(link.anime.score)" class="chrono__score tabular">
                  {{ Number(link.anime.score).toFixed(1) }}
                </span>
              </NuxtLink>
            </li>
          </ol>
        </section>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
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
    letter-spacing: 0.01em;
  }

  &__name {
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
    gap: 0;
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

  &__none {
    font-size: 14px;
    color: var(--ink-3);
    padding-top: 16px;
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

.prose {
  padding-top: 18px;
  max-width: 78ch;
  font-size: 15px;
  line-height: 1.7;
  color: var(--ink-2);

  :deep(p) {
    margin-bottom: 12px;
  }

  :deep(a) {
    color: var(--lapis-deep);
    border-bottom: 1px solid var(--rule-strong);
  }

  :deep(br) {
    display: block;
    content: '';
    margin-top: 6px;
  }
}

.chrono {
  display: flex;
  flex-direction: column;

  &__row {
    border-bottom: 1px solid var(--rule);
  }

  &__link {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding-block: 10px;
    color: var(--ink);
    transition: background-color var(--dur-fast) var(--ease);

    @include respond(tablet) {
      grid-template-columns: 118px 40px minmax(0, 1fr) auto;
    }

    &:hover {
      background: var(--paper-raised);

      .chrono__name {
        color: var(--lapis-deep);
      }
    }
  }

  &__relation {
    display: none;
    font-size: 12px;
    color: var(--ink-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @include respond(tablet) {
      display: block;
    }
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
  }

  &__score {
    font-family: var(--font-display);
    font-size: 16px;
    color: var(--ink-2);
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
