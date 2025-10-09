<template>
    <div class="CatalogPage">
        <div class="container">
            <div class="hero">
                <h1 class="title"><span>Каталог</span> Аниме</h1>
                <p class="subtitle">Откройте для себя тысячи аниме с возможностью продвинутой фильтрации и
                    персонализированных рекомендаций</p>
            </div>

            <div class="content-grid">
                <div class="content-left">
                    <div class="toolbar">
                        <div class="found">Найдено: {{ visible.length }} аниме</div>
                        <div class="sort">
                            <span>Сортировать по:</span>
                            <select v-model="sortBy" class="select small" @change="applyFilters">
                                <option value="popularity">Популярности</option>
                                <option value="ranked">Оценке</option>
                                <option value="aired_on">Году</option>
                                <option value="title">Алфавиту</option>
                            </select>
                        </div>
                    </div>

                    <!-- Место фильтров перенесено сюда -->
                    <div class="filters" ref="filtersRoot">
                        <div class="row row-search">
                            <label class="label">Поиск:</label>
                            <div class="search">
                                <input v-model.trim="query" type="text" class="input" placeholder="Название аниме..."
                                    @keyup.enter="applyFilters" />
                                <button v-if="query" class="icon-btn clear" @click="clearQuery" :title="'Очистить'">
                                    <font-awesome-icon icon="fa-solid fa-xmark" />
                                </button>
                                <button class="icon-btn" @click="applyFilters" :title="'Искать'">
                                    <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
                                </button>
                            </div>
                        </div>

                        <div class="row grid grid-filters">
                            <details class="filter-section" :open="false" :data-key="'status'"
                                @toggle="onToggle('status', $event)">
                                <summary class="section-title">Статус</summary>
                                <div class="checks">
                                    <label v-for="s in statusOptions" :key="s.value" class="check">
                                        <input type="checkbox" :value="s.value" v-model="statuses"
                                            @change="applyFilters" />
                                        <span>{{ s.label }}</span>
                                    </label>
                                </div>
                            </details>

                            <details class="filter-section" :open="false" :data-key="'sort'"
                                @toggle="onToggle('sort', $event)">
                                <summary class="section-title">Сортировка</summary>
                                <div class="sort-list">
                                    <button v-for="o in sortOptions" :key="o.value" class="sort-item"
                                        :class="{ active: sortBy === o.value }" @click="setSort(o.value)">{{ o.label
                                        }}</button>
                                </div>
                            </details>

                            <div class="actions">
                                <button class="reset" @click="resetFilters">
                                    <font-awesome-icon icon="fa-solid fa-rotate-left" />
                                    <span>Сбросить фильтры</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="grid-cards">
                        <RouterLink v-for="a in visible" :key="a.id" :to="`/animes/${a.id}`" class="catalog-card">
                            <div class="catalog-card__image"
                                :style="{ backgroundImage: `url(${a.poster.originalUrl})` }"></div>
                            <div class="catalog-card__overlay"></div>
                            <div class="catalog-card__top">
                                <div v-if="a.status === 'ongoing'" class="status-badge status-badge--green">ONGOING
                                </div>
                                <div v-else-if="a.status === 'released'" class="status-badge status-badge--gold">
                                    COMPLETED</div>
                            </div>
                            <div class="catalog-card__content">
                                <div class="catalog-card__title" :title="a.russian || a.name">{{ a.russian || a.name }}
                                </div>
                                <div class="catalog-card__meta">
                                    <span class="meta-rating"><font-awesome-icon icon="fa-solid fa-star" /> {{ a.score
                                        || '—' }}</span>
                                    <span class="meta-year">{{ a.airedOn?.year || '—' }}</span>
                                </div>
                                <div class="catalog-card__genres" v-if="a.genres?.length">
                                    <span v-for="g in a.genres.slice(0, 3)" :key="g.id">{{ g.russian || g.name }}</span>
                                </div>
                                <router-link :to="`/watch/${a.id}`" class="catalog-card__watch">
                                    <font-awesome-icon icon="fa-solid fa-play" />
                                    <span>Смотреть</span>
                                </router-link>
                            </div>
                        </RouterLink>
                        <div ref="sentinel" class="sentinel"></div>
                    </div>
                    <div class="load-state" v-if="loading">Загрузка...</div>
                    <div class="load-state end" v-else-if="!hasMore && items.length">Это всё</div>
                </div>

                
            </div>
        </div>
    </div>
    <Footer />
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { searchCatalog } from '@/api/searchCatalog'
import Footer from '@/components/Footer/Footer.vue'

const query = ref('')
const sortBy = ref('popularity')
// расширенные фильтры
const statuses = ref([])
// Убраны прочие фильтры — остаётся статус + поиск + сортировка

const page = ref(1)
const limit = 20
const items = ref([])
const loading = ref(false)
const hasMore = ref(true)
const sentinel = ref(null)
let io = null
const filtersRoot = ref(null)
const openedKey = ref(null)

onMounted(() => {
    reloadFromStart()
    setupIO()
})

function setupIO() {
    if (io) io.disconnect()
    io = new IntersectionObserver((entries) => {
        const e = entries[0]
        if (e && e.isIntersecting && hasMore.value && !loading.value) {
            loadNext()
        }
    }, { root: null, rootMargin: '400px', threshold: 0 })
    if (sentinel.value) io.observe(sentinel.value)
}

