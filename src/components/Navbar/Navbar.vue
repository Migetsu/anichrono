<template>
    <header class="header">
        <div class="header__logo">
            <router-link to="/">
                <span>Ani</span>
                <span>Chrono</span>
            </router-link>
        </div>
        <nav class="header__nav">
            <ul class="header__nav-list">
                <li class="header__nav-item"><router-link class="header__nav-link" to="/">Главная</router-link></li>
                <li class="header__nav-item"><router-link class="header__nav-link" to="/catalog">Каталог</router-link>
                </li>
                <li class="header__nav-item header__nav-item--profile"><button class="header__nav-link profile__login" @click="goProfile">Профиль</button>
                </li>
            </ul>
        </nav>
        <div class="header__profile profile">
            <button v-if="!auth.isLoggedIn" @click.prevent="auth.login()" class="header__nav-link profile__login">Войти</button>
            <div v-else class="profile_info">
                <router-link to="/profile"><img v-if="auth.user?.image && auth.user.image.x160"
                        :src="auth.user.image.x160" alt="avatar" class="profile__avatar" /></router-link>
            </div>
        </div>

        <!-- Burger button visible on md and below -->
        <button class="header__burger" :class="{ active: isMenuOpen }" :aria-expanded="isMenuOpen ? 'true' : 'false'" aria-controls="mobile-menu" @click="toggleMenu">
            <span class="header__burger-line"></span>
            <span class="header__burger-line"></span>
            <span class="header__burger-line"></span>
        </button>
    </header>

    <!-- Mobile menu -->
    <transition name="slide-right">
        <nav v-if="isMenuOpen" id="mobile-menu" class="mobile-menu" @click.self="closeMenu" aria-modal="true" role="dialog">
            <ul class="mobile-menu__list">
                <li class="mobile-menu__item">
                    <router-link class="mobile-menu__link" to="/" @click="closeMenu">Главная</router-link>
                </li>
                <li class="mobile-menu__item">
                    <router-link class="mobile-menu__link" to="/catalog" @click="closeMenu">Каталог</router-link>
                </li>
                <li class="mobile-menu__item">
                    <button class="mobile-menu__link" @click="() => { goProfile(); }">Профиль</button>
                </li>
            </ul>
        </nav>
    </transition>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { searchAnimes } from "@/api/searchAnimes";
import { useAuthStore } from "@/stores/auth";

const links = reactive([
    { title: "Релизы", url: "/releases" },
    { title: "Онгоинги", url: "/ongoings" },
    { title: "Популярное", url: "/populars" },
]);

const query = ref("");
const results = ref([]);
let searchTimeout;
const auth = useAuthStore();
const router = useRouter();

function hasAnyToken() {
    if (auth?.token) return true
    try { if (sessionStorage.getItem('shiki_access_token')) return true } catch {}
    if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=')
            if (name === 'shiki_token_client' && value) return true
        }
    }
    return false
}

const goProfile = () => {
    if (hasAnyToken()) {
        closeMenu();
        router.push('/profile');
        return;
    }
    try { sessionStorage.setItem('post_login_redirect', '/profile') } catch {}
    auth.login('/profile');
};

const clearSearch = () => {
    query.value = "";
    results.value = [];
};

const isMenuOpen = ref(false);
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
    isMenuOpen.value = false;
    clearSearch();
};

// Скрытие навбара при скролле отключено по требованию

const handleSearch = () => {
    clearTimeout(searchTimeout);
    if (!query.value.trim()) {
        results.value = [];
        return;
    }
    searchTimeout = setTimeout(async () => {
        try {
            results.value = await searchAnimes(query.value.trim());
        } catch (e) {
            results.value = [];
        }
    }, 300);
};

onMounted(() => {
    auth.loadToken();
    window.addEventListener("storage", auth.loadToken);
});

onUnmounted(() => {
    window.removeEventListener("storage", auth.loadToken);
    clearTimeout(searchTimeout);
});
</script>

<style scoped lang="scss">
@import "@/components/Navbar/Navbar.scss"
</style>