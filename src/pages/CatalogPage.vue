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

                    <div class="grid-cards">
                        <RouterLink v-for="a in visible" :key="a.id" :to="`/animes/${a.id}`" class="catalog-card">
                            <div class="catalog-card__image" :style="{ backgroundImage: `url(${a.poster.originalUrl})` }"></div>
                            <div class="catalog-card__overlay"></div>
                            <div class="catalog-card__top">
                                <div v-if="a.status === 'ongoing'" class="status-badge status-badge--green">ONGOING</div>
                                <div v-else-if="a.status === 'released'" class="status-badge status-badge--gold">COMPLETED</div>
                            </div>
                            <div class="catalog-card__content">
                                <div class="catalog-card__title" :title="a.russian || a.name">{{ a.russian || a.name }}</div>
                                <div class="catalog-card__meta">
                                    <span class="meta-rating"><font-awesome-icon icon="fa-solid fa-star" /> {{ a.score || '—' }}</span>
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

                <aside class="content-right">
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
          <details class="filter-section" :open="false" :data-key="'status'" @toggle="onToggle('status', $event)">
            <summary class="section-title">Статус</summary>
            <div class="checks">
              <label v-for="s in statusOptions" :key="s.value" class="check">
                <input type="checkbox" :value="s.value" v-model="statuses" @change="applyFilters" />
                <span>{{ s.label }}</span>
              </label>
            </div>
          </details>

          

          <details class="filter-section" :open="false" :data-key="'sort'" @toggle="onToggle('sort', $event)">
            <summary class="section-title">Сортировка</summary>
            <div class="sort-list">
              <button v-for="o in sortOptions" :key="o.value" class="sort-item" :class="{active: sortBy === o.value}" @click="setSort(o.value)">{{ o.label }}</button>
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
                </aside>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { searchCatalog } from '@/api/searchCatalog'

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

function setSort(v){ sortBy.value = v; applyFilters() }

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

<style lang="scss" scoped>
.CatalogPage {
    min-height: 100vh;
    padding: 100px 0 60px;
    background: linear-gradient(135deg, $primary-bg 0%, $secondary-bg 50%, $dark-blue 100%);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%);
        pointer-events: none;
    }
}

.container {
    max-width: 1525px;
    padding: 0 15px;
    margin: 0 auto;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
}
.content-left { min-width: 0; }
.content-right { position: sticky; top: 140px; height: fit-content; max-height: calc(100vh - 160px); overflow: auto; padding-right: 4px; }
.content-right::-webkit-scrollbar { width: 8px; }
.content-right::-webkit-scrollbar-thumb { background: rgba(255,107,107,.35); border-radius: 6px; }
.content-right .filters { margin-top: 16px; width: 100%; max-width: 420px; }

.hero {
    text-align: center;
    margin: 20px 0 24px;
}

.title {
    font-family: 'Orbitron';
    font-size: 44px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 10px;

    span {
        color: $accent-coral;
    }
}

.subtitle {
    color: #c7c7d3;
    max-width: 900px;
    margin: 0 auto;
}

.filters {
    background: rgba(26, 26, 46, .55);
    border: 1px solid rgba(255, 107, 107, .25);
    border-radius: 16px;
    padding: 22px 24px;
    position: relative; /* для корректного z-index дочерних поповеров */
    z-index: 10;
}

.row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.row.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 16px;
    align-items: end;
    margin: 0;
}

/* Расширенная сетка фильтров */
.grid-filters {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
    gap: 16px;
}
/* В правой колонке всегда одна колонка, чтобы ничего не упиралось в правый край */
.content-right .grid-filters { grid-template-columns: 1fr; }
.content-right .filter-section { width: 100%; }
@media (max-width: 1400px) {
    .content-grid { grid-template-columns: 1fr 340px; }
    .content-right .filters { max-width: 340px; }
}
@media (max-width: 1280px) {
    .content-grid { grid-template-columns: 1fr; }
    .content-right { position: static; }
    .content-right .filters { max-width: 100%; }
}

