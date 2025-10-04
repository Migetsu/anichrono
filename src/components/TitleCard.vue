<template>
    <div class="TitleCard" v-if="items && items.length">
        <div class="TitleCard-container">
            <Swiper :modules="[Navigation, Autoplay]" :slides-per-view="4" :space-between="16"
                :breakpoints="breakpoints"
                :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }" :speed="600"
                :navigation="true" :pagination="{ clickable: true }" :loop="true" class="TitleCard__swiper">

                <SwiperSlide v-for="(anime, id) in items" :key="id" class="TitleCard__swiper-item">
                    <RouterLink :to="`/animes/${anime.id}`" class="card">
                        <div class="card-content">
                            <div class="card-image-wrapper">
                                <img :src="anime.poster.originalUrl" alt="" class="card-image">
                            </div>
                            <div class="card-info">
                                <h3 class="card-title" :title="anime.russian || anime.name">{{ anime.russian || anime.name }}</h3>
                                <div class="card-meta">
                                    <div class="card-rating">
                                        <font-awesome-icon icon="fa-solid fa-star" class="card-rating-icon" /> 
                                        {{ anime.score }}
                                    </div>
                                    <div class="card-year">{{ anime.airedOn.year }}</div>
                                </div>
                                <div class="card-genres" v-if="anime.genres?.length">
                                    <span v-for="genre in anime.genres.slice(0, 3)" :key="genre.id">{{ genre.russian || genre.name }}</span>
                                </div>
                                <button class="card-btn">
                                    <font-awesome-icon icon="fa-solid fa-play" />
                                    <span>Смотреть</span>
                                </button>
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
    560: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
    1024: { slidesPerView: 3 },
    1280: { slidesPerView: 4 },
    1440: { slidesPerView: 4 }
}

const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
})
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 107, 107, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 20;
    transition: background .22s ease, box-shadow .22s ease, transform .18s ease, opacity .22s ease;
    opacity: 0.95;
    border: none;
    /* чуть увеличим область клика */
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
}

:deep(.swiper-button-prev) svg,
:deep(.swiper-button-next) svg {
    width: 20px;
    height: 20px;
    color: #000;
    display: inline-block;
}

:deep(.swiper-button-prev) {
    left: 16px;
}

:deep(.swiper-button-next) {
    right: 16px;
}

:deep(.swiper-button-prev):hover,
:deep(.swiper-button-next):hover,
:deep(.swiper-button-prev):focus,
:deep(.swiper-button-next):focus {
    background: $accent-coral;
    box-shadow: 0 0 15px $accent-coral;
}

.TitleCard-container {
    max-width: 1525px;
    padding: 0 15px;
    margin: 0 auto;
    overflow: hidden;
    position: relative;
}

.TitleCard__swiper,
:deep(.swiper-wrapper) {
    overflow: visible;
}

.TitleCard__swiper {
    width: 100%;
    height: 100%;
    padding: 20px 0;

    :deep(.swiper-slide) {
        background: transparent !important;
        border-radius: 0 !important;
        overflow: visible;
        pointer-events: auto;
    }
}

.card {
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background: rgba(26, 26, 46, 0.8);
    border: 1px solid rgba(255, 107, 107, 0.2);
    border-radius: 15px;
    overflow: hidden;
    background-clip: padding-box;

    position: relative;
    transform: translateY(0);
    transition: transform 320ms cubic-bezier(.22, .9, .37, 1), box-shadow 320ms ease;
    will-change: transform, box-shadow;
    z-index: 0;
}

.card-content {
    display: block;
    margin: 0;
    padding: 0;
}

.card-image-wrapper {
    width: 100%;
    height: 250px;
    overflow: hidden;
    border-radius: inherit;
    position: relative;
    background: transparent;
}

.card-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform-origin: center top;
    transition: transform 420ms cubic-bezier(.22, .9, .37, 1);
    backface-visibility: hidden;
    will-change: transform;
}

.card-info {
    padding: 24px;
    transition: all .3s ease;
}

.card-title {
    font-family: 'Comfortaa';
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: $text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.card-rating {
    display: flex;
    align-items: center;
    color: $accent-gold;
    gap: 4px;
}

.card-year {
    color: $accent-turquoise;
    font-weight: 500;
}

.card-genres {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    span {
        background: rgba(78, 205, 196, 0.2);
        color: $accent-turquoise;
        padding: 4px 8px;
        border-radius: 15px;
        font-size: 12px;
        border: 1px solid rgba(78, 205, 196, 0.3);
    }
}

.card-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(45deg, $accent-coral, $hot-pink);
    border-radius: 25px;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: all .3s ease;
    display: flex;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    font-family: "Comfortaa";

    &:hover,
    &:focus {
        transform: scale(1.05);
        box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
    }
}

:deep(.swiper-slide):hover>.card,
:deep(.swiper-slide):focus-within>.card,
.TitleCard__swiper-item:hover>.card,
.TitleCard__swiper-item:focus-within>.card {
    transform: translateY(-12px);
    z-index: 5;
    border-color: $accent-coral;
    box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
}

:deep(.swiper-slide):hover>.card .card-image,
:deep(.swiper-slide):focus-within>.card .card-image,
.TitleCard__swiper-item:hover .card-image,
.TitleCard__swiper-item:focus-within .card-image {
    transform: scale(1.05);
}

:deep(.swiper-slide):hover>.card .card-title,
:deep(.swiper-slide):focus-within>.card .card-title,
.TitleCard__swiper-item:hover .card-title,
.TitleCard__swiper-item:focus-within .card-title {
    transform: translateY(-6px);
    transition: transform .5s ease;
}

:deep(.swiper-slide):hover>.card .card-meta,
:deep(.swiper-slide):focus-within>.card .card-meta,
.TitleCard__swiper-item:hover .card-meta,
.TitleCard__swiper-item:focus-within .card-meta {
    transform: translateY(-6px);
    transition: transform .5s ease;
}

:deep(.swiper-slide):hover>.card .card-genres,
:deep(.swiper-slide):focus-within>.card .card-genres,
.TitleCard__swiper-item:hover .card-genres,
.TitleCard__swiper-item:focus-within .card-genres {
    transform: translateY(-6px);
    transition: transform .5s ease;
}

@media (max-width: 480px) {

    :deep(.swiper-slide):hover>.card,
    :deep(.swiper-slide):focus-within>.card {
        transform: translateY(-6px);
        box-shadow: 0 10px 20px rgba(12, 10, 16, 0.35);
    }
}

@media (prefers-reduced-motion: reduce) {

    .card,
    .card-image {
        transition: none !important;
    }

    :deep(.swiper-slide):hover>.card,
    :deep(.swiper-slide):focus-within>.card {
        transform: none !important;
        box-shadow: none !important;
    }
}
</style>