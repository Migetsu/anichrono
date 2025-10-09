<template>
    <div v-bind="$attrs">
        <main class="watch" v-if="anime">
            <div class="container">
            <section class="watch__video">
                <div class="watch__video-container">
                    <div v-if="currentTrailer" class="watch__video-player">
                        <!-- Основной iframe плеер -->
                        <iframe 
                            v-if="!videoError && !showFallback"
                            :src="currentTrailer.playerUrl" 
                            frameborder="0" 
                            allowfullscreen
                            class="trailer-iframe"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin"
                            @error="handleVideoError"
                            @load="handleVideoLoad"
                        ></iframe>
                        
                        <!-- Fallback плеер при блокировке iframe -->
                        <div v-if="videoError || showFallback" class="trailer-fallback">
                            <div class="fallback-content">
                                <div class="fallback-thumbnail">
                                    <img 
                                        v-if="currentTrailer.imageUrl" 
                                        :src="currentTrailer.imageUrl" 
                                        :alt="currentTrailer.name"
                                        class="fallback-image"
                                    />
                                    <div v-else class="fallback-placeholder">
                                        <font-awesome-icon icon="fa-solid fa-play" />
                                    </div>
                                    <div class="fallback-overlay">
                                        <font-awesome-icon icon="fa-solid fa-play" class="play-icon" />
                                    </div>
                                </div>
                                <div class="fallback-info">
                                    <h4>{{ currentTrailer.name || 'Трейлер' }}</h4>
                                    <p>Видео заблокировано браузером или расширениями</p>
                                    <div class="fallback-actions">
                                        <a 
                                            :href="currentTrailer.url" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            class="fallback-btn primary"
                                        >
                                            <font-awesome-icon icon="fa-solid fa-external-link-alt" />
                                            Открыть на YouTube
                                        </a>
                                        <button 
                                            @click="retryVideo" 
                                            class="fallback-btn secondary"
                                        >
                                            <font-awesome-icon icon="fa-solid fa-redo" />
                                            Попробовать снова
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="watch__video-placeholder">
                        <font-awesome-icon icon="fa-solid fa-video" class="placeholder-icon" />
                        <h3>Трейлеры недоступны</h3>
                        <p v-if="anime?.videos?.length === 0">Для этого аниме нет доступных трейлеров</p>
                        <p v-else-if="anime?.videos?.length > 0">Найдено {{ anime.videos.length }} видео, но нет PV трейлеров</p>
                        <p v-else>Загрузка информации о трейлерах...</p>
                    </div>
                </div>
            </section>
            <section class="watch__info">
                <div class="anime__details">
                    <h1 class="anime__details-title">{{ anime.russian || anime.name }}</h1>
                    <div class="anime__details-meta">
                        <div class="meta-item">
                            <div class="meta-value">{{ anime.score }}</div>
                            <div class="meta-label">Рейтинг</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-value">{{ anime.airedOn.year }}</div>
                            <div class="meta-label">Год</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-value">{{ anime.episodes }}</div>
                            <div class="meta-label">Серий</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-value">{{ anime.duration }} мин.</div>
                            <div class="meta-label">Длительность</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-value">{{ anime.status }}</div>
                            <div class="meta-label">Статус</div>
                        </div>
                    </div>
                    <div class="anime__details-genres">
                        <span v-for="(genre, index) in anime.genres" :key="index">{{ genre.russian || genre.name
                            }}</span>
                    </div>
                    <div class="anime__details-desc" v-html="safeDesc"></div>
                    <div class="action-buttons">
                        <div class="dropdown" v-if="auth.isLoggedIn">
                            <button class="anime__list-btn" @click="showStatus = !showStatus"
                                :class="{ active: showStatus }">
                                <font-awesome-icon icon="fa-solid fa-list-check" class="btn-icon" />
                                <span class="btn-text">{{ buttonLabel }}</span>
                                <font-awesome-icon icon="fa-solid fa-chevron-down" class="btn-arrow"
                                    :class="{ rotated: showStatus }" />
                            </button>

                            <div v-if="showStatus" class="dropdown__menu" @click.stop>
                                <div v-if="rate" class="dropdown__item dropdown__item--remove" @click="removeStatus">
                                    <font-awesome-icon icon="fa-solid fa-trash" class="item-icon" />
                                    <span>Удалить из списка</span>
                                </div>
                                <div v-if="rate" class="dropdown__separator"></div>

                                <div v-for="opt in statusOptions" :key="opt.value" class="dropdown__item"
                                    @click="selectStatus(opt.value)" :class="{ active: rate?.status === opt.value }">
                                    <font-awesome-icon :icon="getStatusIcon(opt.value)" class="item-icon" />
                                    <span>{{ opt.label }}</span>
                                    <font-awesome-icon v-if="rate?.status === opt.value" icon="fa-solid fa-check"
                                        class="item-check" />
                                </div>
                            </div>
                        </div>
                        <button class="action-btn secondary-btn">
                            <font-awesome-icon icon="fa-solid fa-share" class="action-btn-icon" />
                            Поделиться
                        </button>
                    </div>
                </div>
                <div class="watch__info-sidebar">
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">
                            <font-awesome-icon icon="fa-solid fa-video" class="sidebar-title-icon" />
                            Трейлеры
                        </h3>
                        <div class="trailer__list">
                            <div 
                                v-for="(trailer, index) in pvTrailers" 
                                :key="trailer.id"
                                class="trailer__list-item"
                                :class="{ active: currentTrailerIndex === index }"
                                @click="selectTrailer(index)"
                            >
                                <div class="trailer__thumbnail">
                                    <img 
                                        v-if="trailer.imageUrl" 
                                        :src="trailer.imageUrl" 
                                        :alt="trailer.name"
                                        class="trailer__image"
                                    />
                                    <div v-else class="trailer__image-placeholder">
                                        <font-awesome-icon icon="fa-solid fa-play" />
                                    </div>
                                    <div class="trailer__play-overlay">
                                        <font-awesome-icon icon="fa-solid fa-play" />
                                    </div>
                                </div>
                                <div class="trailer__info">
                                    <span class="trailer__number">{{ index + 1 }}.</span>
                                    <span class="trailer__title">{{ trailer.name || `Трейлер ${index + 1}` }}</span>
                                    <span class="trailer__kind">{{ trailer.kind?.toUpperCase() }}</span>
                                    <a 
                                        v-if="trailer.url" 
                                        :href="trailer.url" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        class="trailer__direct-link"
                                        @click.stop
                                    >
                                        <font-awesome-icon icon="fa-solid fa-external-link-alt" />
                                        YouTube
                                    </a>
                                </div>
                            </div>
                            <div v-if="pvTrailers.length === 0" class="trailer__list-empty">
                                <font-awesome-icon icon="fa-solid fa-video-slash" />
                                <span v-if="anime?.videos?.length === 0">Трейлеры недоступны</span>
                                <span v-else>Нет PV трейлеров (найдено {{ anime?.videos?.length || 0 }} других видео)</span>
                            </div>
                        </div>
                    </div>

                    <div class="sidebar-section sidebar-settings">
                        <h3 class="sidebar-title">
                            <font-awesome-icon icon="fa-solid fa-gear" class="sidebar-title-icon" />
                            Настройки
                        </h3>
                        
                        <div class="video-settings__content">
                            <!-- Качество видео -->
                            <div class="video-settings__item">
                                <label class="video-settings__label">Качество видео</label>
                                <div class="video-settings__dropdown">
                                    <select 
                                        v-model="selectedQuality" 
                                        @change="selectQuality(selectedQuality)"
                                        class="video-settings__select"
                                    >
                                        <option 
                                            v-for="quality in qualityOptions" 
                                            :key="quality" 
                                            :value="quality"
                                        >
                                            {{ quality }}
                                        </option>
                                    </select>
                                    <font-awesome-icon icon="fa-solid fa-chevron-down" class="video-settings__dropdown-icon" />
                                </div>
                            </div>

                            <!-- Скорость воспроизведения -->
                            <div class="video-settings__item">
                                <label class="video-settings__label">Скорость воспроизведения</label>
                                <div class="video-settings__dropdown">
                                    <select 
                                        v-model="selectedSpeed" 
                                        @change="selectSpeed(selectedSpeed)"
                                        class="video-settings__select"
                                    >
                                        <option 
                                            v-for="speed in speedOptions" 
                                            :key="speed.value" 
                                            :value="speed.value"
                                        >
                                            {{ speed.label }}
                                        </option>
                                    </select>
                                    <font-awesome-icon icon="fa-solid fa-chevron-down" class="video-settings__dropdown-icon" />
                                </div>
                            </div>

                            <!-- Субтитры -->
                            <div class="video-settings__item">
                                <label class="video-settings__label">Субтитры</label>
                                <div class="video-settings__toggle">
                                    <input 
                                        type="checkbox" 
                                        :id="`subtitles-sidebar`"
                                        :checked="subtitlesEnabled" 
                                        @change="toggleSubtitlesFromSidebar"
                                        class="video-settings__checkbox"
                                    />
                                    <label 
                                        :for="`subtitles-sidebar`" 
                                        class="video-settings__toggle-label"
                                    >
                                        <span class="video-settings__toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
            </div>
        </main>
        <Footer />
    </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'