.filter-section, details.filter-section {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 107, 107, 0.18);
    border-radius: 14px;
    padding: 14px 14px 12px;
    position: relative;
    transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
}
details.filter-section {
    overflow: visible;
    position: relative; /* создаём контекст для абсолютных списков */
}
details.filter-section[open] {
    border-color: $accent-coral;
    box-shadow: 0 8px 22px rgba(255, 107, 107, .18);
    z-index: 2000; /* поверх соседних блоков */
}
details.filter-section:hover {
    border-color: $accent-coral;
    box-shadow: 0 8px 22px rgba(255, 107, 107, .18);
    transform: translateY(-2px);
}

.section-title, details.filter-section > summary.section-title {
    font-family: 'Orbitron';
    font-weight: 800;
    font-size: 13px;
    letter-spacing: .4px;
    color: #eaeaff;
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%);
    padding: 14px 16px;
    border-radius: 12px;
    border: 2px solid rgba(255, 107, 107, 0.28);
    margin: 0 0 12px;
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
}
details.filter-section > summary::-webkit-details-marker { display: none; }
details.filter-section > summary.section-title::after {
    content: '\25BE'; /* ▾ */
    color: #cfd3ff;
    font-size: 14px;
    transition: transform .25s ease;
}
details.filter-section[open] > summary.section-title::after { transform: rotate(180deg); }
details.filter-section > summary.section-title:hover {
    border-color: $accent-coral;
    box-shadow: 0 12px 35px rgba(255, 107, 107, 0.2);
    transform: translateY(-2px);
}

.checks {
    display: none; /* скрыта по умолчанию, чтобы не толкать сетку */
    position: absolute;
    top: calc(100% + 10px); /* немного ниже, чтобы не налипало на summary */
    left: 0;
    right: auto;
    z-index: 3000;
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
    background: rgba(26, 26, 46, 0.95);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    max-height: 320px;
    overflow: auto;
    min-width: 280px;
    max-width: min(640px, calc(100vw - 40px));
}
.checks.cols {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
    gap: 8px 12px;
    min-width: 520px;
    max-width: min(760px, calc(100vw - 40px));
}
details.filter-section[open] > .checks { display: grid; }

.check {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    color: #dfe5ff;
    cursor: pointer;
    transition: background .2s ease, border-color .2s ease, transform .2s ease;
}
.check:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(78,205,196,.35);
}
.check input[type="checkbox"] {
    width: 16px; height: 16px; margin: 0;
    accent-color: $accent-coral;
}

.sort-list { 
    display: none; /* поповер */
    position: absolute; 
    top: calc(100% + 10px); 
    left: 0; right: 0; z-index: 3000;
    background: rgba(26,26,46,0.95);
    border: 1px solid rgba(255,107,107,0.3);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 15px 40px rgba(0,0,0,.4);
    padding: 10px;
    flex-direction: column; gap: 6px;
    min-width: 260px;
    max-width: min(520px, calc(100vw - 40px));
}
/* Выравниваем поповеры вправо для правого столбца грид-сетки */
.grid-filters > details.filter-section:nth-child(3n),
.grid-filters > details.filter-section.align-right {
    position: relative;
}
.grid-filters > details.filter-section:nth-child(3n) > .checks,
.grid-filters > details.filter-section:nth-child(3n) > .sort-list,
.grid-filters > details.filter-section.align-right > .checks,
.grid-filters > details.filter-section.align-right > .sort-list {
    left: auto; right: 0;
}
details.filter-section[open] > .sort-list { display: flex; }
.sort-item {
    text-align: left;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
    color: #cfd3ff;
    cursor: pointer;
    transition: background .2s ease, color .2s ease, border-color .2s ease, transform .2s ease;
}

/* === СТАБИЛЬНЫЕ ВЫПАДАЮЩИЕ СПИСКИ ВНУТРИ ПРАВОГО БЛОКА ===
   Когда фильтры в правой колонке, опускаем контент вниз и не даём выходить за пределы блока */
