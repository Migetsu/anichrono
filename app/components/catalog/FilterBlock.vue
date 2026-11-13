<script setup lang="ts">
defineProps<{
  title: string
  count?: number
}>()
</script>

<template>
  <section class="filter-block">
    <h3 class="filter-block__title">
      <span>{{ title }}</span>
      <span v-if="count" class="filter-block__count tabular">{{ count }}</span>
    </h3>
    <div class="filter-block__body">
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.filter-block {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--rule);

  & + & {
    margin-top: 18px;
  }

  &__title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
    font-family: var(--font-main);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--ink-3);
  }

  &__count {
    color: var(--lapis-deep);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}
</style>
