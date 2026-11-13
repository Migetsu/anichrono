<script setup lang="ts">
import { shikiGQL } from '~/lib/api/shikiClient'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import type { AnimeRate } from '@/stores/lists'
import type { ShikimoriAnimeListItem, AnimesQueryResponse } from '@/types/shikimori'
import { ANIME_DETAILS_QUERY } from '~/lib/api/queries'
import { slugify } from '@/utils/slugify'
import AppIcon from '@/components/ui/AppIcon.vue'

const auth = useAuthStore()
const lists = useListsStore()

useSeoMeta({
  title: 'Профиль — AniChrono',
  robots: 'noindex, nofollow',
})

definePageMeta({
  middleware: [
    async function (to) {
      if (import.meta.server) return
      const authStore = useAuthStore()
      if (!authStore.isAuthorized) {
        authStore.login(to.fullPath)
        return abortNavigation()
      }
      if (!authStore.isLoggedIn) {
        try {
          await authStore.fetchMe()
        } catch {}
        if (!authStore.isLoggedIn) {
          authStore.login(to.fullPath)
          return abortNavigation()
        }
      }
    },
  ],
})

const animeMap = ref<Map<number, ShikimoriAnimeListItem>>(new Map())
const loadingAnimes = ref(false)
const recentHistory = ref<Array<{
  id: number
  description: string
  created_at: string
  target?: { id: number, name: string, russian?: string, image?: { original?: string } } | null
}>>([])

async function loadAnimeDetails(ids: number[]) {
  if (!ids.length) return
  loadingAnimes.value = true
  try {
    const chunkSize = 50
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize)
      const data = await shikiGQL<AnimesQueryResponse>(ANIME_DETAILS_QUERY, {
        ids: chunk.map(String).join(','),
        limit: chunk.length,
      })
      data?.animes?.forEach(anime => animeMap.value.set(Number(anime.id), anime))
    }
  } catch (e) {
    console.error('Failed to load anime details', e)
  } finally {
    loadingAnimes.value = false
  }
}

onMounted(async () => {
  await lists.ensureRates()

  if (auth.user?.id) {
    try {
      const historyData = await $fetch<typeof recentHistory.value>(
        `/api/user/history?id=${auth.user.id}&limit=3`,
      )
      recentHistory.value = (historyData || []).slice(0, 3)
    } catch {
      recentHistory.value = []
    }
  }

  const ids = new Set(lists.rates.map(rate => rate.target_id).filter(Boolean))
  recentHistory.value.forEach(entry => {
    if (entry.target?.id) ids.add(entry.target.id)
  })

  await loadAnimeDetails(Array.from(ids))
})

const statusLabels: Record<string, string> = {
  planned: 'В планах',
  watching: 'Смотрю',
  rewatching: 'Пересматриваю',
  completed: 'Просмотрено',
  on_hold: 'Отложено',
  dropped: 'Брошено',
}

const activeTab = ref('watching')

const listSections = computed(() =>
  Object.entries(statusLabels).map(([key, label]) => ({
    key,
    label,
    items: lists.rates.filter(rate => rate.status === key),
  })),
)

const activeSection = computed(() => listSections.value.find(section => section.key === activeTab.value))

const stats = computed(() => {
  const count = (status: string) => lists.rates.filter(rate => rate.status === status).length
  return [
    { label: 'Всего', value: lists.rates.length },
    { label: 'Смотрю', value: count('watching') },
    { label: 'Просмотрено', value: count('completed') },
    { label: 'В планах', value: count('planned') },
  ]
})

function getAnime(rate: AnimeRate) {
  return animeMap.value.get(Number(rate.target_id))
}

function posterOf(anime: ShikimoriAnimeListItem | null): string {
  if (!anime) return ''
  return anime.poster?.mainUrl || anime.poster?.originalUrl || ''
}

function historyPoster(entry: typeof recentHistory.value[number]) {
  const anime = entry.target?.id ? animeMap.value.get(Number(entry.target.id)) : null
  const fromMap = posterOf(anime ?? null)
  if (fromMap) return fromMap
  if (entry.target?.image?.original) return `https://shikimori.io${entry.target.image.original}`
  return ''
}

