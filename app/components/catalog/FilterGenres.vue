<script lang="ts" setup>
import type { Genre } from '@/types/catalog'
import FilterBlock from '@/components/catalog/FilterBlock.vue'
import FilterOption from '@/components/catalog/FilterOption.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{
  title: string
  genres: Genre[]
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const isExpanded = ref(false)

function toggle(id: number) {
  const next = [...props.modelValue]
  const index = next.indexOf(id)
  if (index > -1) next.splice(index, 1)
  else next.push(id)
  emit('update:modelValue', next)
}
</script>

<template>
  <FilterBlock :title="title" :count="modelValue.length || undefined">
    <p v-if="!genres.length" class="filter-genres__empty">Жанры загружаются</p>

    <template v-else>
      <FilterOption
        v-for="genre in isExpanded ? genres : genres.slice(0, 6)"
        :key="genre.id"
        :label="genre.russian || genre.name"
        :selected="modelValue.includes(genre.id)"
        @toggle="toggle(genre.id)"
      />

      <button v-if="genres.length > 6" type="button" class="filter-genres__toggle" @click="isExpanded = !isExpanded">
        <span>{{ isExpanded ? 'Свернуть' : `Ещё ${genres.length - 6}` }}</span>
        <AppIcon :name="isExpanded ? 'chevron-left' : 'chevron-right'" :size="14" />
      </button>
    </template>
  </FilterBlock>
</template>

<style lang="scss" scoped>
.filter-genres {
  &__empty {
    font-size: 13px;
    color: var(--ink-3);
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 13px;
    color: var(--lapis-deep);
    transition: color var(--dur-fast) var(--ease);

    svg {
      transition: transform var(--dur-fast) var(--ease);
    }

    &:hover {
      color: var(--ink);
    }
  }
}
</style>
