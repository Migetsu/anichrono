<script lang="ts" setup>
import type { FilterOption as FilterOptionType, AnimeOrder } from '@/types/catalog'
import FilterBlock from '@/components/catalog/FilterBlock.vue'
import FilterOption from '@/components/catalog/FilterOption.vue'

defineProps<{
  title: string
  options: FilterOptionType<AnimeOrder>[]
  modelValue: AnimeOrder
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AnimeOrder): void
}>()
</script>

<template>
  <FilterBlock :title="title">
    <FilterOption
      v-for="option in options"
      :key="option.value"
      type="radio"
      :label="option.labelRu || option.label"
      :selected="modelValue === option.value"
      @toggle="emit('update:modelValue', option.value)"
    />
  </FilterBlock>
</template>
