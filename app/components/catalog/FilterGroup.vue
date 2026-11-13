<script lang="ts" setup>
import type { FilterOption as FilterOptionType } from '@/types/catalog'
import FilterBlock from '@/components/catalog/FilterBlock.vue'
import FilterOption from '@/components/catalog/FilterOption.vue'

const props = defineProps<{
  title: string
  options: FilterOptionType<string | number>[]
  modelValue: (string | number)[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
}>()

function toggle(value: string | number) {
  const next = [...props.modelValue]
  const index = next.indexOf(value)
  if (index > -1) next.splice(index, 1)
  else next.push(value)
  emit('update:modelValue', next)
}

function isSelected(value: string | number) {
  return props.modelValue.includes(value)
}
</script>

<template>
  <FilterBlock :title="title" :count="modelValue.length || undefined">
    <FilterOption
      v-for="option in options"
      :key="String(option.value)"
      :label="option.labelRu || option.label"
      :selected="isSelected(option.value)"
      @toggle="toggle(option.value)"
    />
  </FilterBlock>
</template>
