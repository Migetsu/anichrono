<script setup lang="ts">
import { shikiGQL } from '~/lib/api/shikiClient'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import type { AnimeRate } from '@/stores/lists'
import type { ShikimoriAnimeListItem, AnimesQueryResponse } from '@/types/shikimori'
import { ANIME_DETAILS_QUERY } from '~/lib/api/queries'
import { slugify } from '@/utils/slugify'

const auth = useAuthStore()
const lists = useListsStore()

definePageMeta({
  middleware: [
    async function (to) {
      if (import.meta.server) return
      const auth = useAuthStore()
      if (!auth.isAuthorized) {
         auth.login(to.fullPath)
         return abortNavigation()
      }
      if (!auth.isLoggedIn) {
         try {
           await auth.fetchMe()
         } catch(e) {}
         if (!auth.isLoggedIn) {
           auth.login(to.fullPath)
           return abortNavigation()
         }
      }
    }
  ]
})

const animeMap = ref<Map<number, ShikimoriAnimeListItem>>(new Map())
const loadingAnimes = ref(false)

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

const recentHistory = ref<any[]>([])

onMounted(async () => {
  await lists.ensureRates()

  if (auth.user?.id) {
    try {
      const historyData = await $fetch<any[]>(`/api/user/history?id=${auth.user.id}&limit=3`)
      recentHistory.value = (historyData || []).slice(0, 3)
    } catch(e) {
      console.warn('Failed to load history', e)
    }
  }

  const ids = new Set(lists.rates.map(r => r.target_id).filter(Boolean))
  recentHistory.value.forEach(h => {
    if (h.target?.id) ids.add(h.target.id)
  })

  await loadAnimeDetails(Array.from(ids))
})

const activeTab = ref('watching')
const activeSection = computed(() => {
  return listSections.value.find(s => s.key === activeTab.value) || listSections.value[0]
})

const statusLabels: Record<string, string> = {
  planned: 'В планах',
  watching: 'Смотрю',
  rewatching: 'Пересматриваю',
  completed: 'Просмотрено',
  on_hold: 'Отложено',
  dropped: 'Брошено',
}

const statusColors: Record<string, string> = {
  planned:    '#64b5f6',
  watching:   '#4caf50',
  rewatching: '#00bcd4',
  completed:  '#a5d6a7',
  on_hold:    '#ffb74d',
  dropped:    '#ef5350',
}

const listSections = computed(() => {
  return Object.entries(statusLabels).map(([key, label]) => ({
    key,
    label,
    items: lists.rates.filter(r => r.status === key)
  }))
})

const totalCount = computed(() => lists.rates.length)

function getAnime(rate: AnimeRate) {
  return animeMap.value.get(Number(rate.target_id))
}

function getHistoryAnime(id: number | undefined) {
  if (!id) return null
  return animeMap.value.get(Number(id)) || null
}

