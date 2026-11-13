<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/ui/AppIcon.vue'

const uiStore = useUIStore()
const auth = useAuthStore()
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner">
      <NuxtLink to="/" class="topbar__brand" aria-label="AniChrono — на главную">
        <img class="topbar__logo" src="@/assets/images/logo.jpg" alt="">
        <span class="topbar__word">AniChrono</span>
      </NuxtLink>

      <button
        type="button"
        class="icon-btn topbar__search"
        title="Поиск"
        @click="uiStore.toggleSearchModal()"
      >
        <AppIcon name="search" :size="19" />
        <span class="visually-hidden">Поиск</span>
      </button>
    </div>
  </header>

  <nav class="tabbar" aria-label="Основное меню">
    <ul class="tabbar__list">
      <li class="tabbar__item">
        <NuxtLink to="/catalog" class="tabbar__link" active-class="tabbar__link--active">
          <AppIcon name="grid" :size="20" />
          <span>Каталог</span>
        </NuxtLink>
      </li>
      <li class="tabbar__item">
        <button type="button" class="tabbar__link" @click="uiStore.toggleSearchModal()">
          <AppIcon name="search" :size="20" />
          <span>Поиск</span>
        </button>
      </li>
      <li class="tabbar__item">
        <NuxtLink to="/" class="tabbar__link" exact-active-class="tabbar__link--active">
          <AppIcon name="home" :size="20" />
          <span>Главная</span>
        </NuxtLink>
      </li>
      <li class="tabbar__item">
        <NuxtLink
          v-if="!auth.isLoggedIn"
          to="/"
          class="tabbar__link"
          @click.prevent="auth.login()"
        >
          <AppIcon name="user" :size="20" />
          <span>Профиль</span>
        </NuxtLink>
        <NuxtLink v-else to="/profile" class="tabbar__link" active-class="tabbar__link--active">
          <img
            v-if="auth.user?.image?.x160"
            class="tabbar__avatar"
            :src="auth.user.image.x160"
            alt=""
          >
          <AppIcon v-else name="user" :size="20" />
          <span>Профиль</span>
        </NuxtLink>
      </li>
      <li class="tabbar__item">
        <button type="button" class="tabbar__link" @click="uiStore.toggleMobileMenu()">
          <AppIcon :name="uiStore.isMobileMenuOpen ? 'close' : 'menu'" :size="20" />
          <span>Меню</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 90;
  background: var(--paper-sunk);
  border-bottom: 1px solid var(--rule-strong);

  @include respond(tablet-l) {
    display: none;
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 56px;
    padding-inline: var(--gutter);
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: var(--ink);
  }

  &__logo {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid var(--rule);
  }

  &__word {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 1;
  }

  &__search {
    width: 38px;
    height: 38px;
    border-color: var(--rule);
  }
}

.tabbar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 95;
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: var(--paper-sunk);
  border-top: 1px solid var(--rule-strong);

  @include respond(tablet-l) {
    display: none;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    height: var(--tabbar-h);
  }

  &__item {
    display: flex;
  }

  &__link {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 500;
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);

    &::before {
      content: '';
      position: absolute;
      inset-inline: 22%;
      top: 0;
      height: 2px;
      background: var(--lapis);
      transform: scaleX(0);
      transition: transform var(--dur) var(--ease);
    }

    &:hover {
      color: var(--ink-2);
    }

    &--active {
      color: var(--ink);

      &::before {
        transform: scaleX(1);
      }
    }
  }

  &__avatar {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    object-fit: cover;
  }
}
</style>
