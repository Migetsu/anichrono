<template>
    <main class="history-page">
        <div class="history-container">

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


            <div class="history-filters">
                <button class="filter-btn" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">
                    <font-awesome-icon icon="fa-solid fa-list" />
                    Все
                    <span class="filter-count">{{ allHistory.length }}</span>
                </button>
                <button class="filter-btn" :class="{ active: filterType === 'add' }" @click="filterType = 'add'">
                    <font-awesome-icon icon="fa-solid fa-plus" />
                    Добавлено
                    <span class="filter-count">{{ addedCount }}</span>
                </button>
                <button class="filter-btn" :class="{ active: filterType === 'remove' }" @click="filterType = 'remove'">
                    <font-awesome-icon icon="fa-solid fa-trash" />
                    Удалено
                    <span class="filter-count">{{ removedCount }}</span>
                </button>
                <button class="filter-btn" :class="{ active: filterType === 'change' }" @click="filterType = 'change'">
                    <font-awesome-icon icon="fa-solid fa-pen" />
                    Изменено
                    <span class="filter-count">{{ changedCount }}</span>
                </button>
            </div>


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
                    <div v-for="(item, index) in filteredHistory" :key="index" class="timeline-item">
                        <div class="timeline-icon" :class="getHistoryActionClass(item.action)">
                            <font-awesome-icon :icon="getHistoryIcon(item.action)" />
                        </div>

                        <div class="timeline-content">
                            <RouterLink :to="`/watch/${item.anime_id}`" class="timeline-title">
                                {{ item.anime_title }}
                            </RouterLink>

                            <div class="timeline-meta">
                                <span class="timeline-action">{{ item.action }}</span>
                                <span class="timeline-date">{{ formatHistoryDate(item.date) }}</span>
                            </div>
                        </div>
                    </div>
                </div>


                <button v-if="!loading && hasMore && filteredHistory.length > 0" @click="loadMore"
                    class="load-more-btn">
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
import Footer from '@/components/Footer/Footer.vue'

const auth = useAuthStore()

const allHistory = ref([])
const loading = ref(false)
const error = ref(null)
const filterType = ref('all')
const currentPage = ref(1)
const hasMore = ref(true)


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

function loadMore() {
    currentPage.value++
    loadHistory(currentPage.value)
}

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


function getHistoryActionClass(action) {
    if (action.includes('Добавлено') || action.includes('добавлен')) {
        return 'action-add'
    }
    if (action.includes('Удалено') || action.includes('удален')) {
        return 'action-remove'
    }
    return 'action-change'
}


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
@import "@/pages/HistoryPage/HistoryPage.scss";
</style>