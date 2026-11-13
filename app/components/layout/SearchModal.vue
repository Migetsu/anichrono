<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import AppIcon from '@/components/ui/AppIcon.vue'

const uiStore = useUIStore()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') uiStore.closeSearchModal()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Transition name="veil">
    <div
      v-if="uiStore.isSearchModalOpen"
      class="search-shell"
      role="dialog"
      aria-modal="true"
      aria-label="Поиск по каталогу"
      @click.self="uiStore.closeSearchModal()"
    >
      <div class="search-shell__panel">
        <div class="search-shell__head">
          <span class="search-shell__title">Поиск</span>
          <button type="button" class="icon-btn" title="Закрыть" @click="uiStore.closeSearchModal()">
            <AppIcon name="close" :size="20" />
            <span class="visually-hidden">Закрыть</span>
          </button>
        </div>
        <Search class="search-shell__field" />
        <p class="search-shell__hint">
          Результаты появляются по мере ввода. Esc — закрыть.
        </p>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.search-shell {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.72);
  overflow-y: auto;

  @include respond(tablet) {
    padding-top: 88px;
  }

  &__panel {
    width: 100%;
    max-width: 640px;
    height: fit-content;
    background: var(--paper-raised);
    border: 1px solid var(--rule-strong);
    border-radius: 2px;
    padding: 20px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
    animation: panel-in 220ms var(--ease) both;

    @include respond(tablet) {
      padding: 24px;
    }
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--rule-strong);
    margin-bottom: 18px;
  }

  &__title {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 600;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  &__field {
    width: 100%;
  }

  &__hint {
    margin-top: 14px;
    font-size: 12.5px;
    color: var(--ink-3);
  }
}

.veil-enter-active,
.veil-leave-active {
  transition: opacity var(--dur) var(--ease);
}

.veil-enter-from,
.veil-leave-to {
  opacity: 0;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
