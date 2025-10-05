<template>
  <main class="profile">
    <div class="profile-container">
    
      <header class="profile-header">
        <div class="profile-header__avatar-section">
          <img class="profile-header__avatar" :src="avatarUrl" alt="avatar" />
          <div class="profile-header__status">в сети</div>
        </div>
        
        <div class="profile-header__info">
          <h1 class="profile-header__nickname">{{ nickname }}</h1>
          <div class="profile-header__meta">
            <div class="profile-meta-item">
              <font-awesome-icon icon="fa-regular fa-calendar" />
              <span>На сайте с {{ registrationDate }}</span>
            </div>
            <div class="profile-meta-item" v-if="auth?.user?.email">
              <font-awesome-icon icon="fa-regular fa-envelope" />
              <span>{{ auth.user.email }}</span>
            </div>
          </div>
          <div class="profile-header__actions">
            <button class="btn btn-settings" @click="openSettings">
              <font-awesome-icon icon="fa-solid fa-gear" />
              Настройки
            </button>
            <button class="btn btn-shikimori" @click="openShikimoriProfile">
              <font-awesome-icon icon="fa-solid fa-external-link-alt" />
              Профиль шикимори
            </button>
            <button class="btn btn-logout" @click="logout">
              <font-awesome-icon icon="fa-solid fa-right-from-bracket" />
              Выйти
            </button>
          </div>
      </div>
    </header>

      
      <div class="profile-stats">
        <div class="stat-card">
          <div class="stat-card__value">{{ totalAnime }}</div>
          <div class="stat-card__label">Всего аниме</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ groupedLists.watching.length }}</div>
          <div class="stat-card__label">Смотрю</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ groupedLists.completed.length }}</div>
          <div class="stat-card__label">Просмотрено</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ groupedLists.planned.length }}</div>
          <div class="stat-card__label">Запланировано</div>
        </div>
      </div>

      
      <section class="profile-section history-section" v-if="userHistory.length">
        <RouterLink to="/history" class="section-title section-title--link">
          <font-awesome-icon icon="fa-solid fa-clock-rotate-left" />
          История
          <font-awesome-icon icon="fa-solid fa-chevron-right" class="section-title__arrow" />
        </RouterLink>
        <div class="history-list">
          <div 
            v-for="(item, index) in userHistory.slice(0, 3)" 
            :key="index"
            class="history-item"
          >
            <div class="history-item__icon" :class="getHistoryActionClass(item.action)">
              <font-awesome-icon :icon="getHistoryIcon(item.action)" />
            </div>
            <div class="history-item__content">
              <RouterLink 
                :to="`/animes/${item.anime_id}`"
                class="history-item__title"
              >
                {{ item.anime_title }}
              </RouterLink>
              <div class="history-item__meta">
                <span class="history-item__action">{{ getHistoryActionText(item.action, item.status) }}</span>
                <span class="history-item__date">{{ formatHistoryDate(item.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section class="profile-section activity-section">
        <h2 class="section-title">
          <font-awesome-icon icon="fa-solid fa-chart-line" />
          Активность
        </h2>
        <div class="activity-stats">
          <div class="activity-item">
            <font-awesome-icon icon="fa-solid fa-clock" class="activity-icon" />
            <div class="activity-info">
              <div class="activity-value">{{ userLastOnline }}</div>
              <div class="activity-label">Последняя активность</div>
            </div>
          </div>
          <div class="activity-item">
            <font-awesome-icon icon="fa-solid fa-eye" class="activity-icon" />
            <div class="activity-info">
              <div class="activity-value">{{ totalWatchTime }}</div>
              <div class="activity-label">Времени за просмотром</div>
            </div>
          </div>
        </div>
      </section>

      
      <section class="profile-section lists-section">
        <div class="lists-header">
          <h2 class="section-title">
            <font-awesome-icon icon="fa-solid fa-list" />
            Списки аниме
          </h2>
          
          <div class="search-box">
            <font-awesome-icon icon="fa-solid fa-search" class="search-box__icon" />
            <input 
              v-model="searchQuery"
              type="text" 
              class="search-box__input"
              :placeholder="`Поиск в ${currentTabTitle}...`"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="search-box__clear"
            >
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
        </div>
        
        <div class="lists-tabs">
          <button 
            v-for="tab in statuses" 
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.title }}
            <span class="tab-count">{{ groupedLists[tab.key].length }}</span>
          </button>
        </div>

        <div class="lists-content">
          <div v-if="loading" class="lists-loading">
            <font-awesome-icon icon="fa-solid fa-spinner" spin />
            Загрузка...
          </div>
          <div v-else-if="error" class="lists-error">{{ error }}</div>
          
          <div v-else class="anime-grid">
            <template v-if="filteredAnimeList.length > 0">
              <RouterLink 
                v-for="rate in filteredAnimeList" 
                :key="rate.id || rate.target_id"
                :to="`/animes/${rateId(rate)}`"
                class="anime-card"
                v-inview="rate"
              >
                <div class="anime-card__image" :style="cardBg(rate)"></div>
                <div class="anime-card__overlay"></div>
                <div class="anime-card__content">
                  <div class="anime-card__title">{{ getAnimeName(rate) }}</div>
                  <div class="anime-card__meta" v-if="rate.score">
                    <font-awesome-icon icon="fa-solid fa-star" />
                    {{ rate.score }}
                </div>
              </div>
            </RouterLink>
      </template>
            
            <div v-else class="empty-state">
              <font-awesome-icon :icon="searchQuery ? 'fa-solid fa-search' : 'fa-regular fa-folder-open'" />
              <p v-if="searchQuery">
                Ничего не найдено по запросу "{{ searchQuery }}"
              </p>
              <p v-else>Список пуст</p>
            </div>
          </div>
        </div>
    </section>
    </div>
  </main>
  <Footer />
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, reactive, ref } from 'vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import { fetchAnimeById } from '@/api/searchAnimeById'

