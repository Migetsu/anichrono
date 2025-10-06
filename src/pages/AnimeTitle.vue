<template>
    <main class="anime">
        <div class="anime-container">
            <section class="anime__info" v-if="anime">
                <div class="anime__info-left">
                    <div class="anime__info-poster">
                        <img :src="anime.poster?.originalUrl" alt="">
                        <div class="anime__info-status">{{ anime.status }}</div>
                    </div>
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
                </div>
                <div class="anime__info-content">
                    <div>
                        <h1 class="anime__info-title" :title="anime.russian || anime.name">{{ anime.russian ||
                            anime.name }}</h1>
                        <div class="anime__info-meta">
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
                                <div class="meta-value">{{ anime.kind }}</div>
                                <div class="meta-label">Статус</div>
                            </div>
                        </div>
                        <div class="anime__info-genres">
                            <span v-for="(genre, index) in anime.genres" :key="index">{{ genre.russian || genre.name
                            }}</span>
                        </div>
                        <div class="anime__info-desc" v-html="safeDesc"></div>
                        <div class="anime__info-btns">
                            <router-link class="anime__info-btn primary-btn"
                                :to="`/watch/${anime.id}`"><font-awesome-icon icon="fa-solid fa-play" /> Смотреть
                                сейчас</router-link>
                            <button class="anime__info-btn secondary-btn"><font-awesome-icon icon="fa-solid fa-share" />
                                Поделиться</button>
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

</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.anime {
    background: linear-gradient(45deg, $primary-bg, $secondary-bg);
    margin-top: 80px;
    min-height: calc(100vh - 80px);
    padding: 32px 0;

    &-container {
        max-width: 1525px;
        padding: 0 15px;
        margin: 0 auto;
        overflow: visible;
        position: relative;
    }

    &__info {
        background: rgba(26, 26, 46, 0.8);
        border-radius: 15px;
        padding: 32px;
        margin-bottom: 32px;
        border: 1px solid rgba(255, 107, 107, 0.2);
        backdrop-filter: blur(10px);
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 32px;
        overflow: visible;

        &-left {
            overflow: visible;
        }

        &-poster {
            width: 300px;
            height: 400px;
            border-radius: 15px;
            overflow: hidden;
            object-fit: contain;
            position: relative;

            & img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: all 0.4s ease;
            }
        }

        &-status {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            background: rgba(255, 107, 107, 0.9);
            color: white;
        }

        &-content {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        &-title {
            font-size: 40px;
            font-weight: 700;
            font-family: "Orbitron";
            margin-bottom: 16px;
            background: linear-gradient(45deg, $accent-coral, $accent-turquoise);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        &-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin-bottom: 24px;

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
                font-size: 12px;
            }
        }

        &-genres {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 24px;

            & span {
                background: rgba(78, 205, 196, 0.2);
                color: $accent-turquoise;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                border: 1px solid rgba(78, 205, 196, 0.3);
                transition: all 0.3s ease;
            }
        }

        &-desc {
            color: $text-secondary;
            line-height: 1.8;
            margin-bottom: 24px;
            font-size: 18px;
        }

        &-btns {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }

        &-btn {
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
        }
    }
}

.secondary-btn {
    background: rgba(78, 205, 196, 0.2);
    color: $accent-turquoise;
    border: 1px solid $accent-turquoise;
}

.primary-btn {
    background: linear-gradient(45deg, $accent-coral, $hot-pink);
    color: white;
}

:deep(.anime__info-desc a) {
    color: #9bb6ff;
    text-decoration: none;
    transition: all .4s ease;
}

:deep(.anime__info-desc a:hover) {
    transition: all .4s ease;
    border-bottom: 1px solid rgba(122, 162, 255, 1);
    color: #9bb6ff;
}

.dropdown {
    position: relative;
    width: 100%;
    margin-top: 16px;
}

.anime__list-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px 20px;
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

        &.rotated {
            transform: rotate(180deg);
        }
    }
}

.dropdown__menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: rgba(26, 26, 46, 0.95);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
    backdrop-filter: blur(15px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    animation: dropdownFadeIn 0.3s ease-out;
    max-height: 400px;
    min-height: auto;

    /* Стилизация скроллбара */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 107, 107, 0.3);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 107, 107, 0.5);
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
    padding: 14px 18px;
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
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .anime__list-btn {
        padding: 14px 16px;
        font-size: 15px;

        .btn-icon {
            font-size: 16px;
            margin-right: 10px;
        }

        .btn-arrow {
            font-size: 12px;
        }
    }

    .dropdown__item {
        padding: 12px 16px;

        .item-icon {
            font-size: 14px;
            margin-right: 10px;
        }

        span {
            font-size: 14px;
        }
    }

    .dropdown__menu {
        max-height: 300px;
        
        &::before {
            left: 16px;
        }
    }
}

@media (max-width: 480px) {
    .anime__list-btn {
        padding: 12px 14px;
        font-size: 14px;
    }

    .dropdown__item {
        padding: 10px 14px;
    }

    .dropdown__menu {
        max-height: 250px;
    }
}

.anime__episodes {
    background: rgba(26, 26, 46, 0.8);
    border-radius: 15px;
    padding: 32px;
    margin-bottom: 32px;
    border: 1px solid rgba(255, 107, 107, 0.2);
    backdrop-filter: blur(10px);

    &-title {
        font-size: 30px;
        font-weight: 600;
        margin-bottom: 24px;
        color: $accent-coral;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &-content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
    }

    &-item {
        background: rgba(22, 33, 62, 0.5);
        border-radius: 10px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 107, 107, 0.1);

        & .episode-number {
            font-size: 20px;
            font-weight: 600;
            color: $accent-coral;
            margin-bottom: 8px;
        }

        & .episode-duration {
            color: $text-secondary;
            font-size: 14px;
        }
    }
}
</style>