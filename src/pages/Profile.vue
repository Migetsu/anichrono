<template>
  <main class="profile container">
    <!-- Шапка профиля -->
    <header class="profile__head">
      <img class="profile__avatar" :src="avatarUrl" alt="avatar" />
      <div class="profile__info">
        <h1 class="profile__title">Профиль</h1>
        <div class="profile__name">{{ nickname }}</div>
        <button class="logout-btn" @click="logout">Выйти</button>
      </div>
    </header>

    <section v-for="s in statuses" :key="s.key" class="section">
      <h2 class="section__title">{{ s.title }}</h2>

      <div v-if="loading" class="section__state">Загрузка…</div>
      <div v-else-if="error" class="section__state error">{{ error }}</div>

      <template v-else>
        <ul v-if="groupedLists[s.key].length" class="cards">
          <li v-for="rate in groupedLists[s.key]" :key="rate.id || rate.target_id">
            <RouterLink
              class="card"
              :to="`/animes/${rateId(rate)}`"
              :style="cardBg(rate)"
              v-inview="rate"
            >
              <div class="card__veil"></div>
              <div class="card__content">
                <div class="card__name">
                  {{ rate.anime?.russian || rate.anime?.name || rate.target?.russian || rate.target?.name || rateId(rate) }}
                </div>
              </div>
            </RouterLink>
          </li>
        </ul>
        <p v-else class="section__state">Пусто</p>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, watch, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import { fetchAnimeById } from '@/api/searchAnimeById'

const auth  = useAuthStore()
const lists = useListsStore()

async function pullRates(force = false) {
  if (!auth?.token || !auth?.user?.id) return
  if (lists.loading) return
  if (force || !lists.rates.length) {
    try { await lists.fetchRates() } catch {}
  }
}

onMounted(() => pullRates(true))
watch(() => [auth?.token, auth?.user?.id], () => pullRates(true))