const auth = useAuthStore()
const lists = useListsStore()
const activeTab = ref('watching')
const searchQuery = ref('')

async function pullRates(force = false) {
  if (!auth?.token || !auth?.user?.id) return
  if (lists.loading) return
  if (force || !lists.rates.length) {
    try { await lists.fetchRates() } catch { }
  }
}

onMounted(() => {
  // Временная отладка для проверки данных пользователя
  console.log('=== ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ===')
  console.log('Полный объект user:', JSON.parse(JSON.stringify(auth.user || {})))
  console.log('========================')
  pullRates(true)
  loadUserHistory()
})

watch(() => [auth?.token, auth?.user?.id], () => {
  pullRates(true)
  loadUserHistory()
})

onUnmounted(() => {
  // Очищаем таймеры при размонтировании
  if (visibleBatchTimeout) {
    clearTimeout(visibleBatchTimeout)
  }
})

function toAbs(url) {
  if (!url) return ''
  // Handle protocol-relative URLs like //shikimori.one/path
  if (url.startsWith('//')) return `https:${url}`
  if (/^https?:\/\//i.test(url)) return url
  return `https://shikimori.one${url}`
}

function collectCandidates(src) {
  if (!src) return []
  const list = [
    src.poster?.originalUrl,
    src.poster?.previewUrl,
    src.image?.original,
    src.image?.preview,
    src.image?.x256,
    src.image?.x192,
    src.image?.x96,
    src.image?.x48,
  ]
  return list.filter(Boolean).map(toAbs)
}

const avatarUrl = computed(() => {
  const u = auth?.user ?? {}
  
  
  const cand = [
    u.image?.x160,  
    u.image?.x148,  
    u.avatar,       
    u.avatar_url,   
    u.image?.x80,   
    u.profile?.avatar, 
    u.image?.x48    
  ]
  
  
  console.log('🔍 Доступные аватары:', {
    x160: u.image?.x160,
    x148: u.image?.x148,
    avatar: u.avatar,
    avatar_url: u.avatar_url,
    x80: u.image?.x80,
    profile_avatar: u.profile?.avatar,
    x48: u.image?.x48
  })
  
  for (const x of cand) {
    if (x) {
      const finalUrl = toAbs(x)
      console.log('✅ Выбран аватар:', finalUrl)
      return finalUrl
    }
  }
  
  console.log('❌ Аватар не найден, используем дефолтный')
  return '/avatar.svg'
})

const nickname = computed(() => {
  return auth?.user?.nickname || auth?.user?.name || auth?.user?.login || '—'
})

function logout() {
  auth.logout()
}

function openSettings() {
  
  alert('Настройки профиля в разработке')
}

function openShikimoriProfile() {
  if (auth?.user?.id) {
    window.open(`https://shikimori.one/${auth.user.nickname}`, '_blank')
  }
}


const registrationDate = computed(() => {
  const user = auth?.user
  if (!user) return '—'
  
  console.log('=== ОТЛАДКА ДАТЫ РЕГИСТРАЦИИ ===')
  console.log('Весь объект user:', user)
  console.log('user.website:', user.website)
  console.log('user.created_at:', user.created_at)
  console.log('user.full_years:', user.full_years)
  console.log('user.common_info:', user.common_info)
  console.log('user.stats:', user.stats)
  console.log('===================================')
  
  
  if (user.common_info && Array.isArray(user.common_info)) {
    
    for (const info of user.common_info) {
      console.log('Проверяем common_info элемент:', info)
      if (info && info[0] && typeof info[0] === 'string') {
        
        if (info[0].toLowerCase().includes('сайте')) {
          const value = info[1] || info[0]
          console.log('Найдена дата регистрации в common_info:', value)
          return value
        }
      }
    }
  }
  
  
  if (user.stats && user.stats.full_statuses) {
    console.log('stats.full_statuses:', user.stats.full_statuses)
  }
  
  
  if (user.created_at) {
    const date = new Date(user.created_at)
    if (!isNaN(date.getTime())) {
      const month = date.toLocaleDateString('ru-RU', { month: 'long' })
      const year = date.getFullYear()
      return `с ${month} ${year} г.`
    }
  }
  
  
  if (user.website && typeof user.website === 'string' && user.website.includes('сайте')) {
    return user.website
  }
  
  console.log('❌ Дата регистрации не найдена!')
  return 'неизвестно'
})


const userLastOnline = computed(() => {
  const user = auth?.user
  if (!user) return '—'
  
  
  const lastOnline = user.last_online_at || user.last_online || user.stats?.time_online
  
  if (!lastOnline) {
    
    if (user.common_info && Array.isArray(user.common_info)) {
      
      const timeInfo = user.common_info.find(info => 
        info.name && (info.name.includes('Время') || info.name.includes('время'))
      )
      if (timeInfo && timeInfo.value) {
        return timeInfo.value
      }
    }
    return '—'
  }
  
  
  if (typeof lastOnline === 'number') {
    
    if (lastOnline < 1000) {
      return `${lastOnline} ч`
    }
    
    const date = new Date(lastOnline)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60 / 60) 
    if (diff < 1) return 'менее часа назад'
    if (diff < 24) return `${diff} ч назад`
    const days = Math.floor(diff / 24)
    return `${days} дн назад`
  }
  
  
  if (typeof lastOnline === 'string') {
    
    if (lastOnline.match(/\d+\s*(час|ч|дн|день|день|минут)/i)) {
      return lastOnline
    }
    
    
    const date = new Date(lastOnline)
    if (!isNaN(date.getTime())) {
      const now = new Date()
      const diff = Math.floor((now - date) / 1000 / 60 / 60)
      if (diff < 1) return 'менее часа назад'
      if (diff < 24) return `${diff} ч назад`
      const days = Math.floor(diff / 24)
      return `${days} дн назад`
    }
  }
  
  return '—'
})


