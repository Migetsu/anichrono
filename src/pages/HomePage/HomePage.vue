<template>
    <div class="canvas-wrapper">
        <CanvasBackground />
        <div class="canvas-overlay"></div>
    </div>
    <main ref="intro" class="intro">

        <TypedTitle ref="typedTitleRef" />
        <p class="intro__desc">Погрузитесь в мир аниме с передовыми технологиями потокового вещания</p>
        <form action="" class="intro__form" @submit.prevent>
            <input v-model="query" @input="handleSearch" type="text" class="intro__form-inp"
                placeholder="Поиск аниме...">
            <button v-if="query" @click="clearSearch" type="button" class="intro__form-clear" title="Очистить поиск">
                <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
            <button class="intro__form-btn" type="submit">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
            </button>

            <ul v-if="results.length > 0 && query.trim().length > 0" class="search-results">
                <li v-for="a in results" :key="a.id" class="search-item">
                    <router-link class="search-result" :to="`/watch/${a.id}`" @click="closeMenu">
                        <span class="search-result__title">{{ a.russian || a.name }}</span>
                        <span v-if="a.russian && a.name && a.russian !== a.name" class="search-result__subtitle">{{
                            a.name }}</span>
                    </router-link>
                </li>
            </ul>
        </form>
    </main>
    <section class="seasonal">
        <h3 class="seasonal__title">Новинки сезона</h3>
        <TitleCard v-if="latestStore.latest.length" :items="latestStore.latest" />
    </section>
    <section class="popular">
        <h3 class="popular__title">Популярное за всё время</h3>
        <TitleCard v-if="popularStore.popular.length" :items="popularStore.popular" />
    </section>
    <Footer />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CanvasBackground from '@/components/CanvasBackground.vue'
import TitleCard from '@/components/TitleCard/TitleCard.vue'
import Footer from '@/components/Footer/Footer.vue'
import TypedTitle from '@/components/TypedTitle/TypedTitle.vue'
import { useLatestStore } from '@/stores/latestStore'
import { usePopularStore } from '@/stores/popularStore'
import { usePopularStore } from '@/stores/popularStore'
import { searchAnimes } from "@/api/searchAnimes";
import { useHead } from '@unhead/vue'

useHead({
    title: 'Главная',
    meta: [
        { name: 'description', content: 'AniChrono - ваш проводник в мир аниме. Смотрите новинки и популярные тайтлы в высоком качестве.' }
    ]
})

const latestStore = useLatestStore()
const popularStore = usePopularStore()
const query = ref('')
const results = ref([])
const typedTitleRef = ref(null)
let searchTimeout

const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }

    if (!query.value.trim()) {
        results.value = []
        if (typedTitleRef.value) {
            typedTitleRef.value.resumeAnimation()
        }
        return;
    }

    if (typedTitleRef.value) {
        typedTitleRef.value.pauseAnimation()
    }

    searchTimeout = setTimeout(async () => {
        try {
            results.value = await searchAnimes(query.value.trim())
        }
        catch (e) {
            results.value = []
        }
    }, 300)
}

const clearSearch = () => {
    query.value = ''
    results.value = []
    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }
    if (typedTitleRef.value) {
        typedTitleRef.value.resumeAnimation()
    }
}

const isMenuOpen = ref(false);
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
    isMenuOpen.value = false;
    clearSearch();
};

onMounted(async () => {
    await latestStore.loadLatest()
    await popularStore.loadPopular()
})

</script>

<style scoped lang="scss">
@import '@/pages/HomePage/HomePage.scss';
</style>
