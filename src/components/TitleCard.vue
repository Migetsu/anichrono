<template>
    <Swiper :modules="[Navigation, Pagination, Autoplay]" :slides-per-view="4" :space-between="16"
        :breakpoints="breakpoints" :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }"
        :speed="600" :navigation="true" :pagination="{ clickable: true }" :loop="true" class="TitleCard__swiper">

        <SwiperSlide v-for="(slide, index) in slides" :key="index" class="TitleCard__swiper-item">
            <RouterLink :to="{ path: slide.path }">
                <div class="slide-content">
                    <img :src="slide.image" :alt="slide.title" class="slide-image">
                    <div class="slide-title">{{ slide.title }}</div>
                </div>
            </RouterLink>
        </SwiperSlide>
    </Swiper>
</template>

<script setup>
import { ref } from 'vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

const breakpoints = {
    560: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
    1024: { slidesPerView: 3 },
    1280: { slidesPerView: 4 },
    1440: { slidesPerView: 4 }
}

// Пример данных для слайдов
const slides = ref([
    { title: 'Слайд 1', path: '/anime/1', image: '/src/assets/images/anime-attack-titan.png' },
    { title: 'Слайд 2', path: '/anime/2', image: '/src/assets/images/anime-demon-slayer.png' },
    { title: 'Слайд 3', path: '/anime/3', image: '/src/assets/images/anime-hero-academia.png' },
    { title: 'Слайд 4', path: '/anime/4', image: '/src/assets/images/anime-jujutsu-kaisen.png' },
])
</script>

<style lang="scss" scoped>
.TitleCard__swiper {
    width: 100%;
    height: 100%;
    padding: 20px;

    .swiper-button-next,
    .swiper-button-prev {
        color: #fff;

        &:after {
            font-size: 24px;
        }
    }

    .swiper-pagination-bullet {
        background: #fff;
    }
}

.TitleCard__swiper-item {
    height: 300px;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }
}

.slide-content {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
}

.slide-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.slide-title {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 14px;
    text-align: center;
}
</style>