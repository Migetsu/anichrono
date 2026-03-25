<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const uiStore = useUIStore()
const auth = useAuthStore()

const menuItems = [
  { name: 'Главная', path: '/', icon: 'solar:home-2-bold' },
  { name: 'Поиск', icon: 'solar:magnifer-bold', action: () => uiStore.toggleSearchModal() },
  { name: 'Каталог', path: '/catalog', icon: 'solar:library-bold' },
  { name: 'Фильмы', path: '/movies', icon: 'solar:clapperboard-play-bold' },
  { name: 'Расписание', path: '/schedule', icon: 'solar:calendar-bold' },
  { name: 'Рандом', path: '/random', icon: 'solar:ghost-bold' },
]

const socialLinks = [
  { name: 'Telegram', url: 'https://t.me/anichrono', icon: 'simple-icons:telegram' },
]

const closeMenu = () => {
  uiStore.closeMobileMenu()
}

const handleItemClick = (item: any) => {
  if (item.action) {
    item.action()
  } else {
    closeMenu()
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="uiStore.isMobileMenuOpen" class="mobile-menu-overlay" @click="closeMenu"></div>
  </Transition>

  <Transition name="slide">
    <div v-if="uiStore.isMobileMenuOpen" class="mobile-menu">
      <div class="mobile-menu__header">
        <div class="mobile-menu__logo">
          <img src="@/assets/images/logo.jpg" alt="AniChrono">
          <span>AniChrono</span>
        </div>
        <button class="mobile-menu__close" @click="closeMenu">
          <Icon name="material-symbols:close-rounded" size="28" />
        </button>
      </div>

      <div class="mobile-menu__profile">
        <!-- NO GLOW HERE -->
        <template v-if="!auth.isLoggedIn">
          <button class="mobile-menu__profile-btn" @click="auth.login()">
            <div class="mobile-menu__profile-avatar placeholder">
              <Icon name="solar:user-circle-bold-duotone" size="28" />
            </div>
            <div class="mobile-menu__profile-info">
              <span class="mobile-menu__profile-name">Войти в аккаунт</span>
              <span class="mobile-menu__profile-status">Синхронизируйте списки с Шикимори</span>
            </div>
            <Icon name="solar:alt-arrow-right-linear" class="mobile-menu__profile-arrow" />
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/profile" class="mobile-menu__profile-btn" @click="closeMenu">
            <div class="mobile-menu__profile-avatar-wrapper">
              <img v-if="auth.user?.image.x160" :src="auth.user?.image.x160" alt="avatar" class="mobile-menu__profile-avatar">
              <div class="mobile-menu__profile-online"></div>
            </div>
            <div class="mobile-menu__profile-info">
              <span class="mobile-menu__profile-name">{{ auth.user?.nickname }}</span>
              <span class="mobile-menu__profile-status">Открыть профиль →</span>
            </div>
          </NuxtLink>
          <div class="mobile-menu__profile-divider"></div>
          <button class="mobile-menu__logout" @click="auth.logout()">
            <Icon name="solar:logout-3-bold-duotone" size="16" />
            <span>Выйти из аккаунта</span>
          </button>
        </template>
      </div>

      <nav class="mobile-menu__nav">
        <ul class="mobile-menu__list">
          <li v-for="item in menuItems" :key="item.name" class="mobile-menu__item">
            <template v-if="item.path">
              <NuxtLink :to="item.path" class="mobile-menu__link" @click="handleItemClick(item)">
                <Icon :name="item.icon" class="mobile-menu__icon" />
                <span>{{ item.name }}</span>
              </NuxtLink>
            </template>
            <template v-else>
              <button class="mobile-menu__link" @click="handleItemClick(item)">
                <Icon :name="item.icon" class="mobile-menu__icon" />
                <span>{{ item.name }}</span>
              </button>
            </template>
          </li>
        </ul>
      </nav>

      <div class="mobile-menu__footer">
        <div class="mobile-menu__socials">
          <a v-for="social in socialLinks" :key="social.name" :href="social.url" class="mobile-menu__social" target="_blank" rel="noopener noreferrer">
            <Icon :name="social.icon" size="20" />
          </a>
        </div>
        <p class="mobile-menu__copyright">© 2026 AniChrono. Все права защищены.</p>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 320px;
  height: 100%;
  background: var(--bg);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.05);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text);
    font-family: var(--font-logo);

    img {
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }
  }

  &__close {
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.9);
    }
  }

  &__profile {
    position: relative;
    margin-bottom: 24px;
    // Removed background completely
    overflow: visible;

    &-btn {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 14px;
      background: none;
      border: none;
      width: 100%;
      padding: 12px 0; // Compact
      text-align: left;
      cursor: pointer;
      color: var(--text);
      text-decoration: none;
      transition: background 0.2s;
    }

    &-avatar-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    &-avatar {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      object-fit: cover;
      display: block;

      &.placeholder {
        color: var(--accent);
      }
    }

    &-online {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: #4caf50;
      border: 2px solid #0a0a0a;
      border-radius: 50%;
    }

    &-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
      min-width: 0;
    }

    &-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
    }

    &-status {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.35);
    }

    &-arrow {
      color: rgba(255, 255, 255, 0.25);
      flex-shrink: 0;
    }

    &-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 8px 0;
    }
  }

  &__logout {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 0;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
  }

  &__nav {
    flex: 1;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__item {
    width: 100%;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    border-radius: 12px;
    color: var(--text);
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease;
    background: none;
    border: none;
    width: 100%;
    cursor: pointer;
    text-align: left;

    &.router-link-active {
      color: var(--accent);
      .mobile-menu__icon { color: var(--accent); }
    }
  }

  &__icon {
    font-size: 24px;
    color: gray;
  }

  &__footer {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  &__socials {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

  &__social {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
  }

  &__copyright {
    font-size: 0.75rem;
    color: gray;
  }
}

// Transitions
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
