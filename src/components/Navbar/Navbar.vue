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
                <li class="header__nav-item"><router-link class="header__nav-link" to="/catalog">Каталог</router-link></li>
                <li v-if="!auth.isLoggedIn" class="header__nav-item">
                    <button @click.prevent="auth.login()" class="header__nav-link profile__login">Войти</button>
                </li>
                <li v-else class="header__nav-item">
                    <router-link to="/profile" class="header__nav-link profile__link">
                        <img v-if="auth.user?.image && auth.user.image.x160"
                            :src="auth.user.image.x160" alt="avatar" class="profile__avatar" />
                        <span v-if="auth.user?.nickname" class="profile__nickname">{{ auth.user.nickname }}</span>
                    </router-link>
                </li>
            </ul>
        </nav>

        <!-- Burger button visible on md and below -->
        <button class="header__burger" :class="{ active: isMenuOpen }" :aria-expanded="isMenuOpen ? 'true' : 'false'" aria-controls="mobile-menu" @click="toggleMenu">
            <span class="header__burger-line"></span>
            <span class="header__burger-line"></span>
            <span class="header__burger-line"></span>
        </button>
    </header>

    <!-- Mobile menu -->
    <div v-if="isMenuOpen" class="mobile-menu-overlay" @click="closeMenu">
        <nav id="mobile-menu" class="mobile-menu" :class="{ 'mobile-menu--open': isMenuOpen }" @click.stop aria-modal="true" role="dialog">
            <ul class="mobile-menu__list">
                <li class="mobile-menu__item">
                    <router-link class="mobile-menu__link" to="/" @click="closeMenu">Главная</router-link>
                </li>
                <li class="mobile-menu__item">
                    <router-link class="mobile-menu__link" to="/catalog" @click="closeMenu">Каталог</router-link>
                </li>
                <li v-if="!auth.isLoggedIn" class="mobile-menu__item">
                    <button class="mobile-menu__link" @click="() => { auth.login(); closeMenu(); }">Войти</button>
                </li>
                <li v-else class="mobile-menu__item">
                    <router-link class="mobile-menu__link" to="/profile" @click="closeMenu">Профиль</router-link>
                </li>
            </ul>
        </nav>
    </div>
</template>

<style scoped>
/* Принудительные стили для мобильного меню */
#mobile-menu.mobile-menu {
    position: fixed;
    top: 0;
    right: 0;
    left: auto;
    width: 200px;
    height: 100vh;
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1100;
    display: flex;
    flex-direction: column;
    padding: 80px 0 20px 0;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.4);
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

#mobile-menu.mobile-menu.mobile-menu--open {
    transform: translateX(0);
}

#mobile-menu .mobile-menu__list {
    list-style: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    padding: 0 20px !important;
}

#mobile-menu .mobile-menu__item {
    opacity: 0;
    transform: translateX(30px);
    animation: slideInRight 0.3s ease forwards;
}

#mobile-menu .mobile-menu__item:nth-child(1) { animation-delay: 0.1s; }
#mobile-menu .mobile-menu__item:nth-child(2) { animation-delay: 0.2s; }
#mobile-menu .mobile-menu__item:nth-child(3) { animation-delay: 0.3s; }
#mobile-menu .mobile-menu__item:nth-child(4) { animation-delay: 0.4s; }

#mobile-menu .mobile-menu__link {
    color: #ffffff !important;
    text-decoration: none !important;
    font-family: "Comfortaa" !important;
    font-size: 1.1rem !important;
    font-weight: 500 !important;
    padding: 12px 16px !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(22, 33, 62, 0.6) 100%) !important;
    backdrop-filter: blur(5px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    display: block !important;
    text-align: left !important;
    position: relative !important;
    z-index: 1 !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

#mobile-menu .mobile-menu__link:hover {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(78, 205, 196, 0.15) 100%) !important;
    color: #ff6b6b !important;
    transform: translateX(5px) !important;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2) !important;
    border-color: rgba(255, 107, 107, 0.3) !important;
}

#mobile-menu .mobile-menu__link.router-link-exact-active {
    color: #ff6b6b !important;
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(78, 205, 196, 0.2) 100%) !important;
    border-color: rgba(255, 107, 107, 0.4) !important;
    box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3) !important;
}

#mobile-menu button.mobile-menu__link {
    background: none !important;
    border: none !important;
    cursor: pointer !important;
    font-family: "Comfortaa" !important;
    font-size: 1.1rem !important;
    font-weight: 500 !important;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Адаптивность для маленьких экранов */
@media (max-width: 425px) {
    #mobile-menu.mobile-menu {
        width: 180px;
        padding: 60px 0 20px 0;
    }
    
    #mobile-menu .mobile-menu__list {
        padding: 0 15px;
        gap: 0.8rem;
    }
    
    #mobile-menu .mobile-menu__link {
        font-size: 1rem;
        padding: 10px 12px;
    }
}

@media (max-width: 375px) {
    #mobile-menu.mobile-menu {
        width: 160px;
        padding: 50px 0 20px 0;
    }
    
    #mobile-menu .mobile-menu__list {
        padding: 0 12px;
        gap: 0.7rem;
    }
    
    #mobile-menu .mobile-menu__link {
        font-size: 0.95rem;
        padding: 8px 10px;
    }
}

@media (max-width: 320px) {
    #mobile-menu.mobile-menu {
        width: 140px;
        padding: 40px 0 20px 0;
    }
    
    #mobile-menu .mobile-menu__list {
        padding: 0 10px;
        gap: 0.6rem;
    }
    
    #mobile-menu .mobile-menu__link {
        font-size: 0.9rem;
        padding: 6px 8px;
    }
}
</style>

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