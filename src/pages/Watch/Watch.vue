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
                    <!-- Левая часть: постер и кнопки -->
                    <div class="anime__poster-section">
                        <div class="anime__poster">
                            <img 
                                :src="anime.poster?.originalUrl || anime.poster?.previewUrl || '/default.jpg'" 
                                :alt="anime.russian || anime.name"
                                @error="handleImageError"
                            />
                        </div>
                        <div class="anime__poster-actions">
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

                    <!-- Правая часть: информация об аниме -->
                    <div class="anime__info-section">
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
            @native-share="handleNativeShare"
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
        console.log('Загружаем Kodik данные для ID:', shikimoriId)
        const data = await searchKodikByShikimoriId(shikimoriId)
        console.log('Kodik ответ:', data)
        
        if (data && data.results && data.results.length > 0) {
            const result = data.results[0]
            console.log('Первый результат Kodik:', result)
            
            // Загружаем первую серию
            if (result.seasons && result.seasons.length > 0) {
                const firstSeason = result.seasons[0]
                console.log('Первый сезон:', firstSeason)
                
                if (firstSeason.episodes && firstSeason.episodes.length > 0) {
                    const firstEpisode = firstSeason.episodes[0]
                    console.log('Первая серия:', firstEpisode)
                    kodikPlayerUrl.value = firstEpisode.link
                } else {
                    kodikError.value = 'Нет доступных серий в первом сезоне'
                }
            } else if (result.link) {
                // Если нет сезонов, используем прямую ссылку
                console.log('Используем прямую ссылку:', result.link)
                kodikPlayerUrl.value = result.link
            } else {
                kodikError.value = 'Нет доступных ссылок для воспроизведения'
            }
        } else {
            console.log('Нет результатов от Kodik API')
            kodikError.value = 'Аниме не найдено в базе Kodik'
        }
    } catch (e) {
        console.error('Ошибка загрузки Kodik данных:', e)
        kodikError.value = `Ошибка загрузки плеера: ${e.message || e}`
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
function handleShare() {
    if (!anime.value) return
    
    currentUrl.value = window.location.href
    // Показываем модальное окно без результата - пользователь сам выберет способ шаринга
    shareResult.value = null
    showShareModal.value = true
}

function closeShareModal() {
    showShareModal.value = false
    shareResult.value = null
}

async function handleNativeShare() {
    if (!anime.value) return
    
    try {
        const result = await shareWatchPage(anime.value, currentUrl.value)
        shareResult.value = result
    } catch (error) {
        console.error('Ошибка при шаринге:', error)
        shareResult.value = { success: false, method: 'error' }
    }
}

async function handleCopyLink(url) {
    try {
        await copyToClipboard(url)
        // Устанавливаем результат успешного копирования
        shareResult.value = { success: true, method: 'clipboard' }
    } catch (error) {
        console.error('Ошибка при копировании:', error)
        shareResult.value = { success: false, method: 'error' }
    }
}

// Обработка ошибки загрузки изображения
function handleImageError(event) {
    const img = event.target
    if (img.src !== '/default.jpg') {
        img.src = '/default.jpg'
    } else {
        img.style.display = 'none'
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
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        position: relative;
        overflow: hidden;
        
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
            
            &::before {
                left: 100%;
            }
        }
        
        &:active {
            transform: translateY(0);
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
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

// Стили для блока информации об аниме
.watch__info {
    padding: 2rem 0;
}

.anime__details {
    display: flex;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

// Левая часть: постер и кнопки
.anime__poster-section {
    flex-shrink: 0;
    width: 300px;
}

.anime__poster {
    width: 100%;
    margin-bottom: 1.5rem;
    
    img {
        width: 100%;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
        
        &:hover {
            transform: scale(1.02);
        }
    }
}

.anime__poster-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

// Стили для кнопок
.anime__list-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        
        &::before {
            left: 100%;
        }
    }
    
    &:active {
        transform: translateY(0);
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
    }
    
    &.active {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
    }
    
    .btn-icon {
        font-size: 1.1rem;
        transition: transform 0.3s ease;
    }
    
    .btn-text {
        flex: 1;
        text-align: center;
    }
    
    .btn-arrow {
        font-size: 0.9rem;
        transition: transform 0.3s ease;
        
        &.rotated {
            transform: rotate(180deg);
        }
    }
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        
        &::before {
            left: 100%;
        }
    }
    
    &:active:not(:disabled) {
        transform: translateY(0);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }
    
    &.secondary-btn {
        background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
        color: #f9fafb;
        border: 2px solid #6b7280;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        
        &:hover:not(:disabled) {
            background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
            border-color: #3b82f6;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
    }
    
    .action-btn-icon {
        font-size: 1.1rem;
        transition: transform 0.3s ease;
        
        &.spinning {
            animation: spin 1s linear infinite;
        }
    }
}

// Dropdown стили
.dropdown {
    position: relative;
    width: 100%;
}

.dropdown__menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    overflow: hidden;
    animation: dropdownFadeIn 0.3s ease-out;
}

.dropdown__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid #374151;
    color: #f9fafb;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover {
        background: #374151;
    }
    
    &.active {
        background: #1e3a8a;
        color: #60a5fa;
    }
    
    &.dropdown__item--remove {
        color: #f87171;
        
        &:hover {
            background: #7f1d1d;
        }
    }
    
    .item-icon {
        font-size: 1rem;
        width: 1rem;
        text-align: center;
    }
    
    .item-check {
        margin-left: auto;
        color: #10b981;
    }
}

.dropdown__separator {
    height: 1px;
    background: #374151;
    margin: 0.5rem 0;
}

// Анимации
@keyframes dropdownFadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

// Правая часть: информация об аниме
.anime__info-section {
    flex: 1;
    min-width: 0;
}

.anime__details-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
    line-height: 1.2;
}

.anime__details-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.meta-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 80px;
}

.meta-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
}

.meta-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.anime__details-genres {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    
    span {
        background: var(--primary-color-light);
        color: var(--primary-color);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
    }
}

.anime__details-desc {
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 1rem;
    
    p {
        margin-bottom: 1rem;
        
        &:last-child {
            margin-bottom: 0;
        }
    }
}

// Адаптивность
@include respond(md) {
    .anime__details {
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .anime__poster-section {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
    }
    
    .anime__poster-actions {
        flex-direction: row;
        justify-content: center;
    }
    
    .anime__details-title {
        font-size: 2rem;
        text-align: center;
    }
    
    .anime__details-meta {
        justify-content: center;
    }
    
    .anime__details-genres {
        justify-content: center;
    }
}

@include respond(sm) {
    .anime__details {
        padding: 0 0.5rem;
    }
    
    .anime__details-title {
        font-size: 1.75rem;
    }
    
    .anime__details-meta {
        gap: 1rem;
    }
    
    .meta-item {
        min-width: 60px;
    }
    
    .meta-value {
        font-size: 1.25rem;
    }
    
    .anime__poster-actions {
        flex-direction: column;
    }
    
    .anime__list-btn,
    .action-btn {
        padding: 0.875rem 1.25rem;
        font-size: 0.9rem;
    }
    
    .dropdown__item {
        padding: 0.875rem 1rem;
        font-size: 0.9rem;
    }
}
</style>