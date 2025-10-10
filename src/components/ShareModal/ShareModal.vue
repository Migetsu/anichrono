<template>
  <div v-if="isVisible" class="share-modal-overlay" @click="close">
    <div class="share-modal" @click.stop>
      <div class="share-modal__header">
        <h3 class="share-modal__title">
          <font-awesome-icon :icon="modalIcon" class="share-modal__icon" />
          {{ modalTitle }}
        </h3>
        <button class="share-modal__close" @click="close">
          <font-awesome-icon icon="fa-solid fa-times" />
        </button>
      </div>
      
      <div class="share-modal__content">
        <p class="share-modal__message">{{ modalMessage }}</p>
        
        <div v-if="showCopyButton" class="share-modal__actions">
          <button class="share-modal__btn primary" @click="copyLink">
            <font-awesome-icon icon="fa-solid fa-copy" />
            Скопировать ссылку
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  shareResult: {
    type: Object,
    default: null
  },
  shareUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'copy-link'])

const modalIcon = computed(() => {
  if (!props.shareResult) return 'fa-solid fa-share'
  
  if (props.shareResult.success) {
    return props.shareResult.method === 'native' 
      ? 'fa-solid fa-share' 
      : 'fa-solid fa-copy'
  } else {
    return 'fa-solid fa-exclamation-triangle'
  }
})

const modalTitle = computed(() => {
  if (!props.shareResult) return 'Поделиться'
  
  if (props.shareResult.success) {
    switch (props.shareResult.method) {
      case 'native':
        return 'Поделились!'
      case 'clipboard':
      case 'clipboard-fallback':
        return 'Ссылка скопирована!'
      default:
        return 'Готово!'
    }
  } else {
    return 'Ошибка'
  }
})

const modalMessage = computed(() => {
  if (!props.shareResult) return 'Поделитесь этим аниме с друзьями!'
  
  if (props.shareResult.success) {
    switch (props.shareResult.method) {
      case 'native':
        return 'Ссылка успешно отправлена через приложение!'
      case 'clipboard':
      case 'clipboard-fallback':
        return 'Ссылка скопирована в буфер обмена. Теперь вы можете вставить её в любое приложение.'
      default:
        return 'Поделились успешно!'
    }
  } else {
    return 'Не удалось поделиться контентом. Попробуйте еще раз.'
  }
})

const showCopyButton = computed(() => {
  return props.shareResult?.success && 
         (props.shareResult.method === 'clipboard' || props.shareResult.method === 'clipboard-fallback')
})

function close() {
  emit('close')
}

function copyLink() {
  emit('copy-link', props.shareUrl)
}
</script>

<style scoped lang="scss">
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.share-modal {
  background: rgba(26, 26, 46, 0.95);
  border-radius: 15px;
  border: 1px solid rgba(255, 107, 107, 0.3);
  backdrop-filter: blur(15px);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.share-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 107, 107, 0.2);
}

.share-modal__title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
}

.share-modal__icon {
  color: $accent-coral;
  font-size: 20px;
}

.share-modal__close {
  background: none;
  border: none;
  color: $text-secondary;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: $text-primary;
    background: rgba(255, 107, 107, 0.1);
  }
}

.share-modal__content {
  padding: 24px;
}

.share-modal__message {
  margin: 0 0 20px 0;
  color: $text-secondary;
  line-height: 1.5;
  font-size: 14px;
}

.share-modal__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.share-modal__btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: linear-gradient(45deg, $accent-coral, $hot-pink);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    }
  }

  &.secondary {
    background: rgba(78, 205, 196, 0.2);
    color: $accent-turquoise;
    border: 1px solid $accent-turquoise;

    &:hover {
      background: rgba(78, 205, 196, 0.3);
      transform: translateY(-1px);
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .share-modal {
    width: 95%;
    margin: 20px;
  }

  .share-modal__header {
    padding: 16px 20px;
  }

  .share-modal__content {
    padding: 20px;
  }

  .share-modal__title {
    font-size: 16px;
  }

  .share-modal__message {
    font-size: 13px;
  }
}
</style>