const totalAnime = computed(() => {
  return lists.rates.length || 0
})


const userHistory = ref([])


async function loadUserHistory() {
  if (!auth?.user?.id) return
  
  try {
    const response = await fetch(`/api/user-history?user_id=${auth.user.id}&limit=3`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('История пользователя:', data) 
      userHistory.value = data.map(item => ({
        anime_id: item.target?.id || 0,
        anime_title: item.target?.russian || item.target?.name || `Аниме #${item.target?.id}`,
        action: item.description || '',
        status: extractStatus(item.description),
        date: item.created_at
      }))
    }
  } catch (error) {
    console.error('Ошибка загрузки истории:', error)
  }
}

// Извлекаем статус из описания
function extractStatus(description) {
  if (!description) return ''
  const statusMap = {
    'Запланировано': 'planned',
    'Смотрю': 'watching',
    'Просмотрено': 'completed',
    'Отложено': 'on_hold',
    'Брошено': 'dropped',
    'Пересматриваю': 'rewatching'
  }
  
  for (const [key, value] of Object.entries(statusMap)) {
    if (description.includes(key)) return key
  }
  
  return description
}


function getHistoryIcon(action) {
  if (action.includes('Добавлено') || action.includes('добавлен')) {
    return 'fa-solid fa-plus'
  }
  if (action.includes('Удалено') || action.includes('удален')) {
    return 'fa-solid fa-trash'
  }
  if (action.includes('Изменено') || action.includes('изменен')) {
    return 'fa-solid fa-pen'
  }
  return 'fa-solid fa-clock'
}


