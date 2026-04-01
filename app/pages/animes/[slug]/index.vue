<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { 
  fetchAnimeDetails, 
  fetchRelatedAnimes
} from '@/lib/api/animeDetails'
import type { ShikimoriAnimeFull } from '@/types/shikimori'
import { slugify } from '@/utils/slugify'
import { useListsStore } from '@/stores/lists'
import { useAuthStore } from '@/stores/auth'
import { onClickOutside } from '@vueuse/core'

const route = useRoute()
const lists = useListsStore()
const auth = useAuthStore()
const slug = computed(() => (route.params.slug as string) || '')
const animeId = computed(() => slug.value.split('-')[0] || '')

const anime = ref<ShikimoriAnimeFull | null>(null)
const related = ref<any[]>([])
const playerUrl = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Dropdown state
const isListOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const playerSection = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => { isListOpen.value = false })

const currentRate = computed(() => anime.value ? lists.rateFor(anime.value.id) : null)

const statusLabels: Record<string, string> = {
  planned: 'В планах',
  watching: 'Смотрю',
  rewatching: 'Пересматриваю',
  completed: 'Просмотрено',
  on_hold: 'Отложено',
  dropped: 'Брошено'
}

const relatedTitles = computed(() => {
  return (related.value || [])
    .filter(r => !!r.anime)
    .sort((a, b) => (a.anime.airedOn?.year || 0) - (b.anime.airedOn?.year || 0))
    .map(r => r.anime)
})

function scrollToPlayer() {
  navigateTo(`/animes/${slug.value}/watch`)
}

async function handleSetStatus(status: string) {
  if (!anime.value) return
  await lists.setStatus(anime.value.id, status)
  isListOpen.value = false
}

// Formatters
function formatWatchTime(eps: number, dur: number) {
  const tot = eps * dur
  const h = Math.floor(tot / 60)
  const m = tot % 60
  let res = ''
  if (h > 0) res += `${h} часа`
  if (m > 0) res += `${h > 0 ? ', ' : ''}${m} минут`
  return res
}

function tSeason(s: string | null) {
  if (!s) return ''
  // Handle strings like 'winter_2026' by taking the first part
  const clean = s.split('_')[0]?.toLowerCase() || ''
  const m: Record<string, string> = { 
    'summer': 'Лето', 
    'winter': 'Зима', 
    'spring': 'Весна', 
    'fall': 'Осень' 
  }
  return m[clean] || s
}

function fKind(k: string | null) {
  if (!k) return '—'
  const m: Record<string, string> = { 
    'tv': 'ТВ-сериал', 
    'movie': 'Фильм', 
    'ova': 'OVA', 
    'ona': 'ONA', 
    'special': 'Спешл', 
    'music': 'Клип',
    'tv_13': 'ТВ-сериал',
    'tv_24': 'ТВ-сериал',
    'tv_48': 'ТВ-сериал'
  }
  return m[k.toLowerCase()] || k.toUpperCase()
}

function fRate(r: string | null) {
  if (!r) return ''
  const m: Record<string, string> = { 'g':'G', 'pg':'6+', 'pg_13':'12+', 'r':'16+', 'r_plus':'18+', 'rx':'18+' }
  return m[r.toLowerCase()] || r.toUpperCase().replace('R_', 'R')
}

const processedDescription = computed(() => {
  if (!anime.value?.descriptionHtml) return ''
  return anime.value.descriptionHtml.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
})

