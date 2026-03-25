<script lang="ts" setup>
import type { FilterOption, AnimeOrder } from '@/types/catalog'

const props = defineProps<{
  title: string
  options: FilterOption<AnimeOrder>[]
  modelValue: AnimeOrder
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AnimeOrder): void
}>()

function selectOption(value: AnimeOrder) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="filter-order">
    <h4 class="filter-order-title">{{ title }}</h4>
    <div class="filter-order-options">
      <button 
        v-for="option in options" 
        :key="option.value"
        class="filter-order-option"
        :class="{ 'filter-order-option--selected': modelValue === option.value }"
        @click="selectOption(option.value)"
      >
        <Icon v-if="modelValue === option.value" name="mdi:check" />
        {{ option.labelRu || option.label }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-order {
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
  }

  &-options {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &-option {
    text-align: left;
    padding: 8px 12px;
    font-size: 0.875rem;
    color: var(--muted);
    border-radius: 6px;
    transition: all 0.2s ease;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: rgba(var(--accent-rgb), 0.1);
      color: var(--text);
    }

    &--selected {
      color: var(--accent);
      background: rgba(var(--accent-rgb), 0.1);
      font-weight: 500;
    }
  }
}
</style>
