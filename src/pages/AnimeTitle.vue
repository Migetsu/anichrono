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
                        <button class="button anime__list" @click="showStatus = !showStatus">
                            {{ buttonLabel }}
                        </button>

                        <ul v-if="showStatus" class="dropdown__menu">
                            <li v-if="rate" class="dropdown__item dropdown__item--remove" @click="removeStatus">
                                Удалить из списка
                            </li>
                            <li v-if="rate" class="dropdown__sep" aria-hidden="true"></li>

                            <li v-for="opt in statusOptions" :key="opt.value" class="dropdown__item"
                                @click="selectStatus(opt.value)">
                                {{ opt.label }}
                            </li>
                        </ul>
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
            <section class="anime__episodes">
                <h2 class="anime__episodes-title"><font-awesome-icon icon="fa-solid fa-list" /> Эпизоды</h2>
                <div class="anime__episodes-content">
                    <div class="anime__episodes-item" v-for="episode in episodesCount" :key="episode">
                        <div class="episode-number">Эпизод {{ episode }}</div>
                        <div class="episode-duration">24 мин.</div>
                    </div>
                </div>
            </section>
        </div>
    </main>
    <Footer />
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
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

const buttonLabel = computed(() => {
    if (!auth.isLoggedIn) return 'Добавить в список'
    if (ratePending.value || lists.loading) return 'Загрузка…'
    return rate.value ? (STATUS_LABELS[rate.value.status] ?? 'В списке') : 'Добавить в список'
})

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
        overflow: hidden;
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
}

.dropdown__menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    margin-top: 4px;
    list-style: none;
    padding: 0;
    background-color: rgba(20, 20, 20, .9);
    border-radius: 8px;
    overflow: hidden;
    z-index: 50;
    border: 1px solid var(--c-border);
    box-shadow: 0 12px 24px rgba(0, 0, 0, .35);
}

.dropdown__item {
    padding: 10px 18px;
    color: #fff;
    cursor: pointer;
    transition: background-color .2s;
}

.dropdown__item:hover {
    background-color: rgba(20, 20, 20, 1);
}

.dropdown__item--remove {
    color: #ffb5b5;
}

.dropdown__sep {
    height: 1px;
    background: rgba(255, 255, 255, .08);
    margin: 4px 0;
}

.button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 10px 18px;
    margin-top: 15px;
    background-color: rgba(20, 20, 20, 0.7);
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: background-color .2s;
    box-shadow: 0 4px 12px rgba(122, 162, 255, .35);
}

.button:hover {
    background-color: rgba(20, 20, 20, 1);
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