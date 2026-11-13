<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/ui/AppIcon.vue'

const uiStore = useUIStore()
const auth = useAuthStore()

const items = [
  { label: 'Главная', to: '/', icon: 'home' as const },
  { label: 'Каталог', to: '/catalog', icon: 'grid' as const },
  { label: 'Фильмы', to: '/movies', icon: 'film' as const },
  { label: 'Расписание', to: '/schedule', icon: 'calendar' as const },
  { label: 'Рандом', to: '/random', icon: 'star' as const },
]

const close = () => uiStore.closeMobileMenu()
</script>

<template>
  <Transition name="veil">
    <div v-if="uiStore.isMobileMenuOpen" class="menu-veil" @click="close" />
  </Transition>

  <Transition name="sheet">
    <aside v-if="uiStore.isMobileMenuOpen" class="menu" aria-label="Меню">
      <div class="menu__head">
        <NuxtLink to="/" class="menu__brand" @click="close">
          <img class="menu__logo" src="@/assets/images/logo.jpg" alt="">
          <span class="menu__word">AniChrono</span>
        </NuxtLink>
        <button type="button" class="icon-btn" title="Закрыть" @click="close">
          <AppIcon name="close" :size="20" />
          <span class="visually-hidden">Закрыть</span>
        </button>
      </div>

      <div class="menu__account">
        <template v-if="!auth.isLoggedIn">
          <button type="button" class="menu__login" @click="auth.login()">
            <span class="menu__text">
              <span class="menu__name">Войти в аккаунт</span>
              <span class="menu__hint">Списки синхронизируются с Shikimori</span>
            </span>
            <AppIcon name="arrow-right" :size="18" />
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/profile" class="menu__profile" @click="close">
            <img
              v-if="auth.user?.image?.x160"
              class="menu__avatar"
              :src="auth.user.image.x160"
              alt=""
            >
            <span class="menu__text">
              <span class="menu__name">{{ auth.user?.nickname }}</span>
              <span class="menu__hint">Открыть профиль</span>
            </span>
          </NuxtLink>
          <button type="button" class="menu__logout" @click="auth.logout()">
            <AppIcon name="logout" :size="16" />
            <span>Выйти</span>
          </button>
        </template>
      </div>

      <nav class="menu__nav">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="menu__row"
          active-class="menu__row--active"
          @click="close"
        >
          <AppIcon :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="menu__foot">
        <a
          class="menu__telegram"
          href="https://t.me/anichrono"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AppIcon name="telegram" :size="18" />
          <span>Telegram</span>
        </a>
        <p class="menu__copy">© {{ new Date().getFullYear() }} AniChrono</p>
      </div>
    </aside>
  </Transition>
</template>

<style lang="scss" scoped>
.menu-veil {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.72);
}

.menu {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 201;
  display: flex;
  flex-direction: column;
  width: min(360px, 88vw);
  height: 100%;
  background: var(--paper-raised);
  border-left: 1px solid var(--rule-strong);
  box-shadow: -24px 0 60px rgba(0, 0, 0, 0.5);
  padding: 16px var(--gutter) calc(16px + env(safe-area-inset-bottom, 0));

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--rule-strong);
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: var(--ink);
  }

  &__logo {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    object-fit: cover;
  }

  &__word {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__account {
    padding-block: 18px;
    border-bottom: 1px solid var(--rule);
  }

  &__login,
  &__profile {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    color: var(--ink);
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
  }

  &__hint {
    font-size: 12.5px;
    color: var(--ink-3);
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 2px;
    object-fit: cover;
  }

  &__login {
    justify-content: space-between;
    color: var(--ink);

    svg {
      color: var(--lapis);
    }
  }

  &__logout {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 13px;
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--signal);
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    padding-block: 8px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 48px;
    color: var(--ink-2);
    border-bottom: 1px solid var(--rule);
    transition: color var(--dur-fast) var(--ease);

    svg {
      color: var(--ink-3);
    }

    &:hover {
      color: var(--ink);
    }

    &--active {
      color: var(--lapis-deep);

      svg {
        color: var(--lapis);
      }
    }
  }

  &__chevron {
    margin-left: auto;
    color: var(--ink-3);
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
    padding-top: 18px;
    border-top: 1px solid var(--rule);
  }

  &__telegram {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--ink-2);
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--lapis-deep);
    }
  }

  &__copy {
    font-size: 12px;
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

.sheet-enter-active,
.sheet-leave-active {
  transition: transform var(--dur) var(--ease);
}

.sheet-enter-from,
.sheet-leave-to {
  transform: translateX(100%);
}
</style>
