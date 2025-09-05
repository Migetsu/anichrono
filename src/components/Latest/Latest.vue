<template>
  <main class="latest">
    <section class="container">
        <div class="latest__title">
        <h2 class="latest__title-text">Онгоинги</h2>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="latest__title-icon" />
        </div>
      <Swiper
        :modules="[Navigation, Pagination, Autoplay]"
        :slides-per-view="6"
        :space-between="16"
        :breakpoints="breakpoints"
        :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }"
        :speed="600"
        navigation
        pagination
        loop
        class="latest__swiper"
      >
        <!-- Карточки -->
        <SwiperSlide v-for="a in animes" :key="a.id" class="latest__swiper-item">
          <RouterLink
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
            <div class="card__shade"></div>
            <div class="card__content">
              <h3 class="card__title">{{ a.russian || a.name }}</h3>
              <small class="card__meta">★ {{ a.score || '—' }}</small>
            </div>
          </RouterLink>
        </SwiperSlide>

        <!-- Скелетоны -->
        <SwiperSlide v-if="loading" >
          <div class="skeleton" v-for="i in 6" :key="'skeleton-'+i"></div>
        </SwiperSlide>
      </Swiper>

      <p v-if="error" class="error">{{ error }}</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const animes = ref([])
const loading = ref(true)
const error = ref('')
const fallback = '/placeholder.jpg'

const breakpoints = {
  560: { slidesPerView: 2 },
  768: { slidesPerView: 3 },
  1024: { slidesPerView: 4 },
  1280: { slidesPerView: 5 },
  1440: { slidesPerView: 6 }
}

const QUERY_LATEST = `
  query ($limit: Int, $status: AnimeStatusString) {
    animes(status: $status, order: popularity, limit: $limit) {
      id
      name
      russian
      score
      poster { originalUrl }
      status
    }
  }
`

onMounted(async () => {
  try {
    const res = await fetch('/shiki/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY_LATEST, variables: { limit: 10, status: "ongoing" } })
    })
    const json = await res.json()
    console.log('Shikimori Latest JSON:', json)
    if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')
    animes.value = json.data?.animes ?? []
  } catch (e) {
    error.value = String(e.message || e)
    console.error('Shikimori request error:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  color: #fff;
}

:deep(.swiper-pagination-bullet) {
  background: #fff !important;
  opacity: 0.6;
}
:deep(.swiper-pagination-bullet-active) {
  background: #fff !important;
  opacity: 1;
}
</style>
