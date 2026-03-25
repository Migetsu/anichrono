<script setup lang="ts">
import { ref } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth';

const uiStore = useUIStore()
const auth = useAuthStore()
const isNotificationHasUnread = ref(true)
</script>

<template>
    <nav class="navbar-desktop">
        <div class="navbar-desktop__container">
            <div class="navbar-desktop__left">
                <NuxtLink to="/" class="navbar-desktop__logo">
                    <span class="navbar-desktop__logo-ani">Ani</span>
                    <span class="navbar-desktop__logo-chrono">Chrono</span>
                </NuxtLink>
            </div>

            <div class="navbar-desktop__center">
                <NuxtLink to="/catalog" class="navbar-desktop__link" exact-active-class="navbar-desktop__link--active">
                    КАТАЛОГ
                </NuxtLink>
                <NuxtLink to="/movies" class="navbar-desktop__link" exact-active-class="navbar-desktop__link--active">
                    ФИЛЬМЫ
                </NuxtLink>
                <NuxtLink to="/schedule" class="navbar-desktop__link" exact-active-class="navbar-desktop__link--active">
                    РАСПИСАНИЕ
                </NuxtLink>
                <NuxtLink to="/random" class="navbar-desktop__link" exact-active-class="navbar-desktop__link--active">
                    РАНДОМ
                </NuxtLink>
            </div>

            <div class="navbar-desktop__right">
                <button class="navbar-desktop__icon-btn" title="Поиск" @click="uiStore.toggleSearchModal">
                    <Icon name="mdi:search" size="20" />
                </button>

                <div class="navbar-desktop__auth">
                    <button class="navbar-desktop__btn-login" v-if="!auth.isLoggedIn" @click.prevent="auth.login()">ВОЙТИ</button>
                    <div v-else class="navbar-desktop__profile-wrapper">
                        <NuxtLink to="/profile" class="navbar-desktop__profile-link">
                            <img class="profile-img" v-if="auth.user?.image.x160" :src="auth.user?.image.x160" alt="avatar">
                            <span>{{ auth.user?.nickname }}</span>
                        </NuxtLink>
                        <button class="navbar-desktop__logout" @click="auth.logout()" title="Выйти">
                            <Icon name="solar:logout-3-bold-duotone" size="18" />
                        </button>
                    </div>
                </div>

                <button class="navbar-desktop__icon-btn" title="Меню" @click="uiStore.toggleMobileMenu">
                    <Icon name="ci:hamburger-md" size="24" />
                </button>
            </div>
        </div>
    </nav>
</template>

<style lang="scss" scoped>
.navbar-desktop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 70px;
    z-index: 100;
    background-color: var(--bg);
    border-bottom: 1px solid var(--border);
    display: none;

    @include respond(tablet-l) {
        display: flex;
        align-items: center;
    }

    &__container {
        width: 100%;
        max-width: 1440px;
        margin: 0 auto;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
    }

    &__left {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    &__logo {
        display: flex;
        align-items: center;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 2px;
        color: var(--text);
        font-family: var(--font-logo);

        &-ani {
            color: var(--accent);
        }

        &-chrono {
            color: var(--chrono);
        }
    }

    &__center {
        display: flex;
        align-items: center;
        gap: 32px;
    }

    &__link {
        position: relative;
        font-size: 13px;
        font-weight: 700;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        gap: 8px;
        height: 70px;
        transition: color 0.2s;

        &:hover {
            color: var(--text);
        }

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background-color: var(--accent);
            transition: width 0.3s ease;
        }

        &--active {
            color: var(--text);

            &::after {
                width: 100%;
            }
        }
    }

    &__right {
        display: flex;
        align-items: center;
        gap: 24px;
    }

    &__icon-btn {
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--surface);
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;

        &:hover {
            background-color: var(--surface2);
            color: var(--accent);
            transform: translateY(-2px);
        }
    }

    &__notification-dot {
        position: absolute;
        top: 8px;
        right: 10px;
        width: 6px;
        height: 6px;
        background-color: var(--accent);
        border-radius: 50%;
        border: 2px solid var(--surface);
    }

    &__auth {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    &__btn-login {
        font-size: 13px;
        font-weight: 700;
        color: var(--text);
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 10px 20px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background-color: var(--surface);
            border-color: var(--accent);
            color: var(--accent);
        }
    }

    &__profile-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        background: none; // REMOVED BACKGROUND
        padding: 4px 0;
        border: none; // REMOVED BORDER
        transition: color 0.2s;
    }

    &__profile-link {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text);
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: color 0.2s;

        &:hover {
            color: var(--accent);
        }

        .profile-img {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            object-fit: cover;
        }
    }

    &__logout {
        background: transparent;
        border: none;
        color: var(--muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 6px;
        border-radius: 8px;

        &:hover {
            color: var(--accent);
            transform: scale(1.1);
        }
    }
}
</style>