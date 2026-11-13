<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/ui/AppIcon.vue'

const uiStore = useUIStore()
const auth = useAuthStore()

const links = [
  { label: 'Каталог', to: '/catalog' },
  { label: 'Фильмы', to: '/movies' },
  { label: 'Расписание', to: '/schedule' },
  { label: 'Рандом', to: '/random' },
]
</script>

<template>
  <header class="masthead">
    <div class="container masthead__inner">
      <NuxtLink to="/" class="masthead__brand" aria-label="AniChrono — на главную">
        <img class="masthead__logo" src="@/assets/images/logo.jpg" alt="">
        <span class="masthead__word">AniChrono</span>
      </NuxtLink>

      <nav class="masthead__nav" aria-label="Основное меню">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="masthead__link"
          active-class="masthead__link--active"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="masthead__tools">
        <button type="button" class="masthead__search" @click="uiStore.toggleSearchModal()">
          <AppIcon name="search" :size="16" />
          <span>Поиск</span>
        </button>

        <template v-if="!auth.isLoggedIn">
          <button type="button" class="masthead__login" @click.prevent="auth.login()">
            Войти
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/profile" class="masthead__profile">
            <img
              v-if="auth.user?.image?.x160"
              class="masthead__avatar"
              :src="auth.user.image.x160"
              alt=""
            >
            <span class="masthead__nickname">{{ auth.user?.nickname }}</span>
          </NuxtLink>
          <button type="button" class="icon-btn masthead__logout" title="Выйти" @click="auth.logout()">
            <AppIcon name="logout" :size="17" />
            <span class="visually-hidden">Выйти</span>
          </button>
        </template>

        <button
          type="button"
          class="icon-btn masthead__menu"
          title="Меню"
          @click="uiStore.toggleMobileMenu()"
        >
          <AppIcon name="menu" :size="19" />
          <span class="visually-hidden">Меню</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.masthead {
  position: sticky;
  top: 0;
  z-index: 90;
  display: none;
  background: var(--paper-sunk);
  border-bottom: 1px solid var(--rule-strong);

  @include respond(tablet-l) {
    display: block;
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    height: var(--masthead-h);
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--ink);
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--lapis-deep);
    }
  }

  &__logo {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    object-fit: cover;
    border: 1px solid var(--rule);
  }

  &__word {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
  }

  &__nav {
    display: flex;
    align-items: center;
    align-self: stretch;
    gap: 26px;
    margin-inline: auto;
  }

  &__link {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    font-size: 15px;
    font-weight: 500;
    color: var(--ink-2);
    transition: color var(--dur-fast) var(--ease);

    &::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      bottom: -1px;
      height: 2px;
      background: var(--lapis);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--dur) var(--ease);
    }

    &:hover {
      color: var(--ink);
    }

    &--active {
      color: var(--ink);

      &::after {
        transform: scaleX(1);
      }
    }
  }

  &__tools {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__search {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding-inline: 12px;
    border: 1px solid var(--rule);
    border-radius: 2px;
    font-size: 13px;
    color: var(--ink-2);
    transition: color var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--ink);
      border-color: var(--rule-strong);
    }
  }

  &__login {
    height: 36px;
    padding-inline: 16px;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    border: 1px solid var(--rule-strong);
    transition: background-color var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);

    &:hover {
      background: var(--ink);
      border-color: var(--ink);
      color: var(--paper);
    }
  }

  &__profile {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px 4px 4px;
    border-radius: 2px;
    color: var(--ink);
    transition: background-color var(--dur-fast) var(--ease);

    &:hover {
      background: var(--paper-sunk);
    }
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 2px;
    object-fit: cover;
  }

  &__nickname {
    font-size: 14px;
    font-weight: 500;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__logout {
    width: 32px;
    height: 32px;
  }
}
</style>
