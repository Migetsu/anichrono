<script lang="ts" setup>
import type { ShikimoriAnimeListItem } from '@/types/shikimori'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const containerRef = ref<any>(null)

// Generate unique ID for this swiper instance to scope navigation
const instanceId = useId()
const prevClass = `prev-${instanceId}`
const nextClass = `next-${instanceId}`

const props = defineProps<{
  items: ShikimoriAnimeListItem[]
}>()

const getSwiperOptions = () => ({
  loop: props.items.length >= 6,
  slidesPerView: 1,
  navigation: {
     nextEl: `.${nextClass}`,
     prevEl: `.${prevClass}`
  },
  spaceBetween: 12,
  speed: 600,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true
  },
  breakpoints: {
    320: { slidesPerView: 2, spaceBetween: 10 },
    480: { slidesPerView: 2, spaceBetween: 12 },
    768: { slidesPerView: 3, spaceBetween: 12 },
    1024: { slidesPerView: 4, spaceBetween: 12 },
    1280: { slidesPerView: 5, spaceBetween: 12 }
  }
})

const swiperOptions = getSwiperOptions()
const { next, prev } = useSwiper(containerRef, swiperOptions)

const breakpoints = ref(swiperOptions.breakpoints) 
</script>

<template>
  <div class="swiper-section">
    <swiper-container class="swiper-section-container" ref="containerRef" :init="false">
      <!-- Actual Items -->
      <swiper-slide v-for="(item, idx) in items" :key="item.id || idx" class="swiper-section-slide">
        <TitleCard :item="item" />
      </swiper-slide>
    </swiper-container>
    
    <button :class="['swiper-section-nav-btn', 'swiper-section-nav-btn--prev', prevClass]" @click="prev()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <button :class="['swiper-section-nav-btn', 'swiper-section-nav-btn--next', nextClass]" @click="next()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.swiper-section {
    position: relative;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 10px;

    @include respond(tablet) {
        max-width: 1440px;
        padding: 0 45px;
    }

    @include respond(laptop) {
        padding: 0 60px;
    }

    &-container {
        padding: 15px 0 25px;
        margin: 0;
    }

    &-slide {
        padding: 8px 4px;
        overflow: visible;
    }

    &-nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 20;
        transition: all 0.22s ease;
        color: #fff;
        border: none;
        box-shadow: 0 4px 12px rgba(var(--bg-rgb), 0.3);

        @include respond(mobile-l) {
            width: 36px;
            height: 36px;
        }

        @include respond(tablet) {
            width: 44px;
            height: 44px;
        }

        svg {
            width: 14px;
            height: 14px;

            @include respond(mobile-l) {
                width: 16px;
                height: 16px;
            }

            @include respond(tablet) {
                width: 18px;
                height: 18px;
            }
        }

        &:hover {
            background: var(--accent2);
            box-shadow: 0 0 15px var(--accent);
            transform: translateY(-50%) scale(1.1);
        }

        &:active {
            transform: translateY(-50%) scale(0.9);
        }

        &--prev {
            left: 15px;
            @include respond(tablet) {
                left: 10px;
            }
            @include respond(laptop) {
                left: 15px;
            }
        }

        &--next {
            right: 15px;
            @include respond(tablet) {
                right: 10px;
            }
            @include respond(laptop) {
                right: 15px;
            }
        }
    }

    /* Shadow DOM parts for Swiper Element */
    & swiper-container::part(button-prev),
    & swiper-container::part(button-next) {
        display: none !important;
    }
}

// Global overrides for swiper if needed (outside scoped if they don't work)
:deep(.swiper-button-next),
:deep(.swiper-button-prev),
:deep(.swiper-button-lock) {
    display: none !important;
}
</style>