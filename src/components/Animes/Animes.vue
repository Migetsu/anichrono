<template>
  <main class="animes">
    <section class="anime" v-if="anime">
      <div class="anime__bg" :style="{ backgroundImage: `url(${anime.poster?.originalUrl || fallback})` }" />
      <div class="anime__veil"></div>

      <div class="container anime__content">
        <div class="anime__left">
          <img class="anime__poster" loading="lazy" :src="anime.poster?.originalUrl || fallback"
            :alt="anime.russian || anime.name" />

          <router-link class="button anime__watch" :to="`/watch/${anime.id}`">Смотреть</router-link>

          <div class="dropdown" v-if="auth.isLoggedIn">
            <button class="button anime__list" @click="showStatus = !showStatus">
              {{ buttonLabel }}
            </button>

            <ul v-if="showStatus" class="dropdown__menu">
              <li v-if="rate" class="dropdown__item dropdown__item--remove" @click="removeStatus">
                Удалить из списка
              </li>
              <li v-if="rate" class="dropdown__sep" aria-hidden="true"></li>

              <li v-for="opt in statusOptions" :key="opt.value" class="dropdown__item" @click="selectStatus(opt.value)">
                {{ opt.label }}
              </li>
            </ul>
          </div>
        </div>

        <div class="anime__right">
          <div class="anime__info glass">
            <h1 class="anime__title">{{ anime.russian || anime.name }}</h1>

            <ul class="anime__facts">
              <li v-if="anime.score" class="pill pill--gold">★ {{ anime.score }}</li>
              <li v-if="anime.status" class="pill">{{ mapTitleStatus(anime.status) }}</li>
              <li v-if="anime.kind" class="pill">{{ mapTitleKind(anime.kind) }}</li>
              <li v-if="anime.episodes" class="pill">Эпизодов: {{ anime.episodes }}</li>
            </ul>

            <div class="anime__meta">
              <span v-if="anime.airedOn?.date">Премьера: {{ fmtDate(anime.airedOn.date) }}</span>
              <span v-if="anime.releasedOn?.date">Завершено: {{ fmtDate(anime.releasedOn.date) }}</span>
              <span v-if="anime.duration">Эпизод: ~{{ anime.duration }} мин.</span>
            </div>
          </div>

          <article class="panel panel--desc">
            <h2 class="panel__title">Описание</h2>
            <div class="desc" v-html="safeDesc"></div>
          </article>

          <article class="panel panel--genres">
            <h2 class="panel__title">Жанры</h2>
            <div v-if="anime.genres?.length" class="chips">
              <span v-for="g in anime.genres" :key="g.id" class="chip">
                {{ g.russian || g.name }}
              </span>
            </div>
            <p v-else>—</p>
          </article>

          <article class="panel panel--studios">
            <h2 class="panel__title">Студии</h2>
            <div v-if="anime.studios?.length" class="chips">
              <span v-for="s in anime.studios" :key="s.id" class="chip">{{ s.name }}</span>
            </div>
            <p v-else>—</p>
          </article>
        </div>
      </div>
    </section>

    <section class="container state" v-show="loading || error">
      <div v-if="loading" class="loader">Загрузка…</div>
      <div v-else-if="error" class="error">{{ error }}</div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import DOMPurify from 'dompurify'
import { fetchAnimeById } from '@/scripts/fetchAnimeById'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'

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
</script>

<style scoped>
:root {
  --c-bg: #0b1220;
  --c-surface: #111b27;
  --c-border: rgba(255, 255, 255, .08);
  --c-text: #e7ecf3;
  --c-dim: #a9b3c3;
  --c-accent: #7aa2ff;
  --c-gold: #ffcf66;
  --header-h: 80px;
}

/* Страница/герой */
.animes {
  margin-top: var(--header-h);
  color: var(--c-text);
}

.anime {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 28px 0 32px;
  overflow: visible;
}

.anime__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.1) brightness(0.6);
}

.anime__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 15, 25, .2) 0%, rgba(10, 15, 25, .6) 70%, rgba(10, 15, 25, .9) 100%);
  z-index: 1;
  backdrop-filter: blur(5px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.anime__content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
  width: 100%;
  padding: 0 16px;
}

.anime__poster {
  width: 200px;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .5);
}

.anime__right {
  grid-column: 2;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(12, 1fr);
}

.anime__info,
.panel--desc {
  grid-column: 1 / -1;
}

.panel--genres {
  grid-column: 1 / 10;
}

.panel--studios {
  grid-column: 10 / -1;
}

.glass {
  background: rgba(17, 27, 39, .55);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 16px 18px;
  backdrop-filter: blur(6px);
}

.anime__title {
  margin: 0;
  font-weight: 800;
  font-size: clamp(22px, 4vw, 36px);
  color: #fff;
}

.anime__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 6px 0 10px;
  list-style: none;
  padding: 0;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  background: rgba(255, 255, 255, .08);
  color: #fff;
  border: 1px solid var(--c-border);
}

.pill--gold {
  background: rgba(255, 207, 102, .1);
  border-color: rgba(255, 207, 102, .35);
  color: gold;
}

.anime__meta {
  display: flex;
  gap: 16px;
  color: #fff;
  font-size: 13px;
  flex-wrap: wrap;
}

/* Кнопки/меню */
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

.panel {
  background: rgba(17, 27, 39, .55);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .18);
}

.panel__title {
  margin: 0 0 12px;
  font-size: 26px;
  letter-spacing: .2px;
  color: #fff;
}

.desc {
  color: #fff;
  font-size: 15.5px;
  line-height: 1.75;
  letter-spacing: .1px;
}

.desc :where(p, ul, ol) {
  margin: 0 0 12px;
}

.desc :where(ul, ol) {
  padding-left: 20px;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(122, 162, 255, .12);
  color: #fff;
  border: 1px solid rgba(122, 162, 255, .28);
}

.state {
  min-height: 48px;
}

.error {
  color: #ff6b6b;
  margin: 12px 0;
}

.loader {
  width: 100%;
  padding: 14px;
  text-align: center;
  color: var(--c-dim);
  border-radius: 10px;
  background: rgba(255, 255, 255, .04);
  border: 1px dashed var(--c-border);
}

:deep(.desc a) {
  color: var(--c-accent, #7aa2ff);
  text-decoration: none;
  transition: border-color .2s, color .2s, opacity .2s;
}

:deep(.desc a:hover) {
  border-bottom-color: rgba(122, 162, 255, .9);
  color: #9bb6ff;
}

@media (max-width: 780px) {
  .anime__content {
    grid-template-columns: 1fr;
    gap: 20px;
    justify-items: center;
  }

  .anime__right {
    grid-column: 1;
    width: 100%;
  }

  .anime__poster {
    width: 160px;
  }

  .panel--genres,
  .panel--studios,
  .panel--desc,
  .anime__info {
    grid-column: 1 / -1;
  }
}
</style>
