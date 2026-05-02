<script lang="ts" setup>
import type { ShikimoriAnimeListItem } from '@/types/shikimori'
import { slugify } from '@/utils/slugify'

import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'

const auth = useAuthStore()
const lists = useListsStore()

import { useElementBounding, useWindowSize, onClickOutside } from '@vueuse/core'

const props = defineProps<{
    item: ShikimoriAnimeListItem
    episode?: number
}>()

const showDropdown = ref(false)
const isUpdating = ref(false)

const buttonRef = ref<HTMLButtonElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)
const { top, left, height } = useElementBounding(buttonRef)
const { width: windowWidth, height: windowHeight } = useWindowSize()

onClickOutside(dropdownRef, () => {
    if (showDropdown.value) showDropdown.value = false
})

const dropdownStyle = computed(() => {
    if (!showDropdown.value) return {}
    
    const dropdownWidth = windowWidth.value < 480 ? 160 : 180
    // Estimate height based on number of options ( ~40px per option + padding + divider )
    const dropdownHeight = listOptions.length * 40 + (currentRate.value ? 50 : 0) + 20
    
    let x = left.value
    let y = top.value + height.value + 6
    
    // Constrain to horizontal viewport
    if (x + dropdownWidth > windowWidth.value - 12) {
        x = windowWidth.value - dropdownWidth - 12
    }
    if (x < 12) x = 12

    // Constrain to vertical viewport
    if (y + dropdownHeight > windowHeight.value - 12) {
        // If not enough space below, show above the button
        y = top.value - dropdownHeight - 6
        // If still not enough space (very small screen), clamp to top
        if (y < 12) y = 12
    }

    return {
        position: 'fixed' as const,
        top: `${y}px`,
        left: `${x}px`,
        width: `${dropdownWidth}px`,
        maxHeight: `${windowHeight.value - 24}px`,
        overflowY: y < 12 ? 'auto' : 'visible' as any,
        zIndex: 1000
    }
})

const listOptions = [
    { id: 'planned', label: 'В планах' },
    { id: 'watching', label: 'Смотрю' },
    { id: 'rewatching', label: 'Пересматриваю' },
    { id: 'completed', label: 'Просмотрено' },
    { id: 'on_hold', label: 'Отложено' },
    { id: 'dropped', label: 'Брошено' }
]

const statusIcons: Record<string, string> = {
  planned:    'solar:bookmark-bold',
  watching:   'solar:play-circle-bold',
  rewatching: 'solar:refresh-circle-bold',
  completed:  'solar:check-circle-bold',
  on_hold:    'solar:pause-circle-bold',
  dropped:    'solar:close-circle-bold',
}

const currentRate = computed(() => {
    return lists.rates.find(r => r.target_id === Number(props.item.id)) || null
})

const handleBookmarkClick = () => {
    if (isUpdating.value) return
    showDropdown.value = !showDropdown.value
}

const removeFromList = async () => {
    if (!currentRate.value || isUpdating.value) return
    isUpdating.value = true
    showDropdown.value = false
    try {
        await $fetch(`/api/user/rate?id=${currentRate.value.id}`, { method: 'DELETE' })
        const index = lists.rates.findIndex(r => r.id === currentRate.value!.id)
        if (index > -1) lists.rates.splice(index, 1)
    } catch (e) {
        console.error('Failed to remove from list', e)
    } finally {
        isUpdating.value = false
    }
}

const addToList = async (status: 'planned' | 'watching' | 'rewatching' | 'completed' | 'on_hold' | 'dropped') => {
    if (currentRate.value?.status === status) {
        showDropdown.value = false
        return
    }

    if (isUpdating.value) return
    isUpdating.value = true
    showDropdown.value = false
    try {
        if (currentRate.value) {
            await $fetch('/api/user/rate', {
                method: 'PATCH',
                body: { id: currentRate.value.id, status }
            })
            const index = lists.rates.findIndex(r => r.id === currentRate.value!.id)
            if (index > -1) {
                lists.rates[index] = { ...lists.rates[index], status } as any
            }
        } else {
            const res = await $fetch('/api/user/rate', {
                method: 'POST',
                body: {
                    user_id: auth.user?.id,
                    target_id: props.item.id,
                    target_type: 'Anime',
                    status: status
                }
            })
            if (res) {
                lists.rates.push(res as any)
            }
        }
    } catch (e) {
        console.error('Failed to add to list', e)
    } finally {
        isUpdating.value = false
    }
}

const posterUrl = computed(() => {
    const poster = props.item.poster?.mainUrl || props.item.poster?.originalUrl
    if (poster) return poster
    
    // Fallback to image.original if poster is missing (Calendar API)
    const anime = props.item as any 
    if (anime.image?.original && !anime.image.original.includes('missing'))
      return `https://shikimori.io${anime.image.original}`
    if (anime.image?.preview && !anime.image.preview.includes('missing'))
      return `https://shikimori.io${anime.image.preview}`
    
    return ''
})
</script>

