<template>
    <main class="watch" v-if="anime">
        <div class="container">
            <section class="watch__video">
                <div class="watch__video-container" ref="playerContainer">
                    <div class="watch__video-player"
                         @click="onPlayerAreaClick"
                         @mousemove.passive="onUserActivity"
                         @mousedown.passive="onUserActivity"
                         :class="{ 'controls-hidden': hasSource && !showControls }">
                        <video ref="videoEl"
                               :src="currentSrc || undefined"
                               v-show="hasSource"
                               @loadedmetadata="onLoadedMetadata"
                               @timeupdate="onTimeUpdate"
                               @ended="onEnded"
                               playsinline
                               preload="auto"
                               style="width:100%;height:100%;object-fit:contain;display:block"></video>

                        <transition name="overlay-fade">
                            <div class="watch__video-placeholder" v-if="showIntroOverlay">
                                <font-awesome-icon icon="fa-solid fa-circle-play" class="placeholder-icon" />
                                <h3>Начните просмотр</h3>
                                <p>Выберите эпизод из списка справа снизу</p>
                            </div>
                        </transition>
                        <transition name="controls-fade">
                            <div class="watch__video-controls" v-show="hasSource && showControls" @click.stop>
                                <button class="control-btn play-btn" @click="togglePlay" :disabled="!hasSource">
                                    <font-awesome-icon v-if="!isPlaying" icon="fa-solid fa-play" />
                                    <font-awesome-icon v-else icon="fa-solid fa-pause" />
                                </button>
                                <div class="progress-bar" :class="{ disabled: !hasSource }"
                                     @mousedown="onSeekStart" @mousemove="onSeekMove"
                                     @mouseup="onSeekEnd" @mouseleave="onSeekEnd">
                                    <div class="progress-fill" :style="{ width: progressPercent + '%' }">
                                        <div class="progress-handle"></div>
                                    </div>
                                </div>
                                <div class="time-display">
                                    <span class="current-time">{{ formattedCurrent }}</span>
                                    /
                                    <span class="total-time">{{ formattedDuration }}</span>
                                </div>
                                    <div class="volume-control">
                                        <button class="control-btn" :disabled="!hasSource">
                                            <font-awesome-icon v-if="muted || volume === 0" icon="fa-solid fa-volume-xmark" @click.stop="toggleMute" />
                                            <font-awesome-icon v-else-if="volume < 0.5" icon="fa-solid fa-volume-low" @click.stop="toggleMute" />
                                            <font-awesome-icon v-else icon="fa-solid fa-volume-high" @click.stop="toggleMute" />
                                        </button>
                                    <div class="volume-slider" @mousedown="onVolumeStart" @mousemove="onVolumeMove" @mouseup="onVolumeEnd" @mouseleave="onVolumeEnd">
                                        <div class="volume-fill" :style="{ width: Math.round(volume * 100) + '%' }"></div>
                                    </div>

                                </div>
                                <div class="settings" v-if="true">
                                    <button class="control-btn" @click.stop="showSettings = !showSettings">
                                        <font-awesome-icon icon="fa-solid fa-gear" />
                                    </button>
                                    <div v-if="showSettings" class="settings__menu" @click.stop>
                                        <div class="settings__section">
                                            <div class="settings__title">Качество</div>
                                            <div class="settings__option" v-for="q in qualityOptions" :key="q" @click="selectQuality(q)" :class="{ active: selectedQuality === q }">
                                                <span>{{ q }}</span>
                                                <font-awesome-icon v-if="selectedQuality === q" icon="fa-solid fa-check" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="control-btn" @click="toggleFullscreen">
                                    <font-awesome-icon icon="fa-solid fa-expand" />
                                </div>
                            </div>
                        </transition>
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
                        <span v-for="(genre, index) in anime.genres" :key="index">{{ genre.russian || genre.name }}</span>
                    </div>
                    <div class="anime__details-desc" v-html="safeDesc"></div>
                    <div class="action-buttons">
                        <div class="dropdown" v-if="auth.isLoggedIn">
                            <button class="anime__list-btn" @click="showStatus = !showStatus" :class="{ active: showStatus }">
                                <font-awesome-icon icon="fa-solid fa-list-check" class="btn-icon" />
                                <span class="btn-text">{{ buttonLabel }}</span>
                                <font-awesome-icon icon="fa-solid fa-chevron-down" class="btn-arrow" :class="{ rotated: showStatus }" />
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
                                    <font-awesome-icon v-if="rate?.status === opt.value" icon="fa-solid fa-check" class="item-check" />
                                </div>
                            </div>
                        </div>
                        <button v-else class="action-btn primary-btn">
                            <font-awesome-icon icon="fa-solid fa-list-check" class="action-btn-icon" />
                            Добавить в список
                        </button>
                        <button class="action-btn secondary-btn">
                            <font-awesome-icon icon="fa-solid fa-share" class="action-btn-icon" />
                            Поделиться
                        </button>
                    </div>
                </div>
                <div class="watch__info-sidebar">
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">
                            <font-awesome-icon icon="fa-solid fa-list" class="sidebar-title-icon" />
                            Эпизоды
                        </h3>
                        <div class="episode__list">
                            <div class="episode__list-item">
                                <span class="episode__list-number">1.</span>
                                <span class="episode__list-title">Видео и эпизодов тут пока нет, дайте пожалуйста API</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="sidebar-section sidebar-ad">
                        <h3 class="sidebar-title">
                            <font-awesome-icon icon="fa-solid fa-bullhorn" class="sidebar-title-icon" />
                            Реклама
                        </h3>
                        <div class="ad-content">
                            <div class="ad-placeholder">
                                <font-awesome-icon icon="fa-solid fa-ad" class="ad-icon" />
                                <p>Рекламный блок</p>
                                <small>300x250</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
    <Footer />
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DOMPurify from 'dompurify'
import { fetchAnimeById } from '@/api/searchAnimeById'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import Footer from '@/components/Footer.vue'

