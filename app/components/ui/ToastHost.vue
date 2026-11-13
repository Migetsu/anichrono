<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <TransitionGroup tag="div" name="toast" class="toast-host">
    <button
      v-for="toast in toasts"
      :key="toast.id"
      type="button"
      class="toast"
      :class="`toast--${toast.type}`"
      @click="remove(toast.id)"
    >
      <span class="toast__text">{{ toast.message }}</span>
    </button>
  </TransitionGroup>
</template>

<style lang="scss" scoped>
.toast-host {
  position: fixed;
  inset-inline: 16px;
  bottom: calc(var(--tabbar-h) + 16px + env(safe-area-inset-bottom, 0));
  z-index: 400;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;

  @include respond(tablet-l) {
    inset-inline: auto 24px;
    bottom: 24px;
    width: 320px;
  }
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  background: var(--paper-raised);
  border: 1px solid var(--rule-strong);
  border-left: 3px solid var(--lapis);
  border-radius: 2px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5);
  font-size: 13.5px;
  color: var(--ink);

  &--error,
  &--warning {
    border-left-color: var(--signal);
  }

  &--success {
    border-left-color: var(--lapis-deep);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