<template>
    <NuxtLink 
        class="title-card" 
        :to="`/animes/${props.item.id}-${slugify(props.item.name)}`"
        v-if="item"
    >
        <div class="title-card-bookmark" v-if="auth.isLoggedIn" @click.prevent.stop>
            <button 
                ref="buttonRef"
                class="title-card-bookmark-btn" 
                :class="{ 'title-card-bookmark-btn--active': currentRate, 'is-loading': isUpdating }" 
                @click="handleBookmarkClick" 
                :title="currentRate ? 'Изменить список' : 'Добавить в список'"
            >
                <Icon v-if="isUpdating" name="svg-spinners:180-ring" size="20" />
                <Icon v-else :name="currentRate ? (statusIcons[currentRate.status] || '') : 'material-symbols:bookmark-add-outline'" size="20" />
            </button>
            <Teleport to="body">
                <div v-if="showDropdown" ref="dropdownRef" class="title-card-dropdown" :style="dropdownStyle">
                    <button 
                        v-for="option in listOptions" 
                        :key="option.id" 
                        class="title-card-dropdown-item" 
                        :class="{ 'title-card-dropdown-item--active': currentRate?.status === option.id }"
                        @click="addToList(option.id as any)"
                    >
                        {{ option.label }}
                        <Icon v-if="currentRate?.status === option.id" name="solar:check-circle-bold" size="14" class="ml-auto" style="margin-left: auto; color: var(--accent)" />
                    </button>
                    <div v-if="currentRate" class="title-card-dropdown-divider"></div>
                    <button v-if="currentRate" class="title-card-dropdown-item title-card-dropdown-item--danger" @click="removeFromList">
                        Удалить из списка
                    </button>
                </div>
            </Teleport>
        </div>
        
        <div class="title-card-poster-wrap">
            <img 
                :src="posterUrl" 
                :alt="item.russian || item.name" 
                class="title-card-poster"
            >
            <div class="title-card-score">
                <Icon name="solar:star-bold" size="10" />
                {{ item.score }}
            </div>
            <div class="title-card-episode" v-if="episode">
                EP {{ episode }}
            </div>
        </div>
        
        <div class="title-card-body">
            <h3 class="title-card-title" :title="item.russian || item.name">
                {{ item.russian || item.name }}
            </h3>
            <div class="title-card-meta">
                <span class="title-card-kind" v-if="item.kind">{{ item.kind.toUpperCase() }}</span>
                <span class="title-card-year" v-if="item.airedOn?.year">{{ item.airedOn.year }}</span>
            </div>
        </div>
    </NuxtLink>
</template>

<style lang="scss" scoped>
.title-card {
    display: flex;
    flex-direction: column;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 16px;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    width: 100%;
    overflow: hidden;
    
    &:hover {
        transform: translateY(-8px);
        background: var(--surface3);
        border-color: rgba(var(--accent-rgb), 0.5);
        box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        
        .title-card-poster {
            transform: scale(1.05);
        }
    }

    &-bookmark {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 10;

        &-btn {
            background: rgba(0, 0, 0, 0.6);
            border: none;
            border-radius: 8px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            cursor: pointer;
            transition: all 0.2s ease;
            
            @include respond(mobile-l) {
                width: 36px;
                height: 36px;
            }
            
            &:hover, &--active {
                background: var(--accent);
                color: #fff;
            }

            &.is-loading {
                opacity: 0.7;
                pointer-events: none;
            }
        }
    }

    &-poster-wrap {
        position: relative;
        padding-top: 135%;
        overflow: hidden;
        background: #000;
        
        .title-card-poster {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
    }

    &-score {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.7);
        padding: 4px 8px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--gold);
        font-size: 11px;
        font-weight: 700;
        z-index: 2;
    }

    &-episode {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: var(--accent);
        padding: 2px 8px;
        border-radius: 6px;
        color: #fff;
        font-size: 10px;
        font-weight: 800;
        z-index: 2;
    }

    &-body {
        padding: 12px;
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 8px;
    }

    &-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #fff;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 2.6em;
    }

    &-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: var(--muted);
        margin-top: auto;
    }

    &-kind {
        background: rgba(255, 255, 255, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
    }

    &-year {
        color: var(--chrono);
    }
}

.title-card-dropdown {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 1000;

    &-item {
        background: transparent;
        border: none;
        color: var(--text);
        text-align: left;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        &:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--chrono);
        }

        &--active {
            background: rgba(255, 255, 255, 0.03);
            color: var(--accent);
        }
        
        &--danger {
            color: var(--accent);
            &:hover {
                background: rgba(230, 57, 70, 0.1);
            }
        }
    }

    &-divider {
        height: 1px;
        background: var(--border);
        margin: 4px 0;
    }
}
</style>