function getHistoryActionClass(action) {
  if (action.includes('Добавлено') || action.includes('добавлен')) {
    return 'action-add'
  }
  if (action.includes('Удалено') || action.includes('удален')) {
    return 'action-remove'
  }
  return 'action-change'
}


function getHistoryActionText(action, status) {
  return action || status || 'Изменение в списке'
}


function formatHistoryDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}


const totalWatchTime = computed(() => {
  const total = lists.rates.length
  if (total === 0) return '0 часов'
  
  
  const hours = Math.round((total * 12 * 24) / 60)
  
  if (hours < 24) return `${hours} ч`
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  
  return remainingHours > 0 
    ? `${days} дн ${remainingHours} ч` 
    : `${days} дней`
})

const groupedLists = computed(() => ({
  planned: lists.grouped?.planned ?? [],
  watching: lists.grouped?.watching ?? [],
  rewatching: lists.grouped?.rewatching ?? [],
  completed: lists.grouped?.completed ?? [],
  on_hold: lists.grouped?.on_hold ?? [],
  dropped: lists.grouped?.dropped ?? [],
}))


const currentTabTitle = computed(() => {
  const tab = statuses.find(s => s.key === activeTab.value)
  return tab ? tab.title : 'списке'
})


const filteredAnimeList = computed(() => {
  const currentList = groupedLists.value[activeTab.value] || []
  
  if (!searchQuery.value.trim()) {
    return currentList
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return currentList.filter(rate => {
    const animeName = getAnimeName(rate).toLowerCase()
    return animeName.includes(query)
  })
})

const loading = computed(() => lists.loading)
const error = computed(() => lists.error)

const statuses = [
  { key: 'planned', title: 'Запланировано' },
  { key: 'watching', title: 'Смотрю' },
  { key: 'rewatching', title: 'Пересматриваю' },
  { key: 'completed', title: 'Просмотрено' },
  { key: 'on_hold', title: 'Отложено' },
  { key: 'dropped', title: 'Брошено' },
]

const posterCache = reactive({})
const animeDataCache = reactive({})
const inFlight = reactive(new Set())
const failedAttempts = reactive({}) 

function rateId(rate) {
  return Number(
    rate?.target_id ??
    rate?.targetId ??
    rate?.target?.id ??
    rate?.anime?.id
  )
}

function posterFromAnime(a) {
  const cands = [
    ...collectCandidates(a),
    a?.image && toAbs(a.image.original),
    a?.image && toAbs(a.image.preview),
  ].filter(Boolean)
  return cands[0] || ''
}

function imageOk(url) {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => res(true)
    img.onerror = () => res(false)
    img.src = url
  })
}

async function ensurePosterForRate(rate, retryCount = 0) {
  const id = rateId(rate)
  if (!Number.isFinite(id) || id <= 0) return

  // Если уже есть успешные данные - не загружаем
  if (animeDataCache[id] && (animeDataCache[id].russian || animeDataCache[id].name)) {
    return
  }

  // Если уже загружается - не дублируем запрос
  if (inFlight.has(id)) return
  
  // Ограничиваем количество попыток до 3
  const maxRetries = 3
  if ((failedAttempts[id] || 0) >= maxRetries) {
    if (!animeDataCache[id]) {
      animeDataCache[id] = { id, name: `Аниме #${id}`, russian: null }
    }
    return
  }
  
  inFlight.add(id)
  
  try {
    const full = await fetchAnimeById(id)
    
    if (full && (full.russian || full.name)) {
      // Успешно загрузили - сохраняем данные
      animeDataCache[id] = full
      failedAttempts[id] = 0 // Сбрасываем счетчик ошибок
      
    const fromApi = posterFromAnime(full)
      if (fromApi) {
      posterCache[id] = fromApi
    } else {
      posterCache[id] = null
    }
    } else {
      // Данные пришли, но без названия - повторяем
      throw new Error('No title data')
    }
  } catch (error) {
    console.warn(`Попытка ${retryCount + 1}/${maxRetries} загрузки аниме ${id} не удалась:`, error.message)
    
    failedAttempts[id] = (failedAttempts[id] || 0) + 1
    
    
    if (failedAttempts[id] < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, failedAttempts[id]), 5000)
      setTimeout(() => {
        inFlight.delete(id)
        ensurePosterForRate(rate, retryCount + 1)
      }, delay)
    } else {
      
    posterCache[id] = null
      if (!animeDataCache[id]) {
        animeDataCache[id] = { id, name: `Аниме #${id}`, russian: null }
      }
      inFlight.delete(id)
    }
  } finally {
    if ((failedAttempts[id] || 0) >= maxRetries || animeDataCache[id]) {
    inFlight.delete(id)
    }
  }
}


