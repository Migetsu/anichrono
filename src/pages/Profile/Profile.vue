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
                    История изменений
                    <font-awesome-icon icon="fa-solid fa-chevron-right" class="section-title__arrow" />
                </RouterLink>
                <div class="history-list">
                    <div v-for="(item, index) in userHistory.slice(0, 3)" :key="index" class="history-item">
                        <div class="history-item__icon" :class="getHistoryActionClass(item.action)">
                            <font-awesome-icon :icon="getHistoryIcon(item.action)" />
                        </div>
                        <div class="history-item__content">
                            <RouterLink :to="`/watch/${item.anime_id}`" class="history-item__title">
                                {{ item.anime_title }}
                            </RouterLink>
                            <div class="history-item__meta">
                                <span class="history-item__action">{{ getHistoryActionText(item.action, item.status)
                                    }}</span>
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
                        <input v-model="searchQuery" type="text" class="search-box__input"
                            :placeholder="`Поиск в ${currentTabTitle}...`" />
                        <button v-if="searchQuery" @click="searchQuery = ''" class="search-box__clear">
                            <font-awesome-icon icon="fa-solid fa-times" />
                        </button>
                    </div>
                </div>

                <div class="lists-tabs">
                    <button v-for="tab in statuses" :key="tab.key" class="tab-btn"
                        :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
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
                            <RouterLink v-for="rate in filteredAnimeList" :key="rate.id || rate.target_id"
                                :to="`/watch/${rateId(rate)}`" class="anime-card" v-inview="rate">
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
                            <font-awesome-icon
                                :icon="searchQuery ? 'fa-solid fa-search' : 'fa-regular fa-folder-open'" />
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
import Footer from '@/components/Footer/Footer.vue'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import { fetchAnimeById, fetchMultipleAnimeByIds } from '@/api/searchAnimeById'

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
    pullRates(true)
    loadUserHistory()
    preloadAnimeData()
})

// Функция предзагрузки данных аниме из локального кэша
function preloadAnimeData() {
    const localCache = loadFromLocalCache()
    if (localCache) {
        // Загружаем данные из локального кэша в память
        Object.keys(localCache).forEach(id => {
            const animeData = localCache[id]
            if (animeData && !animeDataCache[id]) {
                animeDataCache[id] = animeData
                loadingStates[id] = 'loaded'
                
                const fromApi = posterFromAnime(animeData)
                if (fromApi) {
                    posterCache[id] = fromApi
                }
            }
        })
    }
}

watch(() => [auth?.token, auth?.user?.id], () => {
    pullRates(true)
    loadUserHistory()
})

onUnmounted(() => {
    if (visibleBatchTimeout) {
        clearTimeout(visibleBatchTimeout)
    }
})

function toAbs(url) {
    if (!url) return ''
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


    for (const x of cand) {
        if (x) {
            const finalUrl = toAbs(x)
            return finalUrl
        }
    }
    return '/avatar.svg'
})

const nickname = computed(() => {
    return auth?.user?.nickname || auth?.user?.name || auth?.user?.login || '—'
})

function logout() {
    auth.logout()
}



function openShikimoriProfile() {
    if (auth?.user?.id) {
        window.open(`https://shikimori.one/${auth.user.nickname}`, '_blank')
    }
}