function getHistoryColor(text: string) {
  if (text.includes('смотрит')) return '#4caf50'
  if (text.includes('бросил')) return '#ef5350'
  if (text.includes('заплани')) return '#64b5f6'
  if (text.includes('просмотрено')) return '#a5d6a7'
  if (text.includes('оцен')) return '#ffca28'
  return '#00bcd4'
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function posterOf(anime: ShikimoriAnimeListItem | null): string {
  if (!anime) return ''
  return anime.poster?.mainUrl || anime.poster?.originalUrl || ''
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-hero">
      <div class="container profile-hero-content">
        <div class="user-identity">
          <div class="user-identity-avatar-wrap">
            <img
              v-if="auth.user?.image?.x160"
              :src="auth.user.image.x160"
              :alt="auth.user.nickname"
              class="user-identity-avatar"
            >
            <div v-else class="user-identity-placeholder">
              <Icon name="solar:user-circle-bold-duotone" size="64" />
            </div>
            <div class="user-identity-indicator">
              <div class="user-identity-pulse"></div>
            </div>
          </div>

          <div class="user-identity-info">
            <h1 class="user-identity-name">{{ auth.user?.nickname }}</h1>
            <div class="user-identity-actions">
              <a
                :href="`https://shikimori.io/${auth.user?.nickname}`"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-action btn-action-info"
              >
                <Icon name="solar:arrow-right-up-linear" size="18" />
                <span>Shikimori</span>
              </a>
              <button class="btn-action btn-action-danger" @click="auth.logout()">
                <Icon name="solar:logout-3-bold-duotone" size="18" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container profile-content">
      <div v-if="lists.loading || loadingAnimes" class="profile-loading">
        <div class="profile-loading-spinner"></div>
        <p>Синхронизация...</p>
      </div>

      <template v-else>
        <section v-if="recentHistory.length" class="profile-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-title-accent"></span>
              История изменений
            </h2>
          </div>

          <div class="history-list">
            <NuxtLink
              v-for="item in recentHistory"
              :key="item.id"
              :to="item.target?.id ? `/animes/${item.target.id}-${slugify(item.target.name || '')}` : '#'"
              class="history-card"
            >
              <div class="history-card-poster-wrap">
                <img
                  v-if="posterOf(getHistoryAnime(item.target?.id)) || (item.target?.image?.original ? `https://shikimori.io${item.target.image.original}` : '')"
                  :src="posterOf(getHistoryAnime(item.target?.id)) || (item.target?.image?.original ? `https://shikimori.io${item.target.image.original}` : '')"
                  class="history-card-poster"
                  :alt="item.target?.russian || item.target?.name || ''"
                >
                <div v-else class="history-card-poster history-card-poster-empty">
                  <Icon name="solar:gallery-remove-bold-duotone" size="24" />
                </div>
                <div 
                  class="history-card-badge" 
                  :style="{ backgroundColor: getHistoryColor(item.description) }"
                >
                  <Icon name="solar:history-bold" size="14" />
                </div>
              </div>

              <div class="history-card-content">
                <h3 class="history-card-title">
                  {{ item.target?.russian || item.target?.name || `Тайтл удален` }}
                </h3>
                <span class="history-card-status" :style="{ color: getHistoryColor(item.description) }">
                  {{ item.description }}
                </span>
                <span class="history-card-date">{{ formatDate(item.created_at) }}</span>
              </div>
            </NuxtLink>
          </div>
        </section>

        <section v-if="listSections.length" class="profile-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-title-accent"></span>
              Списки аниме
            </h2>
          </div>

          <div class="tabs-list">
            <button
              v-for="s in listSections"
              :key="s.key"
              class="tabs-item"
              :class="{ 'tabs-item-active': activeTab === s.key }"
              :style="{ '--tab-color': statusColors[s.key] }"
              @click="activeTab = s.key"
            >
              {{ s.label }}
              <span class="tabs-item-count">{{ s.items.length }}</span>
            </button>
          </div>

          <div class="profile-grid" v-if="activeSection">
            <template v-for="rate in activeSection.items" :key="rate.id">
              <TitleCard
                v-if="getAnime(rate)"
                :item="getAnime(rate)!"
              />
            </template>
            <template v-if="loadingAnimes">
              <div
                v-for="rate in activeSection.items"
                :key="'sk-' + rate.id"
                class="profile-skeleton"
              ></div>
            </template>
          </div>
        </section>

        <div v-if="!lists.loading && !loadingAnimes && !totalCount" class="profile-empty">
          <Icon name="solar:ghost-bold-duotone" size="64" class="profile-empty-icon" />
          <h2 class="profile-empty-title">Списки пусты</h2>
          <NuxtLink to="/catalog" class="btn-action btn-action-primary">
            Каталог
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  padding-bottom: 80px;
  margin-top: 70px;
}

.profile-hero {
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 2rem;
  margin-bottom: 20px;
  overflow: visible;
  background: none;

  @media (max-width: 768px) {
    min-height: unset;
    align-items: center;
    padding: 2rem 0;
  }
}


.user-identity {
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    gap: 16px;
  }

  &-avatar-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 24px;
    overflow: visible;
  }

  &-avatar {
    width: 100%;
    height: 100%;
    border-radius: 24px;
    object-fit: cover;
  }

  &-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }

  &-indicator {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: var(--bg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-pulse {
    width: 12px;
    height: 12px;
    background: var(--cyan);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--cyan);
  }

  &-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &-name {
    font-size: 2.2rem;
    font-weight: 800;
    color: #fff;
    margin: 0;
  }

  &-actions {
    display: flex;
    gap: 8px;
  }
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;

  &-info {
    background: var(--surface2);
    color: var(--text);
    border: 1px solid var(--border);
    &:hover { background: var(--surface3); }
  }

  &-danger {
    background: rgba(var(--accent), 0.1);
    color: var(--accent);
    border: 1px solid var(--border);
    &:hover { background: rgba(var(--accent), 0.2); }
  }

  &-primary {
    background: var(--accent);
    color: #fff;
    &:hover { background: var(--accent2); }
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    margin: 0;

    &-accent {
      width: 4px;
      height: 16px;
      background: var(--accent);
      border-radius: 2px;
    }
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    background: var(--surface2);
    transform: translateX(4px);
  }

  &-poster-wrap {
    position: relative;
    width: 60px;
    height: 84px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }

  &-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  &-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  &-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
  }

  &-status {
    font-size: 0.85rem;
  }

  &-date {
    font-size: 0.75rem;
    color: var(--muted);
  }
}

.tabs-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.tabs-item {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;

  &-active {
    background: var(--tab-color, var(--accent));
    color: #fff;
    border-color: transparent;
  }

  &-count {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-left: 4px;
  }
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.profile-skeleton {
  aspect-ratio: 2/3;
  background: var(--surface2);
  border-radius: 12px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.profile-empty {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--muted);
}

.profile-loading {
  padding: 100px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--muted);

  &-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>