<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useScheduleStore } from '@/stores/schedule'

const siteUrl = 'https://anichrono.vercel.app'

useSeoMeta({
  title: 'Календарь аниме — расписание онгоингов | AniChrono',
  ogTitle: 'Календарь аниме — расписание онгоингов | AniChrono',
  description: 'Расписание выхода новых эпизодов аниме по дням недели. Следите за онгоингами и не пропускайте выход новых серий.',
  ogDescription: 'Расписание выхода новых эпизодов аниме по дням недели. Следите за онгоингами и не пропускайте выход новых серий.',
  ogImage: `${siteUrl}/logo.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Календарь аниме — расписание онгоингов | AniChrono',
  twitterDescription: 'Расписание выхода новых эпизодов аниме по дням недели.',
  twitterImage: `${siteUrl}/logo.jpg`
})

const scheduleStore = useScheduleStore()
const { groupedSchedule: groupedCalendar, loading: pending, error } = storeToRefs(scheduleStore)

// Initial load
onMounted(() => {
  scheduleStore.loadSchedule()
})
</script>

<template>
  <div class="schedule">
    <div class="container">
      <div v-if="pending" class="loading-state">
        <Icon name="svg-spinners:180-ring-with-bg" class="spinner" />
        <span>Загружаем расписание...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <Icon name="solar:danger-circle-bold-duotone" class="error-icon" />
        <h2>Ошибка загрузки</h2>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="() => scheduleStore.loadSchedule(true)">Обновить</button>
      </div>

      <div v-else class="schedule__timeline-wrapper">
        <div class="schedule__timeline" v-for="day in groupedCalendar" :key="day.date">
          <h2 class="schedule__timeline-day">{{ day.label }}</h2>
          <div class="anime-grid">
            <TitleCard 
              v-for="entry in day.entries" 
              :key="entry.anime.id" 
              :item="entry.anime" 
              :episode="entry.next_episode"
            />
          </div>
        </div>
        
        <div v-if="!pending && !groupedCalendar.length" class="empty-state">
            <Icon name="solar:sleeping-square-bold-duotone" size="64" />
            <p>На данный момент расписания нет. Загляните позже!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.schedule {
  margin-top: 70px;
  padding-bottom: 80px;
  
  &__timeline {
    margin-bottom: 40px;
    
    &-day {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      color: $text-primary;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 10px;
    }
  }
}

.anime-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
    
    @include respond(mobile-l) {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 24px;
    }
}

.loading-state, .error-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;
    color: $text-secondary;
    
    .spinner {
        font-size: 48px;
        color: $accent-coral;
    }
}

.retry-btn {
    padding: 10px 24px;
    background: rgba($accent-coral, 0.2);
    border: 1px solid $accent-coral;
    color: $accent-coral;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: $accent-coral;
        color: #000;
    }
}
</style>