async function loadAnimeDataBatch(rates, maxConcurrent = 5) {
  const ids = rates
    .map(r => rateId(r))
    .filter(id => Number.isFinite(id) && id > 0 && !animeDataCache[id] && !inFlight.has(id))
  
  if (ids.length === 0) return
  
  
  for (let i = 0; i < ids.length; i += maxConcurrent) {
    const batch = ids.slice(i, i + maxConcurrent)
    const batchRates = rates.filter(r => batch.includes(rateId(r)))
    
    await Promise.all(
      batchRates.map(rate => ensurePosterForRate(rate))
    )
  }
}
function cardBg(rate) {
  const id = rateId(rate)
  const url = posterCache[id]
  
  if (url) {
    return { 
      backgroundImage: `url(${url})`,
      backgroundColor: '#1a1a2e'
    }
  }
  
  
  return {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    backgroundColor: '#1a1a2e'
  }
}

function getAnimeName(rate) {
  const id = rateId(rate)
  
  
  if (rate.anime?.russian) return rate.anime.russian
  if (rate.anime?.name) return rate.anime.name
  if (rate.target?.russian) return rate.target.russian
  if (rate.target?.name) return rate.target.name
  
  
  if (animeDataCache[id]) {
    const cached = animeDataCache[id]
    if (cached?.russian) return cached.russian
    if (cached?.name) return cached.name
  }
  
  
  if (Number.isFinite(id) && id > 0) {
    
    if (!inFlight.has(id) && !animeDataCache[id]) {
      
      ensurePosterForRate(rate)
    }
    
    
    if (inFlight.has(id)) {
      return 'Загрузка...'
    }
    
    
    if ((failedAttempts[id] || 0) >= 3) {
      return `Аниме #${id}`
    }
    
    return `Аниме #${id}`
  }
  
  return 'Неизвестное аниме'
}

const bgStyle = cardBg
const posterStyle = cardBg


watch(
  () => activeTab.value,
  async (newTab) => {
    
    searchQuery.value = ''
    
    if (groupedLists.value[newTab] && groupedLists.value[newTab].length > 0) {
      // Загружаем первые 20 элементов активной вкладки
      const visibleRates = groupedLists.value[newTab].slice(0, 20)
      await loadAnimeDataBatch(visibleRates, 8)
    }
  },
  { immediate: false }
)

// Предзагрузка данных при монтировании
async function warmUp() {
  console.log('🔄 Начинаем предзагрузку данных...')
  
  // Загружаем данные для текущей активной вкладки более агрессивно
  const currentTab = activeTab.value
  if (groupedLists.value[currentTab] && groupedLists.value[currentTab].length > 0) {
    const visibleCount = Math.min(groupedLists.value[currentTab].length, 24)
    const firstBatch = groupedLists.value[currentTab].slice(0, visibleCount)
    
    console.log(`📥 Загружаем ${visibleCount} элементов из вкладки "${currentTab}"`)
    
    // Загружаем более агрессивно - до 10 параллельных запросов
    await loadAnimeDataBatch(firstBatch, 10)
  }
  
  // Затем загружаем остальные вкладки
  const otherTabs = Object.keys(groupedLists.value).filter(key => key !== currentTab)
  setTimeout(async () => {
    for (const tab of otherTabs) {
      if (groupedLists.value[tab] && groupedLists.value[tab].length > 0) {
        const batch = groupedLists.value[tab].slice(0, 10)
        loadAnimeDataBatch(batch, 5)
      }
    }
  }, 500)
}

watch(
  () => lists.rates.length,
  (n) => { if (n) setTimeout(warmUp, 100) },
  { immediate: true }
)