const route = useRoute()
const auth = useAuthStore()
const lists = useListsStore()

const anime = ref(null)
const loading = ref(true)
const error = ref('')
const fallback = '/placeholder.jpg'

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
    } catch (e) {
        error.value = String(e?.message || e)
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

const episodesCount = computed(() => {
    const n = Number(anime.value.episodes)
    if (!n || n <= 0) return []
    return Array.from({ length: n }, (_, i) => i + 1)
})

// ===== Player state =====
const videoEl = ref(null)
const playerContainer = ref(null)
const selectedEpisode = ref(null)
const DEFAULT_VIDEO_SRC = '/videos/RickRoll.mp4'
const currentSrc = computed(() => selectedEpisode.value ? resolveEpisodeSrc(selectedEpisode.value) : DEFAULT_VIDEO_SRC)
const hasSource = computed(() => !!currentSrc.value)

const isPlaying = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const seeking = ref(false)
const volume = ref(1)
const lastVolume = ref(1)
const muted = ref(false)
const VOLUME_STORAGE_KEY = 'anichrono.player.volume'
const MUTED_STORAGE_KEY = 'anichrono.player.muted'
const showIntroOverlay = ref(true)
const showControls = ref(true)
let inactivityTimer = null

function resolveEpisodeSrc(ep) {
    // TODO: заменить на реальный источник эпизода
    return ''
}

function formatTime(t) {
    if (!isFinite(t) || t < 0) return '00:00'
    const h = Math.floor(t / 3600)
    const m = Math.floor((t % 3600) / 60)
    const s = Math.floor(t % 60)
    const mm = String(m).padStart(2, '0')
    const ss = String(s).padStart(2, '0')
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

const progressPercent = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
const formattedCurrent = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

function togglePlay() {
    if (!videoEl.value || !hasSource.value) return
    if (isPlaying.value) {
        videoEl.value.pause()
        isPlaying.value = false
    } else {
        // ensure volume/mute applied before starting
        videoEl.value.volume = volume.value
        videoEl.value.muted = muted.value
        videoEl.value.play()
        isPlaying.value = true
        showIntroOverlay.value = false
    }
}

function onPlayerAreaClick() {
    if (!hasSource.value) return
    togglePlay()
}

function onUserActivity() {
    if (!hasSource.value) return
    showControls.value = true
    if (inactivityTimer) {
        clearTimeout(inactivityTimer)
    }
    inactivityTimer = setTimeout(() => {
        showControls.value = false
    }, 5000)
}

function onLoadedMetadata() {
    if (!videoEl.value) return
    duration.value = Number(videoEl.value.duration) || 0
    // re-apply persisted volume/mute upon metadata load
    videoEl.value.volume = volume.value
    videoEl.value.muted = muted.value
}

function onTimeUpdate() {
    if (!videoEl.value || seeking.value) return
    currentTime.value = Number(videoEl.value.currentTime) || 0
}

function onEnded() {
    isPlaying.value = false
}

// Seeking
function getBarMetrics(event) {
    const bar = event.currentTarget
    const rect = bar.getBoundingClientRect()
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width)
    return { rect, x }
}
function onSeekStart(event) {
    if (!hasSource.value || !videoEl.value) return
    seeking.value = true
    onSeekMove(event)
}
function onSeekMove(event) {
    if (!seeking.value || !videoEl.value || !duration.value) return
    const { rect, x } = getBarMetrics(event)
    const ratio = x / rect.width
    const t = ratio * duration.value
    currentTime.value = t
}
function onSeekEnd(event) {
    if (!seeking.value || !videoEl.value || !duration.value) return
    const { rect, x } = getBarMetrics(event)
    const ratio = x / rect.width
    const t = ratio * duration.value
    videoEl.value.currentTime = t
    currentTime.value = t
    seeking.value = false
}

// Volume
function volMetrics(event) {
    const bar = event.currentTarget
    const rect = bar.getBoundingClientRect()
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width)
    return Math.min(Math.max(x / rect.width, 0), 1)
}
function onVolumeStart(event) {
    const v = volMetrics(event)
    setVolume(v)
}
function onVolumeMove(event) {
    if (event.buttons !== 1) return
    const v = volMetrics(event)
    setVolume(v)
}
function onVolumeEnd() { /* no-op */ }