const registrationDate = computed(() => {
    const user = auth?.user
    if (!user) return '—'



    if (user.common_info && Array.isArray(user.common_info)) {

        for (const info of user.common_info) {
            if (info && info[0] && typeof info[0] === 'string') {
                if (info[0].toLowerCase().includes('сайте')) {
                    const value = info[1] || info[0]
                    return value
                }
            }
        }
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
const lastAttemptAt = reactive({})
const imagePreloadCache = reactive(new Set()) // Кэш для предзагруженных изображений
const loadingStates = reactive({}) // Состояния загрузки для каждого элемента

// Локальное кэширование в localStorage
const LOCAL_CACHE_KEY = 'anichrono_anime_cache'
const LOCAL_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 часа

// Функции для работы с локальным кэшем
function saveToLocalCache(data) {
    try {
        const cacheData = {
            timestamp: Date.now(),
            data: data
        }
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
        console.warn('Не удалось сохранить в локальный кэш:', error)
    }
}

function loadFromLocalCache() {
    try {
        const cached = localStorage.getItem(LOCAL_CACHE_KEY)
        if (!cached) return null
        
        const cacheData = JSON.parse(cached)
        if (Date.now() - cacheData.timestamp > LOCAL_CACHE_TTL) {
            localStorage.removeItem(LOCAL_CACHE_KEY)
            return null
        }
        
        return cacheData.data
    } catch (error) {
        console.warn('Не удалось загрузить из локального кэша:', error)
        return null
    }
}

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

// Функция предзагрузки изображений
async function preloadImage(url) {
    if (!url || imagePreloadCache.has(url)) return true
    
    try {
        const success = await imageOk(url)
        if (success) {
            imagePreloadCache.add(url)
        }
        return success
    } catch {
        return false
    }
}

// Функция предзагрузки нескольких изображений параллельно
async function preloadImages(urls) {
    const validUrls = urls.filter(url => url && !imagePreloadCache.has(url))
    if (validUrls.length === 0) return
    
    // Предзагружаем до 3 изображений одновременно
    const batches = []
    for (let i = 0; i < validUrls.length; i += 3) {
        batches.push(validUrls.slice(i, i + 3))
    }
    
    for (const batch of batches) {
        await Promise.all(batch.map(url => preloadImage(url)))
        // Небольшая задержка между батчами
        if (batches.indexOf(batch) < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }
}

async function ensurePosterForRate(rate, retryCount = 0) {
    const id = rateId(rate)
    if (!Number.isFinite(id) || id <= 0) return

    if (animeDataCache[id] && (animeDataCache[id].russian || animeDataCache[id].name)) {
        return
    }

    if (inFlight.has(id)) return

    const maxRetries = 4
    if ((failedAttempts[id] || 0) >= maxRetries) {
        if (!animeDataCache[id]) {
            animeDataCache[id] = { id, name: `Аниме #${id}`, russian: null }
        }
        return
    }

    // Проверяем локальный кэш
    const localCache = loadFromLocalCache()
    if (localCache && localCache[id]) {
        animeDataCache[id] = localCache[id]
        loadingStates[id] = 'loaded'
        
        const fromApi = posterFromAnime(localCache[id])
        if (fromApi) {
            posterCache[id] = fromApi
            preloadImage(fromApi).catch(() => {})
        }
        return
    }

    inFlight.add(id)
    lastAttemptAt[id] = Date.now()
    loadingStates[id] = 'loading'

    try {
        const full = await fetchAnimeById(id)

        if (full && (full.russian || full.name)) {
            animeDataCache[id] = full
            failedAttempts[id] = 0
            loadingStates[id] = 'loaded'

            // Сохраняем в локальный кэш
            const localCache = loadFromLocalCache() || {}
            localCache[id] = full
            saveToLocalCache(localCache)

            const fromApi = posterFromAnime(full)
            if (fromApi) {
                posterCache[id] = fromApi
                // Предзагружаем изображение в фоне
                preloadImage(fromApi).catch(() => {}) // Игнорируем ошибки предзагрузки
            } else {
                posterCache[id] = null
            }
        } else {
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
            loadingStates[id] = 'error'
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


async function loadAnimeDataBatch(rates, maxConcurrent = 1) {
    const ids = rates
        .map(r => rateId(r))
        .filter(id => Number.isFinite(id) && id > 0 && !animeDataCache[id] && !inFlight.has(id))

    if (ids.length === 0) return

    // Сначала предзагружаем изображения из уже кэшированных данных
    const cachedUrls = []
    for (const rate of rates) {
        const id = rateId(rate)
        if (animeDataCache[id] && posterCache[id]) {
            cachedUrls.push(posterCache[id])
        }
    }
    
    if (cachedUrls.length > 0) {
        preloadImages(cachedUrls).catch(() => {}) // Предзагружаем в фоне
    }

    // Пробуем batch загрузку для ускорения
    if (ids.length >= 3) {
        try {
            const batchResults = await fetchMultipleAnimeByIds(ids.slice(0, 5)) // Загружаем до 5 за раз
            
            // Обрабатываем результаты batch загрузки
            batchResults.forEach(anime => {
                if (anime && anime.id) {
                    animeDataCache[anime.id] = anime
                    loadingStates[anime.id] = 'loaded'
                    
                    const fromApi = posterFromAnime(anime)
                    if (fromApi) {
                        posterCache[anime.id] = fromApi
                        preloadImage(fromApi).catch(() => {})
                    }
                    
                    // Сохраняем в локальный кэш
                    const localCache = loadFromLocalCache() || {}
                    localCache[anime.id] = anime
                    saveToLocalCache(localCache)
                }
            })
            
            // Убираем загруженные ID из списка для индивидуальной загрузки
            const loadedIds = new Set(batchResults.map(a => a.id))
            const remainingIds = ids.filter(id => !loadedIds.has(id))
            
            // Загружаем оставшиеся по одному
            for (const id of remainingIds) {
                const rate = rates.find(r => rateId(r) === id)
                if (rate) {
                    await ensurePosterForRate(rate)
                    await new Promise(resolve => setTimeout(resolve, 2000))
                }
            }
            
            return
        } catch (error) {
            console.warn('Batch загрузка не удалась, переходим к индивидуальной:', error)
        }
    }

    // Последовательная загрузка - по одному элементу за раз
    for (const rate of rates) {
        const id = rateId(rate)
        if (Number.isFinite(id) && id > 0 && !animeDataCache[id] && !inFlight.has(id)) {
            await ensurePosterForRate(rate)
            // Задержка между каждым запросом (уменьшаем для ускорения)
            await new Promise(resolve => setTimeout(resolve, 2000))
        }
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

    // Сначала проверяем данные из списка (быстро)
    if (rate.anime?.russian) return rate.anime.russian
    if (rate.anime?.name) return rate.anime.name
    if (rate.target?.russian) return rate.target.russian
    if (rate.target?.name) return rate.target.name

    // Затем проверяем кэш (быстро)
    if (animeDataCache[id]) {
        const cached = animeDataCache[id]
        if (cached?.russian) return cached.russian
        if (cached?.name) return cached.name
    }

    if (Number.isFinite(id) && id > 0) {
        // Показываем placeholder сразу, не ждем загрузки
        if (!animeDataCache[id] && !inFlight.has(id)) {
            // Запускаем загрузку в фоне
            ensurePosterForRate(rate)
            // Возвращаем placeholder сразу
            return `Аниме #${id}`
        }

        if (inFlight.has(id)) {
            return `Аниме #${id}` // Показываем ID вместо "Загрузка..."
        }

        return `Аниме #${id}`
    }

    return 'Неизвестное аниме'
}

// Функция для получения состояния загрузки элемента
function getLoadingState(rate) {
    const id = rateId(rate)
    return loadingStates[id] || 'pending'
}

const bgStyle = cardBg
const posterStyle = cardBg


watch(
    () => activeTab.value,
    async (newTab) => {

        searchQuery.value = ''

        if (groupedLists.value[newTab] && groupedLists.value[newTab].length > 0) {
            // Загружаем первые 15 элементов активной вкладки последовательно
            const visibleRates = groupedLists.value[newTab].slice(0, 15)
            await loadAnimeDataBatch(visibleRates, 1)
        }
    },
    { immediate: false }
)

// Предзагрузка данных при монтировании
async function warmUp() {
    // Загружаем данные для текущей активной вкладки консервативно
    const currentTab = activeTab.value
    if (groupedLists.value[currentTab] && groupedLists.value[currentTab].length > 0) {
        const visibleCount = Math.min(groupedLists.value[currentTab].length, 8) // Увеличиваем до 8 элементов
        const firstBatch = groupedLists.value[currentTab].slice(0, visibleCount)

        // Загружаем последовательно
        await loadAnimeDataBatch(firstBatch, 1)
    }

    // Отключаем фоновую загрузку других вкладок для избежания перегрузки
    // const otherTabs = Object.keys(groupedLists.value).filter(key => key !== currentTab)
    // setTimeout(async () => {
    //     for (const tab of otherTabs) {
    //         if (groupedLists.value[tab] && groupedLists.value[tab].length > 0) {
    //             const batch = groupedLists.value[tab].slice(0, 3)
    //             loadAnimeDataBatch(batch, 1)
    //         }
    //     }
    // }, 10000) // Увеличиваем задержку до 10 секунд
}

watch(
    () => lists.rates.length,
    (n) => { if (n) setTimeout(warmUp, 100) },
    { immediate: true }
)

// Periodic retry loop to re-attempt failed items automatically
let retryTimer = null
onMounted(() => {
    retryTimer = setInterval(() => {
        const ids = Object.keys(failedAttempts)
        for (const k of ids) {
            const id = Number(k)
            if (!Number.isFinite(id)) continue
            if (animeDataCache[id]) continue
            if (inFlight.has(id)) continue
            const attempts = failedAttempts[id] || 0
            if (attempts >= 2) continue // Еще больше уменьшаем количество попыток
            const last = lastAttemptAt[id] || 0
            const wait = Math.min(30000 * (attempts + 1), 60000) // Еще больше увеличиваем интервалы
            if (Date.now() - last >= wait) {
                ensurePosterForRate({ anime: { id } })
            }
        }
    }, 30000) // Увеличиваем интервал до 30 секунд
})
onUnmounted(() => {
    if (retryTimer) clearInterval(retryTimer)
})

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

        if (visibleBatchTimeout) clearTimeout(visibleBatchTimeout)
        visibleBatchTimeout = setTimeout(() => {
            if (visibleRatesBatch.size > 0) {
                const ratesToLoad = Array.from(visibleRatesBatch).slice(0, 1) // Только 1 элемент за раз
                visibleRatesBatch.clear()
                loadAnimeDataBatch(ratesToLoad, 1)
            }
        }, 1000) // Увеличиваем задержку
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
@import "@/pages/Profile/Profile.scss"
</style>