defineOptions({
    inheritAttrs: false
})
import { useRoute } from 'vue-router'
import DOMPurify from 'dompurify'
import { fetchAnimeById } from '@/api/searchAnimeById'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import Footer from '@/components/Footer/Footer.vue'

const route = useRoute()
const auth = useAuthStore()
const lists = useListsStore()

const anime = ref(null)
const loading = ref(true)
const error = ref('')
const fallback = '/default.jpg'

const STATUS_LABELS = {
    planned: 'Запланировано',
    watching: 'Смотрю',
    rewatching: 'Пересматриваю',
    completed: 'Просмотрено',
    on_hold: 'Отложено',
    dropped: 'Брошено',
}
const statusOptions = [
    { label: STATUS_LABELS.planned, value: 'planned' },
    { label: STATUS_LABELS.watching, value: 'watching' },
    { label: STATUS_LABELS.rewatching, value: 'rewatching' },
    { label: STATUS_LABELS.completed, value: 'completed' },
    { label: STATUS_LABELS.on_hold, value: 'on_hold' },
    { label: STATUS_LABELS.dropped, value: 'dropped' },
]

async function load(id) {
    loading.value = true
    error.value = ''
    anime.value = null
    try {
        anime.value = await fetchAnimeById(id)
        console.log('Загружено аниме:', anime.value?.name, 'ID:', anime.value?.id)
        console.log('Видео в аниме:', anime.value?.videos?.length || 0)
        if (anime.value?.videos) {
            console.log('Типы видео:', anime.value.videos.map(v => v.kind))
        }
    } catch (e) {
        error.value = String(e?.message || e)
        console.error('Ошибка загрузки аниме:', e)
    } finally {
        loading.value = false
    }
}
watch(() => route.params.id, id => { if (id != null) load(Number(id)) }, { immediate: true })

