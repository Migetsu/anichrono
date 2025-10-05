<template>
  <main class="history-page">
    <div class="history-container">
      <!-- Заголовок страницы -->
      <header class="history-header">
        <RouterLink to="/profile" class="back-btn">
          <font-awesome-icon icon="fa-solid fa-arrow-left" />
          Назад к профилю
        </RouterLink>
        <h1 class="history-title">
          <font-awesome-icon icon="fa-solid fa-clock-rotate-left" />
          История изменений
        </h1>
      </header>

      <!-- Фильтр по типам действий -->
      <div class="history-filters">
        <button 
          class="filter-btn"
          :class="{ active: filterType === 'all' }"
          @click="filterType = 'all'"
        >
          <font-awesome-icon icon="fa-solid fa-list" />
          Все
          <span class="filter-count">{{ allHistory.length }}</span>
        </button>
        <button 
          class="filter-btn"
          :class="{ active: filterType === 'add' }"
          @click="filterType = 'add'"
        >
          <font-awesome-icon icon="fa-solid fa-plus" />
          Добавлено
          <span class="filter-count">{{ addedCount }}</span>
        </button>
        <button 
          class="filter-btn"
          :class="{ active: filterType === 'remove' }"
          @click="filterType = 'remove'"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
          Удалено
          <span class="filter-count">{{ removedCount }}</span>
        </button>
        <button 
          class="filter-btn"
          :class="{ active: filterType === 'change' }"
          @click="filterType = 'change'"
        >
          <font-awesome-icon icon="fa-solid fa-pen" />
          Изменено
          <span class="filter-count">{{ changedCount }}</span>
        </button>
      </div>

      <!-- Список истории -->
      <div class="history-content">
        <div v-if="loading" class="loading-state">
          <font-awesome-icon icon="fa-solid fa-spinner" spin />
          Загрузка истории...
        </div>

        <div v-else-if="error" class="error-state">
          <font-awesome-icon icon="fa-solid fa-exclamation-circle" />
          {{ error }}
        </div>

        <div v-else-if="filteredHistory.length === 0" class="empty-state">
          <font-awesome-icon icon="fa-regular fa-folder-open" />
          <p>История изменений пуста</p>
        </div>

        <div v-else class="history-timeline">
          <div 
            v-for="(item, index) in filteredHistory" 
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-icon" :class="getHistoryActionClass(item.action)">
              <font-awesome-icon :icon="getHistoryIcon(item.action)" />
            </div>
            
            <div class="timeline-content">
              <RouterLink 
                :to="`/animes/${item.anime_id}`"
                class="timeline-title"
              >
                {{ item.anime_title }}
              </RouterLink>
              
              <div class="timeline-meta">
                <span class="timeline-action">{{ item.action }}</span>
                <span class="timeline-date">{{ formatHistoryDate(item.date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка загрузить еще -->
        <button 
          v-if="!loading && hasMore && filteredHistory.length > 0"
          @click="loadMore"
          class="load-more-btn"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-down" />
          Загрузить еще
        </button>
      </div>
    </div>
  </main>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Footer from '@/components/Footer.vue'

const auth = useAuthStore()

const allHistory = ref([])
const loading = ref(false)
const error = ref(null)
const filterType = ref('all')
const currentPage = ref(1)
const hasMore = ref(true)

// Загрузка истории
async function loadHistory(page = 1) {
  if (!auth?.user?.id) return
  
  loading.value = true
  error.value = null
  
  try {
    const limit = 50
    const response = await fetch(`/api/user-history?user_id=${auth.user.id}&limit=${limit}&page=${page}`)
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.length === 0) {
        hasMore.value = false
      } else {
        const newItems = data.map(item => ({
          anime_id: item.target?.id || 0,
          anime_title: item.target?.russian || item.target?.name || `Аниме #${item.target?.id}`,
          action: item.description || '',
          status: extractStatus(item.description),
          date: item.created_at
        }))
        
        if (page === 1) {
          allHistory.value = newItems
        } else {
          allHistory.value.push(...newItems)
        }
        
        hasMore.value = data.length === limit
      }
    } else {
      error.value = 'Не удалось загрузить историю'
    }
  } catch (err) {
    console.error('Ошибка загрузки истории:', err)
    error.value = 'Произошла ошибка при загрузке истории'
  } finally {
    loading.value = false
  }
}

// Загрузить больше
function loadMore() {
  currentPage.value++
  loadHistory(currentPage.value)
}

// Извлекаем статус из описания
function extractStatus(description) {
  if (!description) return ''
  const statusMap = {
    'Запланировано': 'planned',
    'Смотрю': 'watching',
    'Просмотрено': 'completed',
    'Отложено': 'on_hold',
    'Брошено': 'dropped',
    'Пересматриваю': 'rewatching'
  }
  
  for (const [key, value] of Object.entries(statusMap)) {
    if (description.includes(key)) return key
  }
  
  return description
}

// Фильтрация истории
const filteredHistory = computed(() => {
  if (filterType.value === 'all') {
    return allHistory.value
  }
  
  return allHistory.value.filter(item => {
    const action = item.action.toLowerCase()
    
    if (filterType.value === 'add') {
      return action.includes('добавлен') || action.includes('добавлено')
    }
    if (filterType.value === 'remove') {
      return action.includes('удален') || action.includes('удалено')
    }
    if (filterType.value === 'change') {
      return action.includes('изменен') || action.includes('изменено') || 
             (!action.includes('добавлен') && !action.includes('удален'))
    }
    
    return true
  })
})

// Счетчики
const addedCount = computed(() => {
  return allHistory.value.filter(item => 
    item.action.toLowerCase().includes('добавлен') || 
    item.action.toLowerCase().includes('добавлено')
  ).length
})

const removedCount = computed(() => {
  return allHistory.value.filter(item => 
    item.action.toLowerCase().includes('удален') || 
    item.action.toLowerCase().includes('удалено')
  ).length
})

const changedCount = computed(() => {
  return allHistory.value.filter(item => {
    const action = item.action.toLowerCase()
    return (action.includes('изменен') || action.includes('изменено')) ||
           (!action.includes('добавлен') && !action.includes('удален'))
  }).length
})

// Получаем иконку для действия
function getHistoryIcon(action) {
  if (action.includes('Добавлено') || action.includes('добавлен')) {
    return 'fa-solid fa-plus'
  }
  if (action.includes('Удалено') || action.includes('удален')) {
    return 'fa-solid fa-trash'
  }
  if (action.includes('Изменено') || action.includes('изменен')) {
    return 'fa-solid fa-pen'
  }
  return 'fa-solid fa-clock'
}

// Получаем класс для иконки действия
function getHistoryActionClass(action) {
  if (action.includes('Добавлено') || action.includes('добавлен')) {
    return 'action-add'
  }
  if (action.includes('Удалено') || action.includes('удален')) {
    return 'action-remove'
  }
  return 'action-change'
}

// Форматируем дату
function formatHistoryDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.history-page {
  min-height: 100vh;
  padding: 100px 0 60px;
  background: linear-gradient(135deg, $primary-bg 0%, $secondary-bg 50%, $dark-blue 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.history-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.history-header {
  margin-bottom: 30px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: $text-secondary;
  font-size: 14px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    color: $accent-coral;
    transform: translateX(-5px);
  }
  
  svg {
    font-size: 12px;
  }
}

.history-title {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, $accent-coral, $accent-turquoise);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 15px;
  font-family: 'Orbitron', sans-serif;
  
  svg {
    color: $accent-coral;
    -webkit-text-fill-color: $accent-coral;
  }
}

.history-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 10px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;
  
  &:hover {
    background: rgba(78, 205, 196, 0.1);
    border-color: $accent-turquoise;
    color: $text-primary;
  }
  
  &.active {
    background: linear-gradient(135deg, $accent-coral, $hot-pink);
    border-color: $accent-coral;
    color: white;
    box-shadow: 0 5px 20px rgba(255, 107, 107, 0.3);
  }
}

