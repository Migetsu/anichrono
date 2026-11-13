<script setup lang="ts">
defineProps<{
  items: { label: string, to?: string }[]
}>()
</script>

<template>
  <nav class="crumbs" aria-label="Хлебные крошки">
    <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
      <span v-if="index" class="crumbs__sep" aria-hidden="true">/</span>
      <NuxtLink v-if="item.to" :to="item.to" class="crumbs__item">{{ item.label }}</NuxtLink>
      <span v-else class="crumbs__item crumbs__item--current" :aria-current="'page'">{{ item.label }}</span>
    </template>
  </nav>
</template>

<style lang="scss" scoped>
.crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ink-3);

  &__item {
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--ink);
    }

    &--current {
      color: var(--ink-2);
      max-width: 56ch;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__sep {
    color: var(--rule-strong);
  }
}
</style>