function setVolume(v) {
    volume.value = v
    if (videoEl.value) videoEl.value.volume = v
    if (v > 0) {
        lastVolume.value = v
        if (muted.value) muted.value = false
    }
}
function toggleMute() {
    if (!videoEl.value) return
    if (!muted.value) {
        // сохранить текущую громкость и заглушить
        lastVolume.value = volume.value > 0 ? volume.value : (lastVolume.value || 1)
        setVolume(0)
        muted.value = true
        videoEl.value.muted = true
    } else {
        // вернуть последнюю ненулевую громкость
        const restore = lastVolume.value > 0 ? lastVolume.value : 1
        muted.value = false
        videoEl.value.muted = false
        setVolume(restore)
    }
}

// Fullscreen
async function toggleFullscreen() {
    const el = playerContainer.value
    if (!el) return
    const doc = document
    if (!doc.fullscreenElement) {
        await el.requestFullscreen?.()
    } else {
        await doc.exitFullscreen?.()
    }
}

onMounted(() => {
    // restore persisted volume/mute
    try {
        const savedVol = localStorage.getItem(VOLUME_STORAGE_KEY)
        if (savedVol !== null) {
            const v = Math.min(Math.max(parseFloat(savedVol), 0), 1)
            volume.value = isFinite(v) ? v : 1
            lastVolume.value = volume.value > 0 ? volume.value : lastVolume.value
        }
        const savedMuted = localStorage.getItem(MUTED_STORAGE_KEY)
        if (savedMuted !== null) {
            muted.value = savedMuted === 'true'
        }
    } catch {}

    if (videoEl.value) {
        videoEl.value.volume = volume.value
        videoEl.value.muted = muted.value
    }
})

watch(volume, (v) => {
    try { localStorage.setItem(VOLUME_STORAGE_KEY, String(v)) } catch {}
})
watch(muted, (m) => {
    try { localStorage.setItem(MUTED_STORAGE_KEY, String(m)) } catch {}
})