const ALLOWED_TAGS = ['div', 'p', 'br', 'a', 'span', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li']
const ALLOWED_ATTR = ['href', 'title']
DOMPurify.addHook('afterSanitizeAttributes', n => {
    n.removeAttribute?.('class')
    n.removeAttribute?.('style')
        ;[...(n.attributes || [])].forEach(a => a.name?.startsWith?.('data-') && n.removeAttribute(a.name))
    if (n.tagName === 'A' && n.hasAttribute('href')) {
        n.setAttribute('target', '_blank')
        n.setAttribute('rel', 'noopener noreferrer nofollow')
    }
})
const safeDesc = computed(() => {
    const html = anime.value?.descriptionHtml || ''
    return html ? DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, USE_PROFILES: { html: true } }) : ''
})

const showStatus = ref(false)
const rate = ref(null)
const ratePending = ref(false)

async function syncRateForCurrent() {
    const id = Number(anime.value?.id)
    if (!auth.isLoggedIn || !id) { rate.value = null; return }

    const cached = lists.rateFor(id)
    if (cached) { rate.value = cached; return }

    if (!lists.loading && lists.rates.length === 0) {
        await lists.ensureRates()
        const again = lists.rateFor(id)
        if (again) { rate.value = again; return }
    }

    try {
        ratePending.value = true
        const fresh = await lists.fetchRateForTarget(Number(id))
        rate.value = fresh || null
    } finally {
        ratePending.value = false
    }
}


let syncTimer
watch(
    [
        () => auth.isLoggedIn,
        () => auth.token,
        () => auth.user?.id,
        () => anime.value?.id,
        () => lists.rates.length,
    ],
    () => {
        clearTimeout(syncTimer)
        syncTimer = setTimeout(syncRateForCurrent, 0)
    },
    { immediate: true }
)
onUnmounted(() => clearTimeout(syncTimer))