.content-right .filters { overflow: visible; }
.content-right .filters details.filter-section > .checks,
.content-right .filters details.filter-section > .sort-list {
    position: static; /* снимаем absolute, чтобы блок расширялся вниз */
    inset: auto;
    max-width: 100%;
    width: 100%;
    margin-top: 10px;
}
.checks-genres { grid-template-columns: 1fr; }
.sort-item:hover { background: rgba(255,255,255,0.06); color: #fff; transform: translateX(2px); }
.sort-item.active { background: linear-gradient(45deg, $accent-coral, $hot-pink); color: #000; border-color: transparent; }

.label {
    color: #cfd3ff;
    min-width: max-content;
}
.row-search { flex-direction: column; align-items: flex-start; gap: 8px; }
.row-search .label { margin-bottom: 2px; }
.row-search .search { width: 100%; }

.search {
    position: relative;
    flex: 1;
    display: flex;
    gap: 8px;
}

.input {
    flex: 1;
    height: 48px;
    padding: 0 14px;
    border-radius: 12px;
    background: #0f0e16;
    border: 1px solid #2a2036;
    color: #e9e9f4;
}

.icon-btn {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(45deg, $accent-coral, $hot-pink);
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
}

.icon-btn.clear {
    background: #2a2036;
    color: #d6d6e8;
    border: 1px solid rgba(255, 255, 255, .08);
}

.field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.select {
    height: 44px;
    border-radius: 10px;
    background: #0f0e16;
    border: 1px solid #2a2036;
    color: #e9e9f4;
    padding: 0 12px;
}

.select.small {
    height: 40px;
}

.actions {
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.reset {
    height: 44px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 10px;
    background: #2a2a3b;
    color: #dfe5ff;
    border: 1px solid rgba(255, 255, 255, .08);
    cursor: pointer;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 18px 0;
}

.found {
    color: #aeb3d1;
}

.sort {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #aeb3d1;
}

.grid-cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
}

.catalog-card {
    position: relative;
    display: block;
    height: 450px;
    border-radius: 16px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 107, 107, 0.18);
    transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
}

.catalog-card:hover {
    transform: translateY(-8px);
    border-color: $accent-coral;
    box-shadow: 0 14px 30px rgba(255, 107, 107, .25);
}

.catalog-card__image {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    filter: brightness(0.9);
}

.catalog-card__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(10, 10, 10, 0.0) 0%, rgba(10, 10, 15, 0.5) 45%, rgba(10, 10, 15, 0.9) 100%);
}

.catalog-card__content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 14px 14px 16px;
}

.catalog-card__top {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 6px;
    justify-content: flex-end;
}

.status-badge {
    font-size: 11px;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 800;
}

.status-badge--green {
    background: rgba(78, 205, 196, .9);
    color: #00110f;
}

.status-badge--gold {
    background: rgba(255, 206, 84, .95);
    color: #1b1200;
}

.catalog-card__title {
    color: #fff;
    font-family: 'Comfortaa';
    font-weight: 700;
    font-size: 16px;
    line-height: 1.35;
    margin: 0 0 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.catalog-card__meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.meta-rating {
    color: $accent-gold;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
}

.meta-year {
    color: $accent-turquoise;
    font-weight: 700;
}

.catalog-card__genres {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.catalog-card__genres span {
    background: rgba(78, 205, 196, .18);
    color: $accent-turquoise;
    border: 1px solid rgba(78, 205, 196, .28);
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
}

.catalog-card__watch {
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 20px;
    background: linear-gradient(45deg, $accent-coral, $hot-pink);
    color: #fff;
    font-weight: 700;
    font-family: 'Comfortaa';
    transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
}

.catalog-card__watch:hover,
.catalog-card__watch:focus-visible {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 24px rgba(255, 107, 107, 0.35);
    filter: brightness(1.05);
}

.sentinel {
    height: 1px;
}

.load-state {
    text-align: center;
    color: #aeb3d1;
    padding: 16px 0;
}

.load-state.end {
    opacity: .7;
}

@media (max-width: 1200px) {
    .grid-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 820px) {
    .row.grid {
        grid-template-columns: 1fr;
    }
    .grid-filters { grid-template-columns: 1fr; }

    .grid-cards {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 520px) {
    .grid-cards {
        grid-template-columns: 1fr;
    }
}
</style>