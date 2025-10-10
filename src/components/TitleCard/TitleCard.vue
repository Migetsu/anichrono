<template>
    <div class="TitleCard" v-if="items && items.length">
        <div class="TitleCard-container">
            <Swiper :modules="[Navigation, Autoplay]" :slides-per-view="1" :space-between="12"
                :breakpoints="breakpoints"
                :autoplay="{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }" :speed="600"
                :navigation="true" :pagination="false" :loop="true" :lazy="true" class="TitleCard__swiper">

                <SwiperSlide v-for="(anime, id) in items" :key="id" class="TitleCard__swiper-item">
                    <RouterLink :to="`/watch/${anime.id}`" class="anime-card">
                        <div class="anime-card__image" :style="{ backgroundImage: `url(${anime.poster.originalUrl})` }"></div>
                        <div class="anime-card__overlay"></div>
                        <div class="anime-card__top">
                            <div v-if="anime.status === 'ongoing'" class="status-badge status-badge--green">ONGOING</div>
                            <div v-else-if="anime.status === 'released'" class="status-badge status-badge--gold">COMPLETED</div>
                        </div>
                        <div class="anime-card__content">
                            <div class="anime-card__title" :title="anime.russian || anime.name">{{ anime.russian || anime.name }}</div>
                            <div class="anime-card__meta">
                                <span class="meta-rating"><font-awesome-icon icon="fa-solid fa-star" /> {{ anime.score || '—' }}</span>
                                <span class="meta-year">{{ anime.airedOn?.year || '—' }}</span>
                            </div>
                            <div class="anime-card__genres" v-if="anime.genres?.length">
                                <span v-for="g in anime.genres.slice(0, 3)" :key="g.id">{{ g.russian || g.name }}</span>
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
    320: { slidesPerView: 1, spaceBetween: 12 }, // xs
    480: { slidesPerView: 1, spaceBetween: 14 }, // sm
    768: { slidesPerView: 2, spaceBetween: 16 }, // md
    1024: { slidesPerView: 2, spaceBetween: 18 }, // lg
    1280: { slidesPerView: 3, spaceBetween: 20 }, // xl
    1600: { slidesPerView: 4, spaceBetween: 24 }  // xxl и выше - 4 карточки
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