const allGenres = computed(() => {
    const set = new Set()
    items.value.forEach(a => a.genres?.forEach(g => set.add(g.russian || g.name)))
    return Array.from(set).sort()
})

// опции фильтров (упрощённо)
const statusOptions = [
    { value: 'anons', label: 'Анонсировано' },
    { value: 'ongoing', label: 'Сейчас выходит' },
    { value: 'released', label: 'Вышедшее' },
]
const kindOptions = []
const sortOptions = [
    { value: 'ranked', label: 'По рейтингу' },
    { value: 'popularity', label: 'По популярности' },
    { value: 'title', label: 'По алфавиту' },
    { value: 'aired_on', label: 'По дате выхода' },
]
const seasonOptions = []
const scoreOptions = [
    { value: '8+', label: '8+' },
    { value: '7+', label: '7+' },
    { value: '6+', label: '6+' },
]
const audienceOptions = []

function yearsFromSeasons(list) {
    const out = new Set()
    for (const s of list || []) {
        if (/^\d{4}$/.test(s)) { out.add(Number(s)); continue }
        if (/^(\d{4})-(\d{4})$/.test(s)) {
            const [, a, b] = s.match(/(\d{4})-(\d{4})/)
            const start = Number(a), end = Number(b)
            for (let y = start; y <= end; y++) out.add(y)
            continue
        }
        if (s === '1990s') { for (let y = 1990; y <= 1999; y++) out.add(y); continue }
        if (s === '1980s') { for (let y = 1980; y <= 1989; y++) out.add(y); continue }
        if (s === 'older') { for (let y = 1900; y <= 1979; y++) out.add(y); continue }
        // сезон вида 2025-winter -> год 2025
        const yearMatch = s.match(/(\d{4})/)
        if (yearMatch) out.add(Number(yearMatch[1]))
    }
    return Array.from(out)
}

async function fetchPage() {
    loading.value = true
    try {
        const order = sortBy.value
        // Разворачиваем диапазоны сезонов в набор лет
        const yearsArray = []
        // Подготовим набор серверных комбинаций
        const statusesList = statuses.value.length ? [...new Set(statuses.value)] : [undefined]
        const kindsList = [undefined]
        const yearsList = [undefined]

        const filtersActive = Boolean(statuses.value.length || (query.value || '').trim())

        const fetchComboPage = (pg, st) => searchCatalog({
            page: pg,
            limit,
            search: query.value || undefined,
            status: st,
            order,
        }).catch(() => [])

        const merged = []
        const seen = new Set()

        if (filtersActive) {
            for (const st of statusesList) {
                let pg = 1
                while (true) {
                    const arr = await fetchComboPage(pg, st)
                    if (!Array.isArray(arr) || arr.length === 0) break
                    for (const a of arr) {
                        if (!a || seen.has(a.id)) continue
                        seen.add(a.id)
                        merged.push(a)
                    }
                    if (arr.length < limit) break
                    pg += 1
                }
            }
            hasMore.value = false
        } else {
            const arr = await fetchComboPage(page.value, statusesList[0])
            for (const a of arr) {
                if (!a || seen.has(a.id)) continue
                seen.add(a.id)
                merged.push(a)
            }
            hasMore.value = Array.isArray(arr) && arr.length === limit
        }

        if (page.value === 1) items.value = []
        items.value.push(...merged.filter(Boolean))
    } catch (e) {
        console.error('fetchPage error', e)
        hasMore.value = false
    } finally {
        loading.value = false
    }
}

function reloadFromStart() {
    page.value = 1
    hasMore.value = true
    items.value = []
    fetchPage()
}

function loadNext() {
    if (!hasMore.value || loading.value) return
    page.value += 1
    fetchPage()
}

const filtered = computed(() => {
    const q = (query.value || '').toLowerCase()
    return items.value.filter(a => {
        const byQ = !q || (a.russian || '').toLowerCase().includes(q) || (a.name || '').toLowerCase().includes(q)
        const byStatuses = !statuses.value.length || statuses.value.includes(a.status)
        return byQ && byStatuses
    })
})

const visible = computed(() => {
    const arr = [...filtered.value]
    switch (sortBy.value) {
        case 'ranked':
            return arr.sort((a, b) => (b.score || 0) - (a.score || 0))
        case 'aired_on':
            return arr.sort((a, b) => (b.airedOn?.year || 0) - (a.airedOn?.year || 0))
        case 'title':
            return arr.sort((a, b) => (a.russian || a.name || '').localeCompare(b.russian || b.name || ''))
        default:
            return arr
    }
})
function resetFilters() {
    query.value = ''
    sortBy.value = 'popularity'
    statuses.value = []
    reloadFromStart()
}

function setSort(v) { sortBy.value = v; applyFilters() }

function applyFilters() { reloadFromStart() }
const clearQuery = () => { query.value = ''; reloadFromStart() }

function onToggle(key, evt) {
    if (!evt?.target?.open) {
        if (openedKey.value === key) openedKey.value = null
        return
    }
    openedKey.value = key
    const root = filtersRoot.value
    if (!root) return
    const all = root.querySelectorAll('details.filter-section')
    all.forEach(d => {
        if (d.dataset.key !== key && d.open) d.open = false
    })
}

watch(query, (v, o) => {
    if (v === o) return
    debounceReload()
})

let debounceTimer = null
function debounceReload() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => reloadFromStart(), 400)
}
</script>

<style scoped lang="scss">
@import "@/pages/CatalogPage/CatalogPage.scss"
</style>