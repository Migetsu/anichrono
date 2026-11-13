<script setup lang="ts">
import { addDays, format, parseISO, startOfToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useScheduleStore } from '@/stores/schedule'
import AppIcon from '@/components/ui/AppIcon.vue'

const scheduleStore = useScheduleStore()

onMounted(() => {
  scheduleStore.loadSchedule()
})

function plural(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'серия'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'серии'
  return 'серий'
}

const days = computed(() => {
  const floor = Date.now() - 1000 * 60 * 45
  const counts = new Map<string, number>()

  for (const entry of scheduleStore.entries) {
    if (!entry.next_episode_at) continue
    const at = parseISO(entry.next_episode_at)
    if (Number.isNaN(at.getTime()) || at.getTime() < floor) continue
    const key = format(at, 'yyyy-MM-dd')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const start = startOfToday()

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index)
    const key = format(date, 'yyyy-MM-dd')
    return {
      key,
      weekday: format(date, 'EEEEEE', { locale: ru }),
      day: format(date, 'd'),
      month: format(date, 'MMM', { locale: ru }).replace('.', ''),
      count: counts.get(key) ?? 0,
      isToday: index === 0,
    }
  })
})

const hasData = computed(() => days.value.some(day => day.count > 0))
</script>

<template>
  <section v-if="hasData" class="week">
    <div class="container week__inner">
      <div class="week__head">
        <h2 class="section-title week__title">Неделя эфира</h2>
        <NuxtLink to="/schedule" class="week__link">
          <span>Полное расписание</span>
          <AppIcon name="arrow-right" :size="15" />
        </NuxtLink>
      </div>

      <ol class="week__grid">
        <li
          v-for="day in days"
          :key="day.key"
          class="week__cell"
          :class="{ 'week__cell--today': day.isToday, 'week__cell--empty': !day.count }"
          :aria-current="day.isToday ? 'date' : undefined"
        >
          <span class="week__weekday">{{ day.weekday }}</span>
          <span class="week__date tabular">{{ day.day }}</span>
          <span class="week__month">{{ day.month }}</span>
          <span class="week__count tabular">
            {{ day.count ? `${day.count} ${plural(day.count)}` : 'без эфира' }}
          </span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.week {
  padding-block: 28px 20px;
  background: var(--paper-raised);
  border-bottom: 1px solid var(--rule-strong);

  @include respond(tablet) {
    padding-block: 32px 24px;
  }
}

.week__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.week__title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.01em;

  @include respond(tablet) {
    font-size: 20px;
  }
}

.week__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ink-2);
  transition: color var(--dur-fast) var(--ease);

  &:hover {
    color: var(--lapis-deep);

    svg {
      transform: translateX(2px);
    }
  }

  svg {
    transition: transform var(--dur) var(--ease);
  }
}

.week__grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 88px;
  overflow-x: auto;
  border-top: 1px solid var(--rule-strong);
  border-bottom: 1px solid var(--rule);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @include respond(tablet) {
    grid-auto-columns: 1fr;
  }
}

.week__cell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 10px 14px;
  border-left: 1px solid var(--rule);
  transition: background-color var(--dur-fast) var(--ease);

  &:first-child:not(.week__cell--today) {
    border-left: 0;
    padding-left: 0;
  }

  &:hover {
    background: var(--paper-sunk);
  }

  &::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: -1px;
    height: 2px;
    background: var(--lapis);
    transform: scaleX(0);
    transform-origin: left;
  }

  &--today {
    padding-inline: 12px;
    background: var(--ink);
    color: var(--paper);

    &::before {
      display: none;
    }

    &:hover {
      background: var(--ink);
    }

    .week__weekday,
    .week__month {
      color: var(--paper);
      opacity: 0.62;
    }

    .week__date {
      color: var(--paper);
    }

    .week__count {
      color: var(--paper);
    }
  }

  &--empty:not(.week__cell--today) {
    .week__date,
    .week__count {
      color: var(--ink-3);
    }
  }
}

.week__weekday {
  font-size: 11.5px;
  color: var(--ink-3);
  text-transform: lowercase;
}

.week__date {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  line-height: 1;
}

.week__month {
  font-size: 11px;
  color: var(--ink-3);
}

.week__count {
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--ink-2);
}
</style>
