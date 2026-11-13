<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { fetchTMDBDetails } from '~/lib/api/tmdb'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppCrumbs from '@/components/ui/AppCrumbs.vue'

const route = useRoute()
const router = useRouter()

const slug = computed(() => (route.params.slug as string) || '')
const [type, id] = slug.value.split('-') as ['movie' | 'tv', string]
const isTv = type === 'tv'

const film = ref<Record<string, any> | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const season = ref(Number(route.query.season) || 1)
const episode = ref(Number(route.query.episode) || 1)

interface PlayerSource {
  id: string
  name: string
  url: string
}

const sources = ref<PlayerSource[]>([])
const activeSourceId = ref('')

const title = computed<string>(() => film.value?.title || film.value?.name || '')
const year = computed<number | null>(() => {
  const value = film.value?.release_date || film.value?.first_air_date
  return value ? new Date(value).getFullYear() : null
})

const seasonList = computed<Array<{ season_number: number, episode_count: number, name?: string }>>(() =>
  isTv && Array.isArray(film.value?.seasons)
    ? film.value!.seasons.filter((item: any) => item.season_number > 0)
    : [],
)

const currentSeason = computed(() =>
  seasonList.value.find(item => item.season_number === season.value) ?? seasonList.value[0],
)

const episodeCount = computed(() => currentSeason.value?.episode_count ?? 0)

const embessUrl = computed(() => {
  const imdb = film.value?.external_ids?.imdb_id
  if (!imdb) return null
  const base = `https://api.embess.ws/embed/imdb/${imdb}`
  if (!isTv) return base
  return `${base}?season=${season.value}&episode=${episode.value}`
})

const activeUrl = computed(() => {
  if (activeSourceId.value === 'embess') return embessUrl.value
  return sources.value.find(source => source.id === activeSourceId.value)?.url ?? null
})

useSeoMeta({
  title: computed(() => (film.value ? `Смотреть ${title.value} — AniChrono` : 'Просмотр — AniChrono')),
  description: computed(() => (film.value ? `Смотреть ${title.value} онлайн на AniChrono.` : '')),
  robots: 'noindex, follow',
})

const crumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Фильмы', to: '/movies' },
  { label: title.value || 'Тайтл', to: `/movies/${slug.value}` },
  { label: 'Просмотр' },
])

function syncQuery() {
  const query = isTv ? { season: String(season.value), episode: String(episode.value) } : {}
  router.replace({ path: `/movies/${slug.value}/watch`, query })
}

function onSeasonChange() {
  episode.value = 1
  syncQuery()
}

function onEpisodeChange() {
  syncQuery()
}

