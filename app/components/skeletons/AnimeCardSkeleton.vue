<template>
  <div class="anime-skeleton" aria-hidden="true">
    <span class="anime-skeleton__frame"></span>
    <span class="anime-skeleton__line"></span>
    <span class="anime-skeleton__line anime-skeleton__line--short"></span>
  </div>
</template>

<style lang="scss" scoped>
.anime-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__frame {
    display: block;
    aspect-ratio: 2 / 3;
    background: var(--paper-sunk);
    border-radius: 2px;
    animation: skeleton-pulse 1600ms var(--ease) infinite;
  }

  &__line {
    display: block;
    width: 100%;
    height: 12px;
    background: var(--paper-sunk);
    border-radius: 2px;
    animation: skeleton-pulse 1600ms var(--ease) infinite;

    &--short {
      width: 56%;
    }
  }
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
