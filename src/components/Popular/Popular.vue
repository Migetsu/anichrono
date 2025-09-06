<template>
  <main class="popular">
    <section class="container">
      <div class="popular__title">
        <h2 class="popular__title-text">Популярное</h2>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="popular__title-icon" />
      </div>
      <Swiper :modules="[Navigation, Pagination, Autoplay]" :slides-per-view="6" :space-between="16"
        :breakpoints="breakpoints" :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }"
        :speed="600" navigation pagination loop class="popular__swiper">
        <SwiperSlide v-for="a in animes" :key="a.id" class="popular__swiper-item">
          <RouterLink class="card" :to="`/animes/${a.id}`" :title="a.russian || a.name" :style="{
            backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${a.poster?.originalUrl || fallback})`,
            backgroundSize: '100% 100%, cover',
            backgroundPosition: 'center, center',
            backgroundRepeat: 'no-repeat, no-repeat'
          }">
            <!-- текст -->
            <div class="card__content">
              <h3 class="card__title">{{ a.russian || a.name }}</h3>
              <small class="card__meta">★ {{ a.score || '—' }}</small>
            </div>
          </RouterLink>
        </SwiperSlide>

        <!-- скелетоны -->
        <SwiperSlide
          v-if="loading"
          v-for="i in 6"
          :key="'skeleton-' + i"
          class="popular__swiper-item"
        >
          <div class="skeleton"></div>
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
import { shikiGQL } from '../../scripts/shikiClient.js'

const animes = ref([])
const loading = ref(true)
const error = ref('')
const fallback = '/placeholder.jpg' // помести в /public/placeholder.jpg

// брейкпоинты: >=1440 → 6; >=1280 → 5; >=1024 → 4; >=768 → 3; >=560 → 2; <560 → 1
const breakpoints = {
  560: { slidesPerView: 2 },
  768: { slidesPerView: 3 },
  1024: { slidesPerView: 4 },
  1280: { slidesPerView: 5 },
  1440: { slidesPerView: 6 }
}

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
    const data = await shikiGQL(QUERY_POPULAR, { limit: 12 })
    animes.value = data.animes ?? []
  } catch (e) {
    error.value = String(e.message || e)
    console.error('Shikimori request error:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.popular {
  margin-top: 100px;

  &__title {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    color: #fff;

    &-text {
      font-size: 32px;
      font-weight: 700;
    }

    &-icon {
      font-size: 20px;
    }
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

.popular__swiper {
  width: 100%;
  height: 320px;
}

/* карточка */
.card {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  text-decoration: none;
  transform: translateZ(0);
}

/* текст */
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
  margin-bottom: 10px;
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
    /* до 2 строк */
    line-clamp: 2;
    /* стандартное свойство для совместимости */
    -webkit-box-orient: vertical;
  }
}

.card__meta {
  opacity: .9;
  font-weight: 600;
  font-size: 16px;
}

/* чтобы пули пагинации не залезали на текст */
:deep(.swiper-pagination) {
  bottom: 0px !important;
  z-index: 3;
}

/* навигация выше всего */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  z-index: 4;
}

/* скелетон */
.skeleton {
  width: 100%;
  height: 100%;
  border-radius: 14px;
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