function historyTone(description: string) {
  if (description.includes('бросил')) return 'seal'
  if (description.includes('смотрит')) return 'lapis'
  if (description.includes('заплани')) return 'muted'
  if (description.includes('оцен')) return 'signal'
  return 'ink'
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="profile">
    <div class="container">
      <header class="profile__head">
        <div class="profile__avatar">
          <img v-if="auth.user?.image?.x160" :src="auth.user.image.x160" :alt="auth.user.nickname">
          <AppIcon v-else name="user" :size="34" />
        </div>

        <div class="profile__identity">
          <p class="profile__label">Профиль</p>
          <h1 class="profile__name">{{ auth.user?.nickname }}</h1>

          <div class="profile__links">
            <a
              :href="`https://shikimori.io/${auth.user?.nickname}`"
              target="_blank"
              rel="noopener noreferrer"
              class="profile__link"
            >
              <span>Профиль на Shikimori</span>
              <AppIcon name="arrow-up-right" :size="14" />
            </a>
            <button type="button" class="profile__logout" @click="auth.logout()">
              <AppIcon name="logout" :size="14" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <dl class="profile__stats">
        <div v-for="stat in stats" :key="stat.label" class="profile__stat">
          <dt class="profile__stat-label">{{ stat.label }}</dt>
          <dd class="profile__stat-value tabular">{{ stat.value }}</dd>
        </div>
      </dl>

      <div v-if="lists.loading || loadingAnimes" class="profile__grid">
        <span v-for="n in 10" :key="n" class="profile__skeleton"></span>
      </div>

      <template v-else>
        <section v-if="recentHistory.length" class="section profile__section">
          <div class="section-head">
            <h2 class="section-title">История</h2>
            <span class="section-meta">Последние изменения в списках</span>
          </div>

          <ul class="history">
            <li v-for="entry in recentHistory" :key="entry.id" class="history__row">
              <NuxtLink
                :to="entry.target?.id ? `/animes/${entry.target.id}-${slugify(entry.target.name || '')}` : '/catalog'"
                class="history__link"
              >
                <span class="history__poster">
                  <img v-if="historyPoster(entry)" :src="historyPoster(entry)" alt="" loading="lazy">
                </span>
                <span class="history__body">
                  <span class="history__title">{{ entry.target?.russian || entry.target?.name || 'Тайтл удалён' }}</span>
                  <span class="history__status" :class="`history__status--${historyTone(entry.description)}`">
                    {{ entry.description }}
                  </span>
                </span>
                <span class="history__date tabular">{{ formatDate(entry.created_at) }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section class="section profile__section">
          <div class="section-head">
            <h2 class="section-title">Списки</h2>
            <span class="section-meta">{{ lists.rates.length }} тайтлов</span>
          </div>

          <div class="tabs" role="tablist">
            <button
              v-for="section in listSections"
              :key="section.key"
              type="button"
              class="tabs__item"
              :class="{ 'tabs__item--active': activeTab === section.key }"
              role="tab"
              :aria-selected="activeTab === section.key"
              @click="activeTab = section.key"
            >
              <span>{{ section.label }}</span>
              <span class="tabs__count tabular">{{ section.items.length }}</span>
            </button>
          </div>

          <div v-if="activeSection?.items.length" class="profile__grid">
            <template v-for="rate in activeSection.items" :key="rate.id">
              <TitleCard v-if="getAnime(rate)" :item="getAnime(rate)!" />
            </template>
          </div>

          <div v-else class="profile__empty">
            <p class="profile__empty-title">В этом списке пусто</p>
            <p class="profile__empty-text">Отметьте тайтл в каталоге — он появится здесь.</p>
            <NuxtLink to="/catalog" class="btn btn--outline">В каталог</NuxtLink>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile {
  padding-block: 28px 64px;

  @include respond(tablet) {
    padding-block: 40px 88px;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 20px;
    padding-bottom: 24px;

    @include respond(mobile-l) {
      gap: 28px;
    }
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 78px;
    height: 78px;
    flex: none;
    overflow: hidden;
    background: var(--paper-raised);
    border: 1px solid var(--rule-strong);
    border-radius: 2px;
    color: var(--ink-3);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @include respond(tablet) {
      width: 96px;
      height: 96px;
    }
  }

  &__identity {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__label {
    font-size: 12px;
    color: var(--ink-3);
  }

  &__name {
    font-size: clamp(26px, 4vw, 38px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    margin-top: 6px;
  }

  &__link,
  &__logout {
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

  &__logout:hover {
    color: var(--seal);
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--rule-strong);
    border-bottom: 1px solid var(--rule);
    margin-bottom: 8px;

    @include respond(tablet) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  &__stat {
    padding: 12px 16px 12px 0;
    border-right: 1px solid var(--rule);

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      border-right: 0;
    }

    @include respond(tablet) {
      padding: 14px 20px;
    }
  }

  &__stat-label {
    font-size: 11.5px;
    color: var(--ink-3);
    margin-bottom: 2px;
  }

  &__stat-value {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 500;
    line-height: 1.1;
  }

  &__section {
    padding-block: 40px 0;

    :deep(.section-head) {
      margin-bottom: 16px;
    }

    @include respond(tablet) {
      padding-block: 48px 0;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 18px 10px;

    @include respond(tablet) {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 24px 14px;
    }

    @include respond(laptop) {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 28px 18px;
    }
  }

  &__skeleton {
    display: block;
    aspect-ratio: 2 / 3;
    background: var(--paper-sunk);
    border-radius: 2px;
    animation: skeleton-pulse 1600ms var(--ease) infinite;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding-block: 32px;
  }

  &__empty-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
  }

  &__empty-text {
    font-size: 14px;
    color: var(--ink-3);
    margin-bottom: 6px;
  }
}

.history {
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

    &:hover {
      background: var(--paper-raised);

      .history__title {
        color: var(--lapis-deep);
      }
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

  &__title {
    font-size: 14.5px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color var(--dur-fast) var(--ease);
  }

  &__status {
    font-size: 12.5px;

    &--seal {
      color: var(--seal);
    }

    &--lapis {
      color: var(--lapis-deep);
    }

    &--signal {
      color: var(--signal);
    }

    &--muted {
      color: var(--ink-3);
    }

    &--ink {
      color: var(--ink-2);
    }
  }

  &__date {
    font-size: 12px;
    color: var(--ink-3);
    white-space: nowrap;
  }
}

.tabs {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--rule);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &__item {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 0 0 10px;
    white-space: nowrap;
    font-size: 14px;
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);

    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      bottom: -1px;
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

  &__count {
    font-size: 12px;
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
