<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{ animeId: number, label?: string }>()

const auth = useAuthStore()
const lists = useListsStore()

const isOpen = ref(false)
const isBusy = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const position = ref({ top: 0, left: 0 })

const options = [
  { id: 'planned', label: 'В планах' },
  { id: 'watching', label: 'Смотрю' },
  { id: 'rewatching', label: 'Пересматриваю' },
  { id: 'completed', label: 'Просмотрено' },
  { id: 'on_hold', label: 'Отложено' },
  { id: 'dropped', label: 'Брошено' },
] as const

const currentRate = computed(() => lists.rateFor(props.animeId))

const PANEL_WIDTH = 196

function open() {
  const rect = buttonRef.value?.getBoundingClientRect()
  if (!rect) return

  const below = rect.bottom + 6
  const panelHeight = 268
  const flip = below + panelHeight > window.innerHeight - 12
  const top = flip ? Math.max(12, rect.top - panelHeight - 6) : below
  const left = Math.min(
    Math.max(12, rect.right - PANEL_WIDTH),
    window.innerWidth - PANEL_WIDTH - 12,
  )

  position.value = { top, left }
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

async function choose(status: typeof options[number]['id']) {
  if (isBusy.value) return
  if (currentRate.value?.status === status) {
    close()
    return
  }

  isBusy.value = true
  close()
  try {
    await lists.setStatus(props.animeId, status)
  } finally {
    isBusy.value = false
  }
}

async function removeFromList() {
  if (isBusy.value) return
  isBusy.value = true
  close()
  try {
    await lists.remove(props.animeId)
  } finally {
    isBusy.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onClickOutside(panelRef, close, { ignore: [buttonRef] })
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="auth.isLoggedIn" class="list-menu">
    <button
      ref="buttonRef"
      type="button"
      class="list-menu__trigger"
      :class="{
        'list-menu__trigger--set': !!currentRate,
        'list-menu__trigger--labelled': !!label,
      }"
      :title="currentRate ? 'Изменить список' : 'Добавить в список'"
      :aria-expanded="isOpen"
      @click.stop.prevent="toggle"
    >
      <AppIcon name="bookmark" :size="label ? 15 : 16" />
      <template v-if="label">
        <span class="list-menu__label">{{ label }}</span>
        <AppIcon class="list-menu__chevron" name="chevron-right" :size="14" />
      </template>
      <span v-else class="visually-hidden">
        {{ currentRate ? 'Изменить список' : 'Добавить в список' }}
      </span>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="list-panel"
        :style="{ top: `${position.top}px`, left: `${position.left}px` }"
        role="menu"
      >
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          class="list-panel__item"
          :class="{ 'list-panel__item--active': currentRate?.status === option.id }"
          role="menuitem"
          @click.stop.prevent="choose(option.id)"
        >
          <span>{{ option.label }}</span>
          <AppIcon v-if="currentRate?.status === option.id" name="check" :size="14" />
        </button>

        <template v-if="currentRate">
          <div class="list-panel__rule"></div>
          <button
            type="button"
            class="list-panel__item list-panel__item--danger"
            role="menuitem"
            @click.stop.prevent="removeFromList"
          >
            Удалить из списка
          </button>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.list-menu {
  display: flex;
  flex: none;
}

.list-menu__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 2px;
  color: var(--ink-3);
  border: 1px solid transparent;
  transition: color var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    background-color var(--dur-fast) var(--ease);

  &:hover {
    color: var(--ink);
    border-color: var(--rule-strong);
  }

  &--set {
    color: var(--lapis);
  }

  &--labelled {
    width: auto;
    height: 44px;
    padding-inline: 16px;
    gap: 9px;
    border-color: var(--rule-strong);
    color: var(--ink);
    font-size: 14px;
    font-weight: 500;

    &:hover {
      border-color: var(--ink);
      color: var(--ink);
    }
  }
}

.list-menu__trigger--labelled.list-menu__trigger--set {
  border-color: var(--lapis);
  color: var(--ink);
}

.list-menu__label {
  white-space: nowrap;
}

.list-menu__chevron {
  color: var(--ink-3);
  transform: rotate(90deg);
}

.list-panel {
  position: fixed;
  z-index: 500;
  width: 196px;
  padding: 4px;
  background: var(--paper-raised);
  border: 1px solid var(--rule-strong);
  border-radius: 2px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    height: 36px;
    padding-inline: 10px;
    border-radius: 2px;
    font-size: 13.5px;
    color: var(--ink-2);
    text-align: left;
    transition: background-color var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);

    &:hover {
      background: var(--paper);
      color: var(--ink);
    }

    &--active {
      color: var(--lapis-deep);
    }

    &--danger {
      color: var(--signal);

      &:hover {
        color: var(--signal);
      }
    }
  }

  &__rule {
    height: 1px;
    margin: 4px 2px;
    background: var(--rule);
  }
}
</style>
