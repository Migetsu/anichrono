<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useDebounceFn, onClickOutside } from '@vueuse/core'
import { searchAnime } from '@/lib/api/searchAnime'
import { slugify } from '@/utils/slugify'
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import { useUIStore } from '@/stores/ui'

const query = ref('')
const results = ref<ShikimoriAnimeListItem[]>([])
const uiStore = useUIStore()
const isLoading = ref(false)
const isOpen = ref(false)
const searchContainer = ref<HTMLElement | null>(null)

// Close dropdown when clicking outside
onClickOutside(searchContainer, () => {
    isOpen.value = false
})

// Debounced search function
const debouncedSearch = useDebounceFn(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
        results.value = []
        isOpen.value = false
        return
    }
    
    isLoading.value = true
    try {
        const data = await searchAnime(searchQuery, 50)
        results.value = data
        isOpen.value = data.length > 0
    } catch (error) {
        results.value = []
    } finally {
        isLoading.value = false
    }
}, 300)

// Watch query changes
watch(query, (newQuery) => {
    debouncedSearch(newQuery)
})

function clearSearch() {
    query.value = ''
    results.value = []
    isOpen.value = false
}

function selectResult() {
    clearSearch()
    uiStore.closeSearchModal()
    uiStore.closeMobileMenu()
}

function handleSubmit(e: Event) {
    e.preventDefault()
}
</script>

<template>
    <div class="search" ref="searchContainer">
        <form @submit="handleSubmit" class="search-form">
            <Icon name="ic:round-search" class="search-form-icon" />
            <input 
                v-model="query" 
                type="text" 
                class="search-form-input" 
                placeholder="Поиск тайтлов..."
                @focus="isOpen = results.length > 0"
            >
            <Icon v-if="isLoading" name="eos-icons:loading" class="search-form-icon search-form-icon--loading" />
            <Icon v-else-if="query" @click="clearSearch" name="fa6-solid:xmark" class="search-form-icon search-form-icon--clear" />
        </form>
        
        <!-- Search Results Dropdown -->
        <Transition name="dropdown">
            <div v-if="isOpen && results.length > 0" class="search-results">
                <NuxtLink 
                    v-for="item in results" 
                    :key="item.id"
                    :to="`/animes/${item.id}-${slugify(item.name)}`"
                    class="search-results-item"
                    @click="selectResult"
                >
                    <img 
                        v-if="item.poster?.originalUrl"
                        :src="item.poster.originalUrl" 
                        :alt="item.russian || item.name"
                        class="search-results-poster"
                    >
                    <div v-else class="search-results-poster search-results-poster--placeholder">
                        <Icon name="solar:clapperboard-play-bold" size="24" />
                    </div>
                    <div class="search-results-info">
                        <div class="search-results-title" :title="item.russian || item.name">{{ item.russian || item.name }}</div>
                        <div class="search-results-meta">
                            <span class="search-results-year">{{ item.airedOn?.year || '—' }}</span>
                            <span class="search-results-score">
                                <Icon name="material-symbols:star-rounded" />
                                {{ item.score }}
                            </span>
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </Transition>
        
        <!-- No results message -->
        <Transition name="dropdown">
            <div v-if="isOpen && query.length >= 2 && results.length === 0 && !isLoading" class="search-results search-results--empty">
                <p>Ничего не найдено</p>
            </div>
        </Transition>
    </div>
</template>

<style lang="scss" scoped>
.search {
    position: relative;
    width: 100%;

    &-form {
        width: 100%;
        background: var(--surface);
        padding: 10px 16px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid var(--border);
        transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);

        &:focus-within {
            background: var(--surface2);
            border-color: var(--accent);
            box-shadow: 0 0 25px rgba(var(--accent-rgb), 0.15);

            .search-form-icon {
                color: var(--accent);
                transform: scale(1.1);
            }
        }

        &-input {
            background: transparent;
            width: 100%;
            color: var(--text);
            font-size: 15px;
            font-weight: 500;
            outline: none;
            border: none;

            &::placeholder {
                color: var(--muted);
            }
        }

        &-icon {
            width: 20px;
            height: 20px;
            min-width: 20px;
            color: var(--muted);
            transition: all .3s ease;

            &--clear {
                cursor: pointer;
                &:hover {
                    color: var(--accent);
                }
            }

            &--loading {
                animation: spin 1s linear infinite;
            }
        }
    }

    &-results {
        position: absolute;
        top: calc(100% + 12px);
        left: 0;
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        background: var(--surface2); 
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        z-index: 1000;
        overscroll-behavior: contain;

        @include respond(tablet) {
             max-height: 70vh;
        }

        &--empty {
            padding: 30px;
            text-align: center;
            color: var(--muted);
            font-size: 15px;
        }

        &-item {
            display: flex;
            gap: 16px;
            padding: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
            text-decoration: none;

            &:hover {
                background: var(--surface3);
                
                .search-results-title {
                    color: var(--accent);
                }
            }

            &:not(:last-child) {
                border-bottom: 1px solid var(--border);
            }
        }

        &-poster {
            width: 50px;
            height: 70px;
            object-fit: cover;
            border-radius: 8px;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);

            &--placeholder {
                background: var(--surface);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--muted);
            }
        }

        &-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 6px;
            overflow: hidden;
        }

        &-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.2s ease;
        }

        &-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;
            color: var(--muted);
        }

        &-score {
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--gold);
            font-weight: 600;

            svg {
                width: 14px;
                height: 14px;
            }
        }

        &::-webkit-scrollbar {
            width: 5px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 10px;
            
            &:hover {
                background: var(--muted);
            }
        }
    }
}

// Dropdown transition
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>