onMounted(async () => {
  try {
    isLoading.value = true
    const d = await fetchAnimeDetails(animeId.value)
    if (!d) throw new Error('Not found')
    anime.value = d
    
    if (auth.isAuthorized) {
        await lists.ensureRates()
    }

    const rl = await fetchRelatedAnimes(animeId.value)
    related.value = rl
    const k: any = await $fetch('/api/kodik/search', { params: { shikimori_id: d.id } })
    if (k?.results?.length > 0) playerUrl.value = k.results[0].link
    const title = d.russian || d.name
    const description = d.description ? d.description.slice(0, 160) + (d.description.length > 160 ? '...' : '') : 'Смотрите аниме на AniChrono'
    const image = d.poster?.originalUrl ? `https://shikimori.one${d.poster.originalUrl}` : '/logo.jpg'

    useSeoMeta({
      title: `${title} - AniChrono`,
      ogTitle: `${title} - AniChrono`,
      description,
      ogDescription: description,
      ogImage: image,
      twitterCard: 'summary_large_image',
      twitterTitle: `${title} - AniChrono`,
      twitterDescription: description,
      twitterImage: image
    })
  } catch (e: any) { error.value = e.message } finally { isLoading.value = false }
})
</script>

<template>
  <div class="anime-page-final">
    <div v-if="anime" class="container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumb-nav">
        <NuxtLink to="/" class="breadcrumb-item">Главная страница</NuxtLink>
        <NuxtLink to="/catalog" class="breadcrumb-item">Каталог релизов</NuxtLink>
        <span class="breadcrumb-item breadcrumb-item--active">{{ anime.russian || anime.name }}</span>
      </nav>

      <!-- Hero Header -->
      <header class="hero-header">
        <div class="hero-header__poster">
          <img :src="anime.poster?.originalUrl" :alt="anime.russian || ''">
        </div>
        
        <div class="hero-header__content">
          <h1 class="hero-header__title">{{ anime.russian }}</h1>
          <p class="hero-header__subtitle">{{ anime.name }}</p>

          <div class="hero-header__badges">
            <span class="b-status" v-if="anime.rating">{{ fRate(anime.rating) }}</span>
            <span class="b-status" v-if="anime.kind">{{ fKind(anime.kind) }}</span>
            <span class="b-status" v-if="anime.season || anime.airedOn?.year">
              {{ tSeason(anime.season) }} {{ anime.airedOn?.year }}
            </span>
          </div>

          <div class="hero-header__meta">
            <div class="meta-line">
              <span class="label">Жанры:</span>
              <span class="val">{{ anime.genres.map(g => g.russian).join(' • ') }}</span>
            </div>
            <div class="meta-line">
              <span class="label">Год выхода:</span>
              <span class="val">{{ anime.airedOn?.year || '—' }}</span>
            </div>
            <div class="meta-line">
              <span class="label">Длительность:</span>
              <span class="val">~ {{ anime.duration }} мин</span>
            </div>
            <div class="meta-line">
              <span class="label">Всего эпизодов:</span>
              <span class="val">{{ anime.episodes }} эпизодов</span>
            </div>
          </div>

          <div class="hero-header__actions">
            <!-- Watch Button -->
            <button v-if="playerUrl" class="btn-watch" @click="scrollToPlayer">
              <Icon name="solar:play-bold" size="18" />
              <span>Смотреть</span>
            </button>

            <!-- Lists Dropdown Section -->
            <div v-if="auth.isAuthorized" class="list-dropdown" ref="dropdownRef">
              <button 
                class="btn-list" 
                :class="{ 'btn-list--active': !!currentRate }"
                @click="isListOpen = !isListOpen"
              >
                <Icon :name="currentRate ? 'solar:clipboard-list-bold' : 'solar:add-circle-bold'" size="20" />
                <span>{{ currentRate ? statusLabels[currentRate.status] : 'В списки' }}</span>
                <Icon name="solar:alt-arrow-down-linear" size="16" class="arrow" :class="{ rotated: isListOpen }" />
              </button>
              
              <Transition name="dropdown">
                <div v-if="isListOpen" class="list-dropdown__menu">
                  <button 
                    v-for="(label, status) in statusLabels" 
                    :key="status"
                    class="menu-item"
                    :class="{ 'menu-item--active': currentRate?.status === status }"
                    @click="handleSetStatus(status)"
                  >
                    {{ label }}
                  </button>
                  <div class="divider" v-if="currentRate"></div>
                  <button v-if="currentRate" class="menu-item menu-item--danger" @click="lists.remove(anime.id); isListOpen = false">
                    Удалить из списка
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </header>

      <!-- Content sections -->
      <div class="page-content">
        <section class="desc-content">
          <div v-if="processedDescription" class="desc-content__html" v-html="processedDescription"></div>
          <div v-else class="desc-content__none">Описание отсутствует</div>
        </section>

        <!-- Related Swiper -->
        <section v-if="relatedTitles.length" class="related-content">
          <h2 class="block-title">Хронология</h2>
          <SwiperCards :items="relatedTitles" />
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.anime-page-final {
  min-height: 100vh;
  padding-bottom: 5rem;
  color: #fff;
  overflow-x: hidden;
  
  @include respond(tablet-l) {
    margin-top: 70px;
  }
}

