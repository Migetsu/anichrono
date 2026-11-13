<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  selected: boolean
  type?: 'checkbox' | 'radio'
}>(), {
  type: 'checkbox',
})

const emit = defineEmits<{ (e: 'toggle'): void }>()
</script>

<template>
  <button
    type="button"
    class="filter-option"
    :class="{ 'filter-option--selected': selected }"
    :aria-pressed="selected"
    @click="emit('toggle')"
  >
    <span class="filter-option__box" :class="`filter-option__box--${type}`" aria-hidden="true"></span>
    <span class="filter-option__label">{{ label }}</span>
  </button>
</template>

<style lang="scss" scoped>
.filter-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 5px 0;
  text-align: left;
  font-size: 14px;
  color: var(--ink-2);
  transition: color var(--dur-fast) var(--ease);

  &:hover {
    color: var(--ink);
  }

  &__box {
    position: relative;
    flex: none;
    width: 14px;
    height: 14px;
    border: 1px solid var(--rule-strong);
    border-radius: 2px;
    transition: border-color var(--dur-fast) var(--ease),
      background-color var(--dur-fast) var(--ease);

    &--radio {
      border-radius: 50%;
    }

    &--checkbox::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 4px;
      height: 8px;
      border-right: 1.5px solid var(--paper);
      border-bottom: 1.5px solid var(--paper);
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity var(--dur-fast) var(--ease);
    }

    &--radio::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
      background: var(--paper);
      opacity: 0;
      transition: opacity var(--dur-fast) var(--ease);
    }
  }

  &__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover &__box {
    border-color: var(--ink-3);
  }

  &--selected {
    color: var(--ink);
  }

  &--selected &__box {
    border-color: var(--lapis);
    background: var(--lapis);
  }

  &--selected &__box::after {
    opacity: 1;
  }
}
</style>
