<script lang="ts" setup>
import type { Genre } from '@/types/catalog'

const props = defineProps<{
  title: string
  genres: Genre[]
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const isExpanded = ref(true) // Expanded by default for better UX

function toggleGenre(id: number) {
  const current = [...props.modelValue]
  const index = current.indexOf(id)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(id)
  }
  
  emit('update:modelValue', current)
}

function isSelected(id: number): boolean {
  return props.modelValue.includes(id)
}

const selectedCount = computed(() => props.modelValue.length)
</script>

<template>
  <div class="filter-genres">
    <h4 class="filter-genres-title">
      {{ title }}
      <span v-if="selectedCount > 0" class="filter-genres-count">{{ selectedCount }}</span>
    </h4>
    
    <button 
      class="filter-genres-toggle"
      @click="isExpanded = !isExpanded"
    >
      {{ isExpanded ? 'Скрыть список' : 'Показать список' }}
      <Icon :name="isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
    </button>
    
    <Transition name="expand">
      <div v-if="isExpanded" class="filter-genres-list">
        <div v-if="genres.length === 0" class="filter-genres-empty">
          Жанры загружаются...
        </div>
        <label 
          v-for="genre in genres" 
          :key="genre.id"
          class="filter-genres-option"
          :class="{ 'filter-genres-option--selected': isSelected(genre.id) }"
        >
          <input 
            type="checkbox"
            :checked="isSelected(genre.id)"
            @change="toggleGenre(genre.id)"
          >
          <span class="filter-genres-checkbox"></span>
          <span class="filter-genres-label">{{ genre.russian || genre.name }}</span>
        </label>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.filter-genres {
  margin-bottom: 24px;

  &-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &-count {
    background: var(--accent);
    color: #fff;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
  }

  &-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--accent);
    font-size: 0.875rem;
    padding: 8px 0;
    transition: opacity 0.2s ease;
    background: transparent;
    border: none;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }

  &-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 2px;
    }
  }

  &-option {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 6px 0;
    transition: color 0.2s ease;
    color: var(--muted);

    input {
      display: none;
    }

    &:hover {
      color: var(--accent);
    }

    &--selected {
      color: var(--accent);

      .filter-genres-checkbox {
        background: var(--accent);
        border-color: var(--accent);

        &::after {
          opacity: 1;
        }
      }
    }
  }

  &-checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border);
    border-radius: 4px;
    position: relative;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 12px;
      font-weight: bold;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &-label {
    font-size: 0.875rem;
    transition: color 0.2s ease;

    .filter-genres-option:hover &,
    .filter-genres-option--selected & {
      color: var(--text);
    }
  }

  &-empty {
    padding: 20px;
    text-align: center;
    color: var(--muted);
    font-size: 0.875rem;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>