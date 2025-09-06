<template>
    <header class="header">
        <nav class="header__nav" :class="{ transparent: isTransparent }" @click="handleInteraction">
            <div class="header__nav-container container">
                <ul class="header__nav-list">
                    <li>
                        <router-link to="/" class="header__nav-logo">
                            <img src="@/assets/images/logo.svg" alt="Logo">
                        </router-link>
                    </li>
                    <li v-for="link in links" :key="link.url">
                        <router-link :to="link.url" class="header__nav-link">
                            {{ link.title }}
                        </router-link>
                    </li>
                </ul>
                <div class="header__nav-list2">
                    <div class="header__nav-form">
                        <form action="" class="nav__search">
                            <input type="text" class="nav__search-input" placeholder="Поиск">
                            <button type="submit" class="nav__search-button">
                                <font-awesome-icon :icon="['fas', 'search']" class="nav__search-icon" />
                            </button>
                        </form>
                    </div>
                    <div class="header__nav-profile profile">
                        <router-link to="/">
                            <font-awesome-icon :icon="['fas', 'user']" />
                        </router-link>
                    </div>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'

const links = reactive([
    { title: 'Релизы', url: '/releases' },
    { title: 'Онгоинги', url: '/ongoings' },
    { title: 'Популярное', url: '/populars' },
])

const isTransparent = ref(false)
let scrollTimeout

const handleScroll = () => {
    isTransparent.value = true
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
        isTransparent.value = false
    }, 200)
}

const handleInteraction = () => {
    isTransparent.value = false
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    clearTimeout(scrollTimeout)
})
</script>

<style></style>