onMounted(async () => {
  try {
    isLoading.value = true
    const res = await fetchTMDBDetails(id, type)
    if (!res) throw new Error('Тайтл не найден')
    film.value = res

    const imdb = res.external_ids?.imdb_id

    // Embess takes IMDb ids directly and covers both films and series.
    if (imdb) {
      sources.value = [{ id: 'embess', name: 'Embess (RU)', url: embessUrl.value as string }]
      activeSourceId.value = 'embess'
    }

    // Kodik stays as a second source when it has this title.
    if (imdb) {
      try {
        const kodik = await $fetch<{ results?: { link: string }[] }>('/api/kodik/search', {
          params: { imdb_id: imdb },
        }).catch(() => null)
        const link = kodik?.results?.[0]?.link
        if (link) sources.value.push({ id: 'kodik', name: 'Kodik', url: link })
      } catch {
        // Kodik is optional — ignore failures.
      }
    }

    if (!sources.value.length) {
      error.value = 'Для этого тайтла не нашлось источника видео'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
  } finally {
    isLoading.value = false
  }
})

watch([season, episode], () => {
  if (activeSourceId.value === 'embess') {
    const source = sources.value.find(item => item.id === 'embess')
    if (source && embessUrl.value) source.url = embessUrl.value
  }
})
</script>

<template>
  <div class="watch">
    <div class="container">
      <AppCrumbs :items="crumbs" />

      <header class="watch__head">
        <NuxtLink :to="`/movies/${slug}`" class="watch__back">
          <AppIcon name="arrow-left" :size="15" />
          <span>К тайтлу</span>
        </NuxtLink>
        <h1 v-if="film" class="watch__title">
          Смотреть {{ title }}<span v-if="year" class="watch__year"> ({{ year }})</span>
        </h1>
      </header>

      <div v-if="isLoading" class="watch__frame watch__frame--skeleton">
        <span class="watch__loading">Ищем источник видео</span>
      </div>

      <div v-else-if="!activeUrl" class="watch__frame watch__frame--state">
        <p class="watch__state-title">Плеер недоступен</p>
        <p class="watch__state-text">{{ error || 'У этого тайтла нет IMDb-идентификатора, по которому работает плеер.' }}</p>
        <div class="watch__state-actions">
          <NuxtLink :to="`/movies/${slug}`" class="btn btn--outline">К описанию</NuxtLink>
          <NuxtLink to="/movies" class="btn btn--quiet">Все фильмы</NuxtLink>
        </div>
      </div>

      <template v-else>
        <div class="watch__bar">
          <div class="watch__sources" v-if="sources.length > 1">
            <button
              v-for="source in sources"
              :key="source.id"
              type="button"
              class="watch__source"
              :class="{ 'watch__source--active': activeSourceId === source.id }"
              @click="activeSourceId = source.id"
            >
              {{ source.name }}
            </button>
          </div>

          <div v-if="isTv && seasonList.length" class="watch__episode-controls">
            <label class="watch__control">
              <span>Сезон</span>
              <select v-model.number="season" class="watch__select" @change="onSeasonChange">
                <option v-for="item in seasonList" :key="item.season_number" :value="item.season_number">
                  {{ item.season_number }}
                </option>
              </select>
            </label>

            <label class="watch__control">
              <span>Серия</span>
              <select v-model.number="episode" class="watch__select" @change="onEpisodeChange">
                <option v-for="n in episodeCount" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
          </div>
        </div>

        <div class="watch__frame">
          <iframe
            :key="activeUrl"
            :src="activeUrl"
            class="watch__player"
            frameborder="0"
            allowfullscreen
            allow="autoplay; fullscreen; encrypted-media"
            referrerpolicy="origin"
          />
        </div>

        <p class="watch__note">
          Плеер сторонний и может показывать рекламу. Если видео не запускается, попробуйте другой источник
          или отключите блокировщик для этого домена.
        </p>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.watch {
  padding-block: 20px 56px;

  @include respond(tablet) {
    padding-block: 28px 80px;
  }

  &__head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-block: 18px;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--ink);
    }
  }

  &__title {
    font-size: clamp(24px, 3.4vw, 38px);
  }

  &__year {
    color: var(--ink-3);
    font-weight: 400;
  }

  &__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
  }

  &__sources {
    display: flex;
    gap: 16px;
  }

  &__source {
    position: relative;
    padding-bottom: 6px;
    font-size: 13.5px;
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);

    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      bottom: 0;
      height: 2px;
      background: var(--lapis);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--dur) var(--ease);
    }

    &:hover {
      color: var(--ink-2);
    }

    &--active {
      color: var(--ink);

      &::after {
        transform: scaleX(1);
      }
    }
  }

  &__episode-controls {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  &__control {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: var(--ink-3);
  }

  &__select {
    height: 32px;
    padding: 0 22px 0 8px;
    background-color: transparent;
    background-image: linear-gradient(45deg, transparent 50%, var(--ink-3) 50%),
      linear-gradient(135deg, var(--ink-3) 50%, transparent 50%);
    background-position: calc(100% - 8px) 13px, calc(100% - 3px) 13px;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
    border-bottom: 1px solid var(--rule-strong);
    border-radius: 0;
    font-size: 13px;
    color: var(--ink);
    appearance: none;
    cursor: pointer;

    option {
      background: var(--paper-raised);
      color: var(--ink);
    }
  }

  &__frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    border: 1px solid var(--rule-strong);
    border-radius: 2px;
    overflow: hidden;

    &--skeleton {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--paper-sunk);
    }

    &--state {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 12px;
      padding: 24px;
      aspect-ratio: auto;
      min-height: 220px;
      background: var(--paper-raised);
    }
  }

  &__player {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
  }

  &__loading {
    font-size: 13px;
    color: var(--ink-3);
    animation: loading-pulse 1600ms var(--ease) infinite;
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

  &__state-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
  }

  &__note {
    margin-top: 12px;
    font-size: 12px;
    color: var(--ink-3);
  }
}

@keyframes loading-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}
</style>
