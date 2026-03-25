<script lang="ts" setup>
import type { FilterOption } from '@/types/catalog'

const props = defineProps<{
  title: string
  options: FilterOption<string | number>[]
  modelValue: (string | number)[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
}>()

function toggleOption(value: string | number) {
  const current = [...props.modelValue]
  const index = current.indexOf(value)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }
  
  emit('update:modelValue', current)
}

function isSelected(value: string | number): boolean {
  return props.modelValue.includes(value)
}
</script>

<template>
  <div class="filter-group">
    <h4 class="filter-group-title">{{ title }}</h4>
    <div class="filter-group-options">
      <label 
        v-for="option in options" 
        :key="String(option.value)"
        class="filter-group-option"
        :class="{ 'filter-group-option--selected': isSelected(option.value) }"
      >
        <input 
          type="checkbox"
          :checked="isSelected(option.value)"
          @change="toggleOption(option.value)"
        >
        <span class="filter-group-checkbox"></span>
        <span class="filter-group-label">{{ option.labelRu || option.label }}</span>
      </label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-group {
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
    gap: 8px;
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

      .filter-group-checkbox {
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

    .filter-group-option:hover &,
    .filter-group-option--selected & {
      color: var(--text);
    }
  }
}
</style>