// ===== Settings state (качество) =====
const showSettings = ref(false)
const qualityOptions = ['1080p', '720p', '480p']
const selectedQuality = ref('720p')
function selectQuality(q) {
    if (!videoEl.value) return
    const wasPlaying = isPlaying.value
    const time = currentTime.value
    selectedQuality.value = q
    // Пример маппинга качества на источник
    const qualityMap = {
        '1080p': DEFAULT_VIDEO_SRC,
        '720p': DEFAULT_VIDEO_SRC,
        '480p': DEFAULT_VIDEO_SRC,
    }
    const newSrc = qualityMap[q] || DEFAULT_VIDEO_SRC
    // Переключаем источник с сохранением позиции
    videoEl.value.src = newSrc
    videoEl.value.currentTime = time
    // re-apply volume before potential autoplay
    videoEl.value.volume = volume.value
    videoEl.value.muted = muted.value
    if (wasPlaying) {
        videoEl.value.play()
    }
    showSettings.value = false
}
</script>

<style lang="scss" scoped>
.watch {
    z-index: -1;
    min-height: 100vh;
    background: linear-gradient(45deg, $primary-bg, $secondary-bg);
    padding-top: 100px;

    &__video {
        background: rgba(26, 26, 46, 0.8);
        border-radius: 15px;
        padding: 32px;
        margin-bottom: 32px;
        border: 1px solid rgba(255, 107, 107, 0.2);
        backdrop-filter: blur(10px);

        &-container {
            position: relative;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            aspect-ratio: 16 / 9;
        }

        &-player {
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #1a1a2e, #16213e);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        &-placeholder {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: rgba(0,0,0,0.25);

            & h3 {
                font-size: 20px;
                line-height: 28px;
                margin-bottom: 8px;
                color: $text-primary;
            }

            & p {
                color: $text-secondary;
            }

            & .placeholder-icon {
                font-size: 64px;
                color: $accent-coral;
                margin-bottom: 16px;
            }
        }

        /* overlay fade animation */
        :global(.overlay-fade-enter-active),
        :global(.overlay-fade-leave-active) {
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        :global(.overlay-fade-enter-from),
        :global(.overlay-fade-leave-to) {
            opacity: 0;
            transform: scale(0.98);
        }

        &-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
            padding: 32px 16px 16px;
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: all 0.3s ease;
        }

        /* fade animation for controls */
        :global(.controls-fade-enter-active),
        :global(.controls-fade-leave-active) {
            transition: opacity 0.2s ease;
        }
        :global(.controls-fade-enter-from),
        :global(.controls-fade-leave-to) {
            opacity: 0;
        }

        /* hide cursor when controls hidden */
        &.controls-hidden {
            cursor: none;
        }
    }

    &__info {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 32px;
        padding-bottom: 32px;

        & .anime__details {
            background: rgba(26, 26, 46, 0.8);
            border-radius: 15px;
            padding: 32px;
            border: 1px solid rgba(255, 107, 107, 0.2);
            backdrop-filter: blur(10px);

            &-title {
                font-family: "Orbitron";
                font-size: 40px;
                font-weight: 700;
                margin-bottom: 16px;
                background: linear-gradient(45deg, $accent-coral, $accent-turquoise);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            &-meta {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
                margin-bottom: 32px;

                & .meta-item {
                    text-align: center;
                    padding: 16px;
                    background: rgba(22, 33, 62, 0.5);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 107, 107, 0.2);
                }

                & .meta-value {
                    font-size: 24px;
                    font-weight: 600;
                    color: $accent-coral;
                    margin-bottom: 4px;
                }

                & .meta-label {
                    color: $text-secondary;
                    font-size: 14px;
                }
            }

            &-genres {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 32px;

                & span {
                    background: rgba(78, 205, 196, 0.2);
                    color: $accent-turquoise;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    border: 1px solid rgba(78, 205, 196, 0.3);
                    transition: all 0.3s ease;

                    &:hover {
                        background: rgba #4ecdc44d (78, 205, 196, 0.3);
                        transform: scale(1.05);
                    }
                }
            }

            &-desc {
                color: $text-secondary;
                line-height: 1.8;
                margin-bottom: 32px;
                font-size: 18px;
            }
        }

        &-sidebar {
            display: flex;
            flex-direction: column;
            gap: 24px;
            height: 100%;

            & .sidebar-section {
                background: rgba(26, 26, 46, 0.8);
                border-radius: 15px;
                padding: 24px;
                border: 1px solid rgba(255, 107, 107, 0.2);
                backdrop-filter: blur(10px);
                display: flex;
                flex-direction: column;
                
                &:not(.sidebar-ad) {
                    height: 500px;
                    overflow: hidden;
                }
                
                &.sidebar-ad {
                    flex: 1;
                    min-height: 300px;
                }
            }
            
            & .ad-content {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                
                .ad-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 150px;
                    background: rgba(255, 107, 107, 0.1);
                    border: 2px dashed rgba(255, 107, 107, 0.3);
                    border-radius: 10px;
                    color: $text-secondary;
                    
                    .ad-icon {
                        font-size: 32px;
                        margin-bottom: 8px;
                        opacity: 0.6;
                    }
                    
                    p {
                        margin: 0 0 4px 0;
                        font-size: 16px;
                        font-weight: 500;
                    }
                    
                    small {
                        font-size: 12px;
                        opacity: 0.7;
                    }
                }
            }

            & .sidebar-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 16px;
                color: $accent-coral;

                &-icon {
                    margin-right: 8px;
                }
            }

            & .episode__list {
                flex: 1 1 auto;
                min-height: 0; // позволяет элементу с flex расти/сжиматься для корректной прокрутки
                overflow-y: auto;
                overflow-x: hidden;
                padding-right: 8px;
                scrollbar-width: thin;
                scrollbar-color: $accent-coral #000;

                &::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                &::-webkit-scrollbar-track {
                    background: #000;
                }

                &::-webkit-scrollbar-thumb {
                    background-color: $accent-coral;
                    border-radius: 8px;
                }

                &-item {
                    padding: 12px;
                    background: rgba(22, 33, 62, 0.5);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 107, 107, 0.1);

                    &.active {
                        background: rgba(255, 107, 107, 0.2);
                        border-color: $accent-coral;
                    }

                    &:hover {
                        background: rgba(255, 107, 107, 0.1);
                        border-color: $accent-coral;
                        transform: translateX(5px);
                    }
                }

                &-number {
                    font-weight: 600;
                    color: $accent-coral;
                    margin-right: 8px;
                }

                &-title {
                    color: $text-primary;
                }
            }
        }
    }
}