const handleClickOutside = (event) => {
    if (showStatus.value && !event.target.closest('.dropdown')) {
        showStatus.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

const buttonLabel = computed(() => {
    if (!auth.isLoggedIn) return 'Добавить в список'
    if (ratePending.value || lists.loading) return 'Загрузка…'
    return rate.value ? (STATUS_LABELS[rate.value.status] ?? 'В списке') : 'Добавить в список'
})

const getStatusIcon = (status) => {
    const icons = {
        planned: 'fa-solid fa-clock',
        watching: 'fa-solid fa-play',
        rewatching: 'fa-solid fa-rotate-right',
        completed: 'fa-solid fa-check-circle',
        on_hold: 'fa-solid fa-pause',
        dropped: 'fa-solid fa-xmark-circle'
    }
    return icons[status] || 'fa-solid fa-list'
}

async function selectStatus(code) {
    if (!anime.value) return
    await lists.setStatus(anime.value, code)
    await syncRateForCurrent()
    showStatus.value = false
}
async function removeStatus() {
    if (!anime.value) return
    await lists.remove(Number(anime.value.id))
    await syncRateForCurrent()
    showStatus.value = false
}

const mapTitleStatus = (s) => ({ anons: 'Анонс', ongoing: 'Онгоинг', released: 'Вышло' }[s] ?? s)
const mapTitleKind = (k) => ({ tv: 'TV', movie: 'Фильм', ova: 'OVA', ona: 'ONA', special: 'Спешл' }[k] ?? k)
function fmtDate(isoLike) {
    const d = new Date(isoLike)
    return String(d) === 'Invalid Date'
        ? isoLike
        : d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Фильтруем только PV трейлеры
const pvTrailers = computed(() => {
    if (!anime.value?.videos) {
        console.log('Нет данных о видео для аниме:', anime.value?.id)
        return []
    }
    const trailers = anime.value.videos.filter(video => video.kind === 'pv')
    console.log('Найдено трейлеров:', trailers.length, 'для аниме:', anime.value.id)
    console.log('Все видео:', anime.value.videos)
    return trailers
})

// Текущий выбранный трейлер
const currentTrailerIndex = ref(0)
const currentTrailer = computed(() => {
    if (pvTrailers.value.length === 0) return null
    return pvTrailers.value[currentTrailerIndex.value] || null
})

// Функция выбора трейлера
function selectTrailer(index) {
    if (index >= 0 && index < pvTrailers.value.length) {
        currentTrailerIndex.value = index
        // Сбрасываем состояние ошибки при смене трейлера
        videoError.value = false
        showFallback.value = false
        
        // Принудительно обновляем iframe для мобильных устройств
        const iframe = document.querySelector('.trailer-iframe')
        if (iframe) {
            const currentSrc = iframe.src
            iframe.src = ''
            setTimeout(() => {
                iframe.src = currentSrc
            }, 100)
        }
    }
}

// Автоматически выбираем первый трейлер при загрузке аниме
watch(() => anime.value?.videos, () => {
    if (pvTrailers.value.length > 0) {
        currentTrailerIndex.value = 0
        // Сбрасываем состояние ошибки при загрузке нового аниме
        videoError.value = false
        showFallback.value = false
    }
}, { immediate: true })

// Автоматическое определение блокировки iframe через таймаут
watch(() => currentTrailer.value, (newTrailer) => {
    if (newTrailer) {
        // Даем iframe 3 секунды на загрузку, если не загрузился - показываем fallback
        const timeout = setTimeout(() => {
            const iframe = document.querySelector('.trailer-iframe')
            if (iframe && !videoError.value) {
                // Проверяем, загрузился ли iframe
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
                    if (!iframeDoc || iframeDoc.readyState !== 'complete') {
                        console.warn('Iframe не загрузился в течение 3 секунд - показываем fallback')
                        showFallback.value = true
                    }
                } catch (e) {
                    // Если не можем получить доступ к iframe (CORS), считаем что он заблокирован
                    console.warn('Iframe заблокирован CORS политикой - показываем fallback')
                    showFallback.value = true
                }
            }
        }, 3000)
        
        // Очищаем таймаут при смене трейлера
        return () => clearTimeout(timeout)
    }
})

// Настройки видео (для совместимости с существующими стилями)
const qualityOptions = ['1080p', '720p', '480p']
const selectedQuality = ref('720p')

const speedOptions = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x (нормально)' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 1.75, label: '1.75x' },
    { value: 2, label: '2x' }
]
const selectedSpeed = ref(1)

const subtitlesEnabled = ref(false)

// Состояние для fallback плеера
const videoError = ref(false)
const showFallback = ref(false)


// Функции настроек (заглушки для совместимости)
function selectQuality(q) {
    selectedQuality.value = q
}

function selectSpeed(speed) {
    selectedSpeed.value = speed
}

function toggleSubtitlesFromSidebar(event) {
    subtitlesEnabled.value = event.target.checked
}

// Обработка ошибок загрузки видео
function handleVideoError() {
    console.warn('Ошибка загрузки видео трейлера - переключаемся на fallback')
    videoError.value = true
    showFallback.value = true
}

function handleVideoLoad() {
    console.log('Видео трейлер успешно загружен')
    videoError.value = false
    showFallback.value = false
}

// Функция повторной попытки загрузки
function retryVideo() {
    console.log('Повторная попытка загрузки видео')
    videoError.value = false
    showFallback.value = false
    
    // Принудительно обновляем iframe
    const iframe = document.querySelector('.trailer-iframe')
    if (iframe && currentTrailer.value) {
        const currentSrc = iframe.src
        iframe.src = ''
        setTimeout(() => {
            iframe.src = currentSrc
        }, 100)
    }
}
</script>

<style scoped lang="scss">
@import "@/pages/Watch/Watch.scss"
</style>