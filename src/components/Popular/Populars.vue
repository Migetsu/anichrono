<template>
  <main class="populars">
    <section class="container">
      <h1 class="page-title">Популярное</h1>
      <div class="cards">
        <template v-if="loading">
          <div v-for="i in 12" :key="i" class="skeleton"></div>
        </template>
        <template v-else>
          <RouterLink
            v-for="a in animes"
            :key="a.id"
            class="card"
            :to="`/animes/${a.id}`"
            :title="a.russian || a.name"
            :style="{
              backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${a.poster?.originalUrl || fallback})`,
              backgroundSize: '100% 100%, cover',
              backgroundPosition: 'center, center',
              backgroundRepeat: 'no-repeat, no-repeat'
            }"
          >
            <div class="card__content">
              <h3 class="card__title">{{ a.russian || a.name }}</h3>
              <small class="card__meta">★ {{ a.score || '—' }}</small>
            </div>
          </RouterLink>
        </template>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const animes = ref([])
const loading = ref(true)
const error = ref('')
const fallback = '/placeholder.jpg'

const QUERY_POPULAR = `
  query ($limit: Int) {
    animes(order: popularity, limit: $limit) {
      id
      name
      russian
      score
      poster { originalUrl }
    }
  }
`

onMounted(async () => {
  try {
    const { data } = await axios.post('/shiki/api/graphql', {
      query: QUERY_POPULAR,
      variables: { limit: 24 }
    })
    if (data.errors) throw new Error(data.errors[0]?.message || 'GraphQL error')
    animes.value = data.data?.animes ?? []
  } catch (e) {
    error.value = String(e.message || e)
    console.error('Shikimori request error:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.populars {
  margin-top: 100px;
}

.page-title {
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.card {
  position: relative;
  display: block;
  border-radius: 14px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  text-decoration: none;
  aspect-ratio: 2 / 3;
}

.card__content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  padding: 0 12px;
  color: #fff;
  z-index: 2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, .45);
  display: grid;
  gap: 4px;
}

.card__title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 1200px) {
  .card__title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.card__meta {
  opacity: .9;
  font-weight: 600;
  font-size: 16px;
}

.skeleton {
  border-radius: 14px;
  aspect-ratio: 2 / 3;
  background: linear-gradient(90deg, #1b1b1b 25%, #222 37%, #1b1b1b 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.error {
  color: #ff6b6b;
  margin-top: 12px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}
</style>