.dropdown {
    position: relative;
    display: inline-block;
    width: auto;
}

.anime__list-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: auto;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
    border: 2px solid rgba(255, 107, 107, 0.3);
    border-radius: 12px;
    color: $text-primary;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);

    &:hover {
        border-color: $accent-coral;
        box-shadow: 0 12px 35px rgba(255, 107, 107, 0.2);
        transform: translateY(-2px);
    }

    &.active {
        border-color: $accent-coral;
        box-shadow: 0 0 20px rgba(255, 107, 107, 0.4);
    }

    .btn-icon {
        color: $accent-coral;
        font-size: 18px;
        margin-right: 12px;
    }

    .btn-text {
        flex: 1;
        text-align: left;
    }

    .btn-arrow {
        color: $text-secondary;
        font-size: 14px;
        transition: transform 0.3s ease;
        margin-left: 6px;

        &.rotated {
            transform: rotate(180deg);
        }
    }
}

.dropdown__menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: auto;
    background: rgba(26, 26, 46, 0.95);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
    backdrop-filter: blur(15px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    animation: dropdownFadeIn 0.3s ease-out;
    max-height: 200px;
    min-width: 260px;
    width: 100%;

    // Firefox scrollbar
    scrollbar-width: thin;
    scrollbar-color: $accent-coral #000;

    // WebKit scrollbar
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #000;
    }

    &::-webkit-scrollbar-thumb {
        background-color: $accent-coral;
        border-radius: 8px;
    }

    &::before {
        content: '';
        position: absolute;
        top: -8px;
        left: 20px;
        width: 14px;
        height: 14px;
        background: rgba(26, 26, 46, 0.95);
        border-left: 1px solid rgba(255, 107, 107, 0.3);
        border-top: 1px solid rgba(255, 107, 107, 0.3);
        transform: rotate(45deg);
        backdrop-filter: blur(15px);
        z-index: 1;
    }
}