function toAbs(url) {
  if (!url) return ''
  if (url.startsWith('//')) return 'https:' + url
  if (/^https?:\/\//i.test(url)) return url
  return `https://shikimori.one${url}`
}

function collectCandidates(src) {
  if (!src) return []
  const list = [
    src.poster?.originalUrl,
    src.poster?.previewUrl,
    src.image?.original,
    src.image?.preview,
    src.image?.x256,
    src.image?.x192,
    src.image?.x96,
    src.image?.x48,
  ]
  return list.filter(Boolean).map(toAbs)
}

const avatarUrl = computed(() => {
  const u = auth?.user ?? {}
  const cand = [
    u.avatar, u.avatar_url,
    u.image?.x160, u.image?.x148, u.image?.x80, u.image?.x48,
    u.profile?.avatar
  ]
  for (const x of cand) if (x) return toAbs(x)
  return '/avatar.svg'
})
const nickname = computed(() =>
  auth?.user?.nickname || auth?.user?.name || auth?.user?.login || '—'
)

function logout() {
  auth.logout()
}

const groupedLists = computed(() => ({
  planned:    lists.grouped?.planned    ?? [],
  watching:   lists.grouped?.watching   ?? [],
  rewatching: lists.grouped?.rewatching ?? [],
  completed:  lists.grouped?.completed  ?? [],
  on_hold:    lists.grouped?.on_hold    ?? [],
  dropped:    lists.grouped?.dropped    ?? [],
}))
const loading = computed(() => lists.loading)
const error   = computed(() => lists.error)

const statuses = [
  { key: 'planned',    title: 'Запланировано' },
  { key: 'watching',   title: 'Смотрю' },
  { key: 'rewatching', title: 'Пересматриваю' },
  { key: 'completed',  title: 'Просмотрено' },
  { key: 'on_hold',    title: 'Отложено' },
  { key: 'dropped',    title: 'Брошено' },
]

const posterCache = reactive({})
const inFlight    = reactive(new Set())

function rateId(rate) {
  return Number(
    rate?.target_id ??
    rate?.targetId ??
    rate?.target?.id ??
    rate?.anime?.id
  )
}

function posterFromAnime(a) {
  const cands = [
    ...collectCandidates(a),
    a?.image && toAbs(a.image.original),
    a?.image && toAbs(a.image.preview),
  ].filter(Boolean)
  return cands[0] || ''
}

function imageOk(url) {
  return new Promise((res) => {
    const img = new Image()
    img.onload  = () => res(true)
    img.onerror = () => res(false)
    img.src = url
  })
}

async function ensurePosterForRate(rate) {
  const id = rateId(rate)
  if (!Number.isFinite(id)) return

  if (id in posterCache) return

  if (inFlight.has(id)) return
  inFlight.add(id)
  try {
    const full = await fetchAnimeById(id)
    const fromApi = posterFromAnime(full)
    if (fromApi && await imageOk(fromApi)) {
      posterCache[id] = fromApi
    } else {
      posterCache[id] = null 
    }
  } catch {
    posterCache[id] = null
  } finally {
    inFlight.delete(id)
  }
}
function cardBg(rate) {
  const id = rateId(rate)
  const url = posterCache[id]
  const finalUrl = url || '/poster-placeholder.jpg'
  return { backgroundImage: `url(${finalUrl})` }
}
const bgStyle = cardBg
const posterStyle = cardBg

watch(
  () => [
    groupedLists.value.planned.length,
    groupedLists.value.watching.length,
    groupedLists.value.rewatching.length,
    groupedLists.value.completed.length,
    groupedLists.value.on_hold.length,
    groupedLists.value.dropped.length,
  ],
  async () => {
    const all = [
      ...groupedLists.value.planned,
      ...groupedLists.value.watching,
      ...groupedLists.value.rewatching,
      ...groupedLists.value.completed,
      ...groupedLists.value.on_hold,
      ...groupedLists.value.dropped,
    ]
    for (const r of all.slice(0, 30)) {
      const id = rateId(r)
      if (id in posterCache) continue
      ensurePosterForRate(r)
    }
  },
  { immediate: true }
)

async function warmUp() {
  const take = (arr) => arr.slice(0, 6)
  const firstBatch = [
    ...take(groupedLists.value.planned),
    ...take(groupedLists.value.watching),
    ...take(groupedLists.value.rewatching),
    ...take(groupedLists.value.completed),
    ...take(groupedLists.value.on_hold),
    ...take(groupedLists.value.dropped),
  ]
  for (const r of firstBatch) ensurePosterForRate(r)
}

watch(
  () => lists.rates.length,
  (n) => { if (n) warmUp() },
  { immediate: true }
)

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const rate = (e.target).__rate
      if (rate) ensurePosterForRate(rate)
      io.unobserve(e.target)
    }
  },
  { root: null, rootMargin: '200px 0px 200px 0px', threshold: 0 }
)

const vInview = {
  mounted(el, binding) {
    el.__rate = binding.value
    io.observe(el)
  },
  updated(el, binding) {
    el.__rate = binding.value
  },
  unmounted(el) {
    io.unobserve(el)
    delete el.__rate
  },
}
</script>

<style scoped>
.profile { padding: 24px 0 48px; color: #e7ecf3; margin-top: 100px; }
.profile__head { display: flex; gap: 16px; align-items: center; margin-bottom: 18px; }
.profile__avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,.15); }
.profile__title { margin: 0 0 6px; font-size: 28px; }
.profile__name { opacity: .9; color: #fff; }
.logout-btn { margin-top: 8px; padding: 6px 12px; border: none; border-radius: 6px; background: #e74c3c; color: #fff; cursor: pointer; font-weight: 600; }
.logout-btn:hover { background: #c0392b; }

.section { margin: 22px 0; }
.section__title { margin: 0 0 10px; font-size: 20px; }
.section__state { opacity: .8; }

.cards { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px; }
.card { position: relative; display: block; height: 280px; border-radius: 12px; overflow: hidden; background: #0e1624; background-size: cover; background-position: center; box-shadow: 0 10px 24px rgba(0,0,0,.25); }
.card__veil { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,15,25,.12) 0%, rgba(10,15,25,.65) 65%, rgba(10,15,25,.92) 100%); }
.card__content { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 12px; }
.card__name { font-weight: 700; color: #fff; }
</style>