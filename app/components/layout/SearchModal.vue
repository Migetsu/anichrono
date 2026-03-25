<script setup lang="ts">
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="uiStore.isSearchModalOpen" class="search-modal" @click.self="uiStore.toggleSearchModal">
      <div class="search-modal__content">
        <div class="search-modal__header">
          <h2>Поиск</h2>
          <button class="close-btn" @click="uiStore.toggleSearchModal">
            <Icon name="solar:close-circle-bold" size="32" />
          </button>
        </div>
        <Search class="modal-search" />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.search-modal {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 60px 16px; 
    
    @include respond(tablet) {
        padding-top: 100px;
    }
    
    &__content {
        width: 100%;
        max-width: 600px;
        animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        
        h2 {
            font-size: 28px;
            font-weight: 800;
            color: var(--text);
            margin: 0;
            letter-spacing: -0.5px;
        }
    }
}

.modal-search {
    width: 100%;
    :deep(.search__form) {
        height: 56px;
        font-size: 18px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 18px;
        padding: 0 20px;
    }

    :deep(.search__form-input) {
        font-size: 17px;
    }
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: var(--text);
  cursor: pointer;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(90deg);
  }

  &:active {
    transform: scale(0.9);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes modalFadeIn {
    from { 
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
    }
    to { 
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>