// Батч для IntersectionObserver
const visibleRatesBatch = reactive(new Set())
let visibleBatchTimeout = null

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const rate = (e.target).__rate
      if (rate) {
        visibleRatesBatch.add(rate)
      io.unobserve(e.target)
    }
    }
    
    // Дебаунс для батч-загрузки
    if (visibleBatchTimeout) clearTimeout(visibleBatchTimeout)
    visibleBatchTimeout = setTimeout(() => {
      if (visibleRatesBatch.size > 0) {
        const ratesToLoad = Array.from(visibleRatesBatch)
        visibleRatesBatch.clear()
        loadAnimeDataBatch(ratesToLoad, 5)
      }
    }, 300)
  },
  { root: null, rootMargin: '300px 0px 300px 0px', threshold: 0 }
)

const vInview = {
  mounted(el, binding) {
    el.__rate = binding.value
    io.observe(el)
  },
  updated(el, binding) {
    el.__rate = binding.value
  },
  unmounted(el) {
    io.unobserve(el)
    delete el.__rate
  },
}
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.profile {
  min-height: 100vh;
  padding: 100px 0 60px;
  background: linear-gradient(135deg, $primary-bg 0%, $secondary-bg 50%, $dark-blue 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

// Шапка профиля
.profile-header {
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  
  &__avatar-section {
    position: relative;
  }
  
  &__avatar {
    width: 120px;
    height: 120px;
    border-radius: 20px;
  object-fit: cover;
    object-position: center;
    border: 3px solid $accent-coral;
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    image-rendering: auto;
    filter: none;
    -webkit-filter: none;
  }
  
  &__status {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: linear-gradient(135deg, #4ecdc4, #44a3a0);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(78, 205, 196, 0.5);
  }
  
  &__info {
    flex: 1;
  }
  
  &__nickname {
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(135deg, $accent-coral, $accent-turquoise);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 15px;
    font-family: 'Orbitron', sans-serif;
  }
  
  &__meta {
    display: flex;
    gap: 30px;
    margin-bottom: 20px;
  }
  
  &__actions {
    display: flex;
    gap: 15px;
  }
}

.profile-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $text-secondary;
  font-size: 14px;
  
  svg {
    color: $accent-turquoise;
  }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  
  &-settings {
    background: linear-gradient(135deg, $accent-turquoise, #44a3a0);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(78, 205, 196, 0.4);
    }
  }
  
  &-shikimori {
    background: linear-gradient(135deg, $accent-gold, #e6b800);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(255, 230, 109, 0.4);
    }
  }
  
  &-logout {
    background: linear-gradient(135deg, $accent-coral, $hot-pink);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(255, 107, 107, 0.4);
    }
  }
}

// Статистика
.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  border: 1px solid rgba(78, 205, 196, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: $accent-coral;
    box-shadow: 0 10px 30px rgba(255, 107, 107, 0.2);
  }
  
  &__value {
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(135deg, $accent-coral, $accent-turquoise);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  
  &__label {
    color: $text-secondary;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

// Секции
.profile-section {
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: $accent-coral;
  }
  
  &--link {
    transition: all 0.3s ease;
    position: relative;
    
    &:hover {
      color: $accent-coral;
      transform: translateX(5px);
      
      .section-title__arrow {
        transform: translateX(5px);
      }
    }
  }
  
  &__arrow {
    margin-left: auto;
    font-size: 16px;
    color: $accent-turquoise;
    transition: transform 0.3s ease;
  }
}

// Заголовок списков с поиском
.lists-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

// Строка поиска
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 10px;
  padding: 10px 15px;
  min-width: 280px;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: $accent-turquoise;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 15px rgba(78, 205, 196, 0.2);
  }
  
  &__icon {
    color: $accent-turquoise;
    margin-right: 10px;
    font-size: 14px;
  }
  
  &__input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text-primary;
    font-size: 14px;
    font-family: 'Comfortaa', sans-serif;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  &__clear {
    background: transparent;
    border: none;
    color: $accent-coral;
    cursor: pointer;
    padding: 5px;
    margin-left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 107, 107, 0.2);
    }
    
    svg {
      font-size: 12px;
    }
  }
}

