<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth';

const uiStore = useUIStore()
const auth = useAuthStore()
</script>

<template>
    <nav class="navbar-mobile">
        <ul class="navbar-mobile__content">
            <li class="navbar-mobile__item">
                <NuxtLink to="/catalog" class="navbar-mobile__item-link">
                    <Icon name="fluent:apps-list-32-filled" class="navbar-mobile__item-icon" />
                    <span class="navbar-mobile__item-text">Каталог</span>
                </NuxtLink>
            </li>
            <li class="navbar-mobile__item">
                <NuxtLink class="navbar-mobile__item-link" @click="uiStore.toggleSearchModal">
                    <Icon name="mdi:search" class="navbar-mobile__item-icon" />
                    <span class="navbar-mobile__item-text">Поиск</span>
                </NuxtLink>
            </li>
            <li class="navbar-mobile__item">
                <NuxtLink to="/" class="navbar-mobile__item-link">
                    <img src="@/assets/images/logo.jpg" alt="">
                </NuxtLink>
            </li>
            <li class="navbar-mobile__item">
                <NuxtLink class="navbar-mobile__item-link" v-if="!auth.isLoggedIn" @click.prevent="auth.login()">
                    <Icon name="iconamoon:profile-fill" class="navbar-mobile__item-icon" />
                    <span class="navbar-mobile__item-text">Профиль</span>
                </NuxtLink>
                <NuxtLink v-else to="/profile" class="navbar-mobile__item-link">
                    <img class="profile-img" v-if="auth.user?.image.x160" :src="auth.user?.image.x160" alt="avatar">
                    <span>{{ auth.user?.nickname }}</span>
                </NuxtLink>
            </li>
            <li class="navbar-mobile__item">
                <button @click="uiStore.toggleMobileMenu" class="navbar-mobile__item-link">
                    <Icon :name="uiStore.isMobileMenuOpen ? 'material-symbols:close' : 'material-symbols:menu'"
                        class="navbar-mobile__item-icon" />
                    <span class="navbar-mobile__item-text">Меню</span>
                </button>
            </li>
        </ul>
    </nav>
</template>

<style lang="scss" scoped>
.navbar-mobile {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    z-index: 100;
    display: flex;
    background: var(--bg);
    border-top: 1px solid var(--border);

    @include respond(tablet-l) {
        display: none;
    }

    &__content {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0;
        margin: 0;
        list-style: none;
    }

    &__item {
        flex: 1;
        display: flex;
        justify-content: center;

        &-icon {
            width: 16px;
            height: 16px;

            @include respond(mobile-l) {
                width: 20px;
                height: 20px;
            }
        }

        &-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--muted);
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            width: 100%;
            transition: color 0.2s ease;

            &:hover {
                color: var(--accent);
            }

            @include respond(mobile-s) {
                max-width: 60px;
            }

            @include respond(mobile-m) {
                max-width: 70px;
            }

            @include respond(mobile-l) {
                max-width: 85px;
            }
        }

        &-text {
            width: 100%;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        img {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            object-fit: cover;
        }

        .profile-img {
            width: 22px;
            height: 22px;
            border-radius: 4px;
        }
    }
}
</style>