<script setup lang="ts">
import { useScheduleStore } from '@/stores/schedule'
import { isToday, isTomorrow, parseISO } from 'date-fns'

const scheduleStore = useScheduleStore()
const containerRef = ref<any>(null)

const swiperOptions = {
  slidesPerView: 1,
  pagination: true,
  spaceBetween: 12,
  speed: 600,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
    }
  }
}

useSwiper(containerRef, swiperOptions)

// Initial load if not already loaded
onMounted(() => {
  scheduleStore.loadSchedule()
})

const upcomingReleases = computed(() => {
  if (!scheduleStore.entries.length) return []
  
  // Filter for tomorrow releases
  return scheduleStore.entries
    .filter(entry => {
        if (!entry.next_episode_at) return false
        const date = parseISO(entry.next_episode_at)
        return isTomorrow(date)
    })
    .slice(0, 10) // Limit to 10 slides
})
</script>

<template>
    <div class="calendar">
        <ClientOnly>
            <swiper-container 
                v-show="!scheduleStore.loading && upcomingReleases.length" 
                class="calendar-swiper" 
                ref="containerRef" 
                :init="false"
            >
                <swiper-slide v-for="entry in upcomingReleases" :key="entry.anime.id">
                    <HomeReleaseInfo :item="entry" />
                </swiper-slide>
            </swiper-container>

            <!-- Skeleton Loading State -->
            <div v-if="scheduleStore.loading" class="calendar-skeleton">
                <div class="calendar-skeleton-content">
                    <div class="calendar-skeleton-badge"></div>
                    <div class="calendar-skeleton-title"></div>
                    <div class="calendar-skeleton-meta"></div>
                    <div class="calendar-skeleton-genres">
                        <div class="calendar-skeleton-genre"></div>
                        <div class="calendar-skeleton-genre"></div>
                        <div class="calendar-skeleton-genre"></div>
                    </div>
                    <div class="calendar-skeleton-button"></div>
                </div>
                <div class="calendar-skeleton-poster"></div>
            </div>
            
            <template #fallback>
                <div class="calendar-skeleton">
                    <div class="calendar-skeleton-content">
                        <div class="calendar-skeleton-badge"></div>
                        <div class="calendar-skeleton-title"></div>
                        <div class="calendar-skeleton-meta"></div>
                        <div class="calendar-skeleton-genres">
                            <div class="calendar-skeleton-genre"></div>
                            <div class="calendar-skeleton-genre"></div>
                            <div class="calendar-skeleton-genre"></div>
                        </div>
                        <div class="calendar-skeleton-button"></div>
                    </div>
                    <div class="calendar-skeleton-poster"></div>
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<style lang="scss" scoped>
.calendar {
    min-height: 340px;

    @include respond(tablet) {
        min-height: 400px;
    }

    &-swiper {
        overflow: hidden;
    }

    &-skeleton {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 32px 24px;
        background: var(--surface);
        height: 340px;
        position: relative;
        overflow: hidden;

        @include respond(tablet) {
            max-width: 1440px;
            margin: 0 auto;
            padding: 40px 15px;
            height: 400px;
        }

        &::after {
            content: '';
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0,
                rgba(255, 255, 255, 0.05) 50%,
                rgba(255, 255, 255, 0) 100%
            );
            animation: calendar-shimmer 2s infinite;
        }

        &-content {
            flex: 1;
            max-width: 600px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        &-badge {
            width: 120px;
            height: 28px;
            background: rgba(var(--text-rgb), 0.05);
            border-radius: 8px;
        }

        &-title {
            width: 80%;
            height: 44px;
            background: rgba(var(--text-rgb), 0.05);
            border-radius: 8px;
        }

        &-meta {
            width: 50%;
            height: 20px;
            background: rgba(var(--text-rgb), 0.05);
            border-radius: 4px;
        }

        &-genres {
            display: flex;
            gap: 8px;
        }

        &-genre {
            width: 80px;
            height: 26px;
            background: rgba(var(--text-rgb), 0.05);
            border-radius: 20px;
        }

        &-button {
            width: 160px;
            height: 48px;
            background: rgba(var(--text-rgb), 0.05);
            border-radius: 12px;
            margin-top: 8px;
        }

        &-poster {
            display: none;

            @include respond(tablet) {
                display: block;
                width: 220px;
                height: 320px;
                background: rgba(var(--text-rgb), 0.05);
                border-radius: 16px;
            }
        }
    }
}

@keyframes calendar-shimmer {
    100% {
        transform: translateX(100%);
    }
}
</style>