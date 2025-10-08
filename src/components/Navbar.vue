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
            </ul>
        </nav>
        <div class="header__profile profile">
            <button v-if="!auth.isLoggedIn" @click="auth.login" class="header__nav-link profile__login">Войти</button>
            <div v-else class="profile_info">
                <router-link to="/profile"><img v-if="auth.user?.image && auth.user.image.x160"
                        :src="auth.user.image.x160" alt="avatar" class="profile__avatar" /></router-link>
            </div>
        </div>
    </header>
</template>

 <script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { searchAnimes } from "@/api/searchAnimes";
import { useAuthStore } from "@/stores/auth";

const links = reactive([
  { title: "Релизы", url: "/releases" },
  { title: "Онгоинги", url: "/ongoings" },
  { title: "Популярное", url: "/populars" },
]);

const isTransparent = ref(false);
const query = ref("");
const results = ref([]);
let scrollTimeout;
let searchTimeout;
const auth = useAuthStore();

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

const handleScroll = () => {
  isTransparent.value = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isTransparent.value = false;
  }, 200);
};

const handleInteraction = () => {
  isTransparent.value = false;
  closeMenu();
};

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
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("storage", auth.loadToken);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("storage", auth.loadToken);
  clearTimeout(scrollTimeout);
  clearTimeout(searchTimeout);
});
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    justify-content: space-around;
    background: rgba(10, 10, 10, 0.95);
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px 0;
    align-items: center;
    border-bottom: 1px solid rgba(255, 107, 107, 0.2);

    &__logo {
        padding: 8px 0;

        & span {
            color: #fff;
            font-size: 24px;
            line-height: 32px;
            font-family: 'Orbitron';
            font-weight: 700;
        }

        & span:first-child {
            color: $accent-coral;
        }

        & span:last-child {
            color: $accent-turquoise;
        }
    }

    &__nav {
        &-link {
            position: relative;
            color: #fff;
            padding: 8px 16px;
            transition: all 0.3s ease;
            border-radius: 5px;
            font-family: "Comfortaa";
            font-weight: 400;
            font-size: 16px;

            &.router-link-exact-active {
                color: $accent-coral;
                text-shadow: 0 0 10px $accent-coral;
            }

            &:hover {
                color: $accent-coral;
                background: rgba(255, 107, 107, 0.1);
            }

            &:hover::after {
                width: 80%;
            }

            &::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 50%;
                transform: translateX(-50%);
                height: 2px;
                width: 0;
                background: $accent-coral;
                transition: all 0.3s ease;
            }
        }

        &-list {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
    }
}

.login {
    background: transparent;
}

.profile {
        color: rgba(255, 255, 255, 0.6);
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;

        &__login {
            padding: 8px 12px;
            font-weight: 700;
            color: #fff;
            background: transparent;
            border-radius: 8px;
        }

        &__avatar {
            width: 42px;
            height: 42px;
        }
    }
</style>