.filter-count {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.history-content {
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: $text-secondary;
  font-size: 18px;
  
  svg {
    font-size: 48px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
}

.error-state {
  color: $accent-coral;
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  border: 1px solid rgba(78, 205, 196, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: $accent-turquoise;
    transform: translateX(10px);
  }
}

.timeline-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  
  &.action-add {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(78, 205, 196, 0.1));
    color: $accent-turquoise;
    border: 1px solid rgba(78, 205, 196, 0.3);
  }
  
  &.action-remove {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
    color: $accent-coral;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }
  
  &.action-change {
    background: linear-gradient(135deg, rgba(255, 230, 109, 0.2), rgba(255, 230, 109, 0.1));
    color: $accent-gold;
    border: 1px solid rgba(255, 230, 109, 0.3);
  }
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-title {
  color: $text-primary;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
  display: block;
  transition: color 0.3s ease;
  
  &:hover {
    color: $accent-coral;
  }
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
}

.timeline-action {
  color: $text-secondary;
}

.timeline-date {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.load-more-btn {
  width: 100%;
  margin-top: 20px;
  padding: 15px;
  background: linear-gradient(135deg, $accent-turquoise, #44a3a0);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(78, 205, 196, 0.4);
  }
}

@media (max-width: 768px) {
  .history-title {
    font-size: 28px;
  }
  
  .history-filters {
    justify-content: center;
  }
  
  .filter-btn {
    font-size: 13px;
    padding: 10px 15px;
  }
  
  .timeline-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .timeline-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .timeline-title {
    font-size: 16px;
  }
  
  .timeline-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
