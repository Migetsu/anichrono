<template>
    <div class="TitleCard" v-if="items && items.length">
        <div class="TitleCard-container">
            <Swiper :modules="[Navigation, Autoplay]" :slides-per-view="4" :space-between="16"
                :breakpoints="breakpoints"
                :autoplay="{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }" :speed="600"
                :navigation="true" :pagination="false" :loop="true" :lazy="true" class="TitleCard__swiper">

                <SwiperSlide v-for="(anime, id) in items" :key="id" class="TitleCard__swiper-item">
                    <RouterLink :to="`/animes/${anime.id}`" class="card">
                        <div class="card-content">
                            <div class="card-image-wrapper">
                                <img :src="anime.poster.originalUrl" alt="" class="card-image">
                            </div>
                            <div class="card-info">
                                <h3 class="card-title" :title="anime.russian || anime.name">{{ anime.russian ||
                                    anime.name }}</h3>
                                <div class="card-meta">
                                    <div class="card-rating">
                                        <font-awesome-icon icon="fa-solid fa-star" class="card-rating-icon" />
                                        {{ anime.score }}
                                    </div>
                                    <div class="card-year">{{ anime.airedOn.year }}</div>
                                </div>
                                <div class="card-genres" v-if="anime.genres?.length">
                                    <span v-for="genre in anime.genres.slice(0, 3)" :key="genre.id">{{ genre.russian ||
                                        genre.name }}</span>
                                </div>
                                <router-link :to="`/watch/${anime.id}`">
                                    <button class="card-btn">
                                        <font-awesome-icon icon="fa-solid fa-play" />
                                        <span>Смотреть</span>
                                    </button>
                                </router-link>
                            </div>
                        </div>
                    </RouterLink>
                </SwiperSlide>
            </Swiper>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

const breakpoints = {
    320: { slidesPerView: 1 }, // xs
    480: { slidesPerView: 1 }, // sm
    768: { slidesPerView: 2 }, // md
    1024: { slidesPerView: 3 }, // lg
    1280: { slidesPerView: 4 }, // xl
    1600: { slidesPerView: 4 }  // xxl
}

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
})
</script>

<style scoped lang="scss">
@import "@/components/TitleCard/TitleCard.scss"
</style>