// История изменений
.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(78, 205, 196, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: $accent-turquoise;
    transform: translateX(5px);
  }
  
  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    
    &.action-add {
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(78, 205, 196, 0.1));
      color: $accent-turquoise;
      border: 1px solid rgba(78, 205, 196, 0.3);
    }
    
    &.action-remove {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
      color: $accent-coral;
      border: 1px solid rgba(255, 107, 107, 0.3);
    }
    
    &.action-change {
      background: linear-gradient(135deg, rgba(255, 230, 109, 0.2), rgba(255, 230, 109, 0.1));
      color: $accent-gold;
      border: 1px solid rgba(255, 230, 109, 0.3);
    }
  }
  
  &__content {
    flex: 1;
    min-width: 0;
  }
  
  &__title {
    color: $text-primary;
  font-weight: 600;
    font-size: 15px;
    margin-bottom: 5px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
    
    &:hover {
      color: $accent-coral;
    }
  }
  
  &__meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
  }
  
  &__action {
    color: $text-secondary;
  }
  
  &__date {
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
  }
}

// Активность
.activity-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(78, 205, 196, 0.2);
}

.activity-icon {
  font-size: 40px;
  color: $accent-turquoise;
}

.activity-info {
  flex: 1;
}

.activity-value {
  font-size: 24px;
  font-weight: 700;
  color: $accent-coral;
  margin-bottom: 5px;
}

.activity-label {
  color: $text-secondary;
  font-size: 13px;
}

// Табы списков
.lists-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 10px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  
  &:hover {
    background: rgba(78, 205, 196, 0.1);
    border-color: $accent-turquoise;
    color: $text-primary;
  }
  
  &.active {
    background: linear-gradient(135deg, $accent-coral, $hot-pink);
    border-color: $accent-coral;
    color: white;
    box-shadow: 0 5px 20px rgba(255, 107, 107, 0.3);
  }
}

.tab-count {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
}

// Контент списков
.lists-loading,
.lists-error {
  text-align: center;
  padding: 40px;
  color: $text-secondary;
  font-size: 18px;
  
  svg {
    font-size: 30px;
    margin-right: 10px;
  }
}

.lists-error {
  color: $accent-coral;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.anime-card {
  position: relative;
  display: block;
  width: 100%;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(255, 107, 107, 0.4);
    
    .anime-card__image {
      transform: scale(1.05);
    }
  }
  
  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #1a1a2e;
  background-size: cover;
  background-position: center;
    background-repeat: no-repeat;
    transition: transform 0.5s ease;
}

  &__overlay {
  position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(10, 10, 10, 0.3) 30%,
      rgba(10, 10, 10, 0.7) 60%,
      rgba(10, 10, 10, 0.95) 100%
    );
    z-index: 1;
  }
  
  &__content {
  position: absolute;
    bottom: 0;
  left: 0;
  right: 0;
    padding: 16px;
    z-index: 2;
  }
  
  &__title {
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 6px;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  }
  
  &__meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    border-radius: 6px;
    color: $accent-gold;
    font-size: 12px;
    font-weight: 600;
    
    svg {
      font-size: 11px;
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: $text-secondary;
  
  svg {
    font-size: 60px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  p {
    font-size: 18px;
    margin: 0;
  }
}

// Адаптивность
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 25px;
    
    &__nickname {
      font-size: 28px;
    }
    
    &__meta {
      flex-direction: column;
      gap: 10px;
    }
    
    &__actions {
      justify-content: center;
      width: 100%;
      flex-direction: column;
      gap: 10px;
      
      button {
        width: 100%;
      }
    }
  }
  
  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  
  .anime-card {
    height: 220px;
    
    &__content {
      padding: 12px;
    }
    
    &__title {
      font-size: 13px;
      line-height: 1.3;
    }
    
    &__meta {
      font-size: 11px;
      padding: 3px 8px;
    }
  }
  
  .history-item {
    padding: 12px;
    
    &__icon {
      width: 35px;
      height: 35px;
      font-size: 16px;
    }
    
    &__title {
      font-size: 14px;
    }
    
    &__meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }
  }
  
  .lists-header {
    flex-direction: column;
    align-items: flex-start;
    
    .section-title {
      margin: 0;
    }
  }
  
  .search-box {
    width: 100%;
    min-width: auto;
  }
  
  .lists-tabs {
    justify-content: center;
  }
  
  .tab-btn {
    font-size: 13px;
    padding: 10px 15px;
  }
}
</style>