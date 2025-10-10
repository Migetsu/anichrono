<template>
    <div v-bind="$attrs">
        <main class="watch" v-if="anime">
            <div class="container">
            <section class="watch__video">
                <div class="watch__video-container">
                    <!-- Плеер Kodik -->
                    <div v-if="kodikPlayerUrl" class="watch__video-player">
                        <iframe 
                            :src="kodikPlayerUrl"
                            frameborder="0" 
                            allowfullscreen
                            class="kodik-iframe"
                            loading="lazy"
                            allow="autoplay *; fullscreen *"
                            @load="handleKodikPlayerLoad"
                            @error="handleKodikPlayerError"
                        ></iframe>
                        
                        <!-- Блок с ошибкой загрузки -->
                        <div v-if="showKodikFallback" class="kodik-fallback">
                            <div class="kodik-fallback__content">
                                <div class="kodik-fallback__icon">
                                    <font-awesome-icon icon="fa-solid fa-video-slash" />
                                </div>
                                <div class="kodik-fallback__text">
                                    <h4>Проблемы с воспроизведением</h4>
                                    <p>{{ kodikError || 'Плеер не может загрузиться' }}</p>
                                </div>
                                <button 
                                    @click="retryKodikLoad"
                                    class="kodik-fallback__btn"
                                >
                                    <font-awesome-icon icon="fa-solid fa-refresh" />
                                    Попробовать снова
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Загрузка -->
                    <div v-else-if="isLoadingKodik" class="watch__video-placeholder">
                        <font-awesome-icon icon="fa-solid fa-spinner" class="placeholder-icon spinning" />
                        <h3>Загрузка плеера...</h3>
                        <p>Поиск доступных серий</p>
                    </div>
                    
                    <!-- Ошибка или нет контента -->
                    <div v-else class="watch__video-placeholder">
                        <font-awesome-icon icon="fa-solid fa-video-slash" class="placeholder-icon" />
                        <h3>Контент недоступен</h3>
                        <p v-if="kodikError">{{ kodikError }}</p>
                        <p v-else>Для данного аниме не найдены доступные серии</p>
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
                        <button class="action-btn secondary-btn" @click="handleShare" :disabled="isSharing">
                            <font-awesome-icon 
                                :icon="isSharing ? 'fa-solid fa-spinner' : 'fa-solid fa-share'" 
                                class="action-btn-icon"
                                :class="{ spinning: isSharing }"
                            />
                            {{ isSharing ? 'Поделиться...' : 'Поделиться' }}
                        </button>
                    </div>
                </div>
            </section>
            </div>
        </main>
        <Footer />
        
        <!-- Модальное окно для шаринга -->
        <ShareModal 
            :is-visible="showShareModal"
            :share-result="shareResult"
            :share-url="currentUrl"
            @close="closeShareModal"
            @copy-link="handleCopyLink"
        />
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
import { searchKodikByShikimoriId } from '@/api/kodik'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import { useShare } from '@/composables/useShare'
import Footer from '@/components/Footer/Footer.vue'
import ShareModal from '@/components/ShareModal/ShareModal.vue'

const route = useRoute()
const auth = useAuthStore()
const lists = useListsStore()

// Share functionality
const { isSharing, shareWatchPage, copyToClipboard } = useShare()
const showShareModal = ref(false)
const shareResult = ref(null)
const currentUrl = ref('')

const anime = ref(null)
const loading = ref(true)
const error = ref('')
const fallback = '/default.jpg'

// Kodik данные
const kodikPlayerUrl = ref('')
const isLoadingKodik = ref(false)
const kodikError = ref('')
const showKodikFallback = ref(false)
const kodikPlayerLoaded = ref(false)

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
        // Загружаем данные Kodik после загрузки аниме
        await loadKodikData(id)
    } catch (e) {
        error.value = String(e?.message || e)
    } finally {
        loading.value = false
    }
}