.dropdown__item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    color: $text-primary;
    cursor: pointer;
    transition: all 0.25s ease;
    border-bottom: 1px solid rgba(255, 107, 107, 0.1);

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(78, 205, 196, 0.15) 100%);
        transform: translateX(4px);
    }

    &.active {
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(78, 205, 196, 0.2) 100%);
        color: $accent-coral;
    }

    .item-icon {
        margin-right: 12px;
        font-size: 16px;
        color: $accent-turquoise;
        width: 20px;
        text-align: center;
    }

    span {
        flex: 1;
        font-weight: 500;
    }

    .item-check {
        color: $accent-coral;
        font-size: 14px;
        margin-left: 8px;
    }

    &.dropdown__item--remove {
        color: #ff6b6b;

        .item-icon {
            color: #ff6b6b;
        }

        &:hover {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%);
        }
    }
}

.dropdown__separator {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 107, 107, 0.3) 50%, transparent 100%);
    margin: 8px 0;
}

@keyframes dropdownFadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.control-btn {
    background: rgba(255, 107, 107, 0.8);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.play-btn {
    width: 60px;
    height: 60px;
    font-size: 24px;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: $accent-coral;
    border-radius: 2px;
    width: 35%;
    position: relative;
    transition: width 0.3s ease;
}

.progress-handle {
    position: absolute;
    right: -6px;
    top: -4px;
    width: 12px;
    height: 12px;
    background: $accent-coral;
    border-radius: 50%;
    box-shadow: 0 0 10px $accent-coral;
}

.time-display {
    color: white;
    font-size: 14px;
    min-width: 80px;
    text-align: center;
}

.volume-control {
    display: flex;
    align-items: center;
    gap: 8px;
}

.volume-slider {
    width: 80px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.volume-fill {
    height: 100%;
    background: $accent-turquoise;
    border-radius: 2px;
    width: 70%;
}

/* Settings menu */
.settings {
    position: relative;
}
.settings__menu {
    position: absolute;
    bottom: 56px;
    right: 0;
    background: rgba(26, 26, 46, 0.95);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 12px;
    padding: 12px;
    min-width: 220px;
    box-shadow: 0 12px 30px rgba(0,0,0,.4);
    backdrop-filter: blur(10px);
}
.settings__title {
    font-size: 12px;
    color: $text-secondary;
    margin: 6px 8px 8px;
    text-transform: uppercase;
}
.settings__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: $text-primary;
    transition: all .2s ease;
}
.settings__option:hover {
    background: rgba(255, 107, 107, 0.1);
}
.settings__option.active {
    color: $accent-coral;
    background: rgba(255, 107, 107, 0.15);
}
.settings__separator {
    height: 1px;
    margin: 8px 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 107, 107, 0.3) 50%, transparent 100%);
}

.action-buttons {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
}

.action-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;

    &-icon {
        font-size: 16px;
    }
}

.primary-btn {
    background: linear-gradient(45deg, $accent-coral, $hot-pink);
    color: white;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
    }
}

.secondary-btn {
    background: rgba(78, 205, 196, 0.2);
    color: $accent-turquoise;
    border: 1px solid $accent-turquoise;

    &:hover {
        background: rgba(78, 205, 196, 0.3);
        transform: scale(1.05);
    }
}

:deep(.anime__details-desc a) {
    color: #9bb6ff;
    text-decoration: none;
    transition: all .4s ease;
}

:deep(.anime__details-desc a:hover) {
    transition: all .4s ease;
    border-bottom: 1px solid rgba(122, 162, 255, 1);
    color: #9bb6ff;
}
</style>