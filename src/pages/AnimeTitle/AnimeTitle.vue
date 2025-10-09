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
                            <router-link class="anime__info-btn primary-btn" :to="`/watch/${anime.id}`">
                                <font-awesome-icon icon="fa-solid fa-play" />
                                Смотреть сейчас
                            </router-link>
                            <button class="anime__info-btn secondary-btn">
                                <font-awesome-icon icon="fa-solid fa-share" />
                                Поделиться
                            </button>
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
import Footer from '@/components/Footer/Footer.vue'

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
@import "@/pages/AnimeTitle/AnimeTitle.scss"
</style>