async function loadKodikData(shikimoriId) {
    if (!shikimoriId) return
    
    isLoadingKodik.value = true
    kodikError.value = ''
    kodikPlayerUrl.value = ''
    
    try {
        const data = await searchKodikByShikimoriId(shikimoriId)
        
        if (data && data.results && data.results.length > 0) {
            const result = data.results[0]
            
            // Загружаем первую серию
            if (result.seasons && result.seasons.length > 0) {
                const firstSeason = result.seasons[0]
                
                if (firstSeason.episodes && firstSeason.episodes.length > 0) {
                    const firstEpisode = firstSeason.episodes[0]
                    kodikPlayerUrl.value = firstEpisode.link
                }
            } else if (result.link) {
                // Если нет сезонов, используем прямую ссылку
                kodikPlayerUrl.value = result.link
            }
        } else {
            kodikError.value = 'Аниме не найдено в базе Kodik'
        }
    } catch (e) {
        console.error('Ошибка загрузки Kodik данных:', e)
        kodikError.value = 'Ошибка загрузки плеера'
    } finally {
        isLoadingKodik.value = false
    }
}

// Обработчики плеера
function handleKodikPlayerLoad() {
    kodikPlayerLoaded.value = true
    showKodikFallback.value = false
}

function handleKodikPlayerError() {
    kodikPlayerLoaded.value = false
    showKodikFallback.value = true
}

function retryKodikLoad() {
    if (anime.value?.id) {
        loadKodikData(anime.value.id)
    }
}

// Share functions
async function handleShare() {
    if (!anime.value) return
    
    try {
        currentUrl.value = window.location.href
        const result = await shareWatchPage(anime.value, currentUrl.value)
        shareResult.value = result
        showShareModal.value = true
    } catch (error) {
        console.error('Ошибка при шаринге:', error)
        shareResult.value = { success: false, method: 'error' }
        showShareModal.value = true
    }
}

function closeShareModal() {
    showShareModal.value = false
    shareResult.value = null
}

async function handleCopyLink(url) {
    try {
        await copyToClipboard(url)
        // Можно добавить уведомление об успешном копировании
    } catch (error) {
        console.error('Ошибка при копировании:', error)
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

</script>

<style scoped lang="scss">
@import "@/pages/Watch/Watch.scss";

// Дополнительные стили для Kodik плеера
.kodik-iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
}

.kodik-fallback {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    
    &__content {
        text-align: center;
        color: white;
        padding: 2rem;
    }
    
    &__icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    &__text {
        margin-bottom: 1.5rem;
        
        h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }
        
        p {
            margin: 0;
            opacity: 0.8;
        }
    }
    
    &__btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: background-color 0.2s;
        
        &:hover {
            background: var(--primary-color-dark);
        }
    }
}

.placeholder-icon.spinning {
    animation: spin 1s linear infinite;
}

.action-btn-icon.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

// Стили для списка серий
.episodes__list {
    max-height: 400px;
    overflow-y: auto;
}

.episodes__season {
    margin-bottom: 1rem;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.episodes__season-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0.5rem;
    
    h4 {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 600;
    }
}

.episodes__season-count {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.episodes__list-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 0.25rem;
    
    &:hover {
        background: var(--hover-bg);
    }
    
    &.active {
        background: var(--primary-color-light);
        color: var(--primary-color);
    }
    
    &.watched {
        opacity: 0.7;
    }
}

.episodes__number {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    margin-right: 0.75rem;
    flex-shrink: 0;
}

.episodes__list-item.active .episodes__number {
    background: var(--primary-color);
    color: white;
}

.episodes__info {
    flex: 1;
    min-width: 0;
}

.episodes__title {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.episodes__duration {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.episodes__status {
    margin-left: 0.5rem;
    flex-shrink: 0;
}

.episodes__watched-icon {
    color: var(--success-color);
}

.episodes__play-icon {
    color: var(--text-secondary);
}

.episodes__list-item.active .episodes__play-icon {
    color: var(--primary-color);
}
</style>