.breadcrumb-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  padding: 1.5rem 0;
  font-size: 0.9rem;

  @include respond(mobile-l) { gap: 0.5rem 1rem; }

  .breadcrumb-item {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
    white-space: nowrap;

    &:hover { color: #fff; }

    &--active {
      color: #fff;
      font-weight: 700;
      white-space: normal;
      word-break: break-word;
    }
  }
}

.hero-header {
  display: flex;
  flex-direction: column; 
  gap: 2rem;
  margin-bottom: 3rem;

  @include respond(tablet-l) {
    flex-direction: row; 
    gap: 3.5rem;
  }

  &__poster {
    width: 100%; 
    max-width: 310px;
    margin: 0 auto;
    @include respond(tablet-l) { margin: 0; }
    flex-shrink: 0;
    border-radius: 16px;
    overflow: hidden;

    img {
      width: 100%;
      display: block;
      object-fit: cover;
      aspect-ratio: 2/3;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__title {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 0.5rem;
    word-break: break-all;
    hyphens: auto;

    @include respond(mobile-l) { font-size: 2.5rem; }
    @include respond(tablet-l) { font-size: 4rem; margin-bottom: 0.2rem; word-break: normal; }
  }

  &__subtitle {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 1.5rem;
  }

  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-bottom: 2rem;
  }

  .b-status {
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.85rem;
    border: 1px solid #333;
    background: rgba(255, 255, 255, 0.05);
    color: #aaa;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 2.5rem;
  }

  .meta-line {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.5rem;
    font-size: 1rem;
    
    .label { color: #555; }
    .val { font-weight: 700; color: #fff; }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: auto;
    @include respond(tablet-l) { margin-top: 2rem; }
  }
}

.btn-watch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: #2a2a2a;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: #333; }
}

.list-dropdown {
  position: relative;
  display: inline-block;
  
  .btn-list {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: #1a1a1a;
    color: #fff;
    border: 1px solid #333;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: #222; border-color: #444; }

    &--active {
      border-color: #2ecc71;
    }

    .arrow {
      margin-left: 8px;
      transition: transform 0.2s;
      opacity: 0.5;
      &.rotated { transform: rotate(180deg); }
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 200px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 8px;
    z-index: 100;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .menu-item {
    padding: 10px 14px;
    border-radius: 8px;
    background: none;
    border: none;
    color: #999;
    text-align: left;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { background: #222; color: #fff; }

    &--active {
      background: rgba(46, 204, 113, 0.1);
      color: #2ecc71;
    }

    &--danger {
      color: #ef5350;
      &:hover { background: rgba(239, 83, 80, 0.1); }
    }
  }

  .divider {
    height: 1px;
    background: #333;
    margin: 4px 6px;
  }
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.related-content {
  .block-title { margin-bottom: 0.5rem; }
}

.desc-content {
  &__html {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #999;
    word-break: break-word;
  }
  &__none {
    color: #666;
    font-style: italic;
  }
}

.block-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

// Transitions
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.2s, transform 0.2s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-10px); }
</style>