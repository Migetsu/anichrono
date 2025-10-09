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
                    <router-link class="search-result" :to="`/animes/${a.id}`" @click="closeMenu">
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
        <h3 class="popular__title">Популярное сейчас</h3>
        <TitleCard v-if="popularStore.popular.length" :items="popularStore.popular" />
    </section>
    <section class="features">
        <h3 class="features__title">Почему выбирают AniChrono</h3>
        <div class="features-container">
            <div class="features__content">
                <div class="features__content-item">
                    <div class="features__content-icon"><font-awesome-icon icon="fa-solid fa-circle-play"
                            class="features-icon" /></div>
                    <h4 class="features__content-title">HD & 4K качество</h4>
                    <p class="features__content-desc">Наслаждайтесь любимыми аниме в высочайшем качестве с поддержкой 4K
                        разрешения</p>
                </div>
                <div class="features__content-item">
                    <div class="features__content-icon"><font-awesome-icon icon="fa-solid fa-clock"
                            class="features-icon" /></div>
                    <h4 class="features__content-title">Эксклюзивные релизы</h4>
                    <p class="features__content-desc">Первыми смотрите новые серии сразу после выхода в Японии</p>
                </div>
                <div class="features__content-item">
                    <div class="features__content-icon"><font-awesome-icon icon="fa-solid fa-closed-captioning"
                            class="features-icon" /></div>
                    <h4 class="features__content-title">Профессиональные субтитры</h4>
                    <p class="features__content-desc">Качественный перевод на русский язык от ведущих студий</p>
                </div>
                <div class="features__content-item">
                    <div class="features__content-icon"><font-awesome-icon icon="fa-solid fa-heart"
                            class="features-icon" /></div>
                    <h4 class="features__content-title">Персональные рекомендации</h4>
                    <p class="features__content-desc">Индивидуальные подборки на основе ваших предпочтений</p>
                </div>
            </div>
        </div>
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
import { searchAnimes } from "@/api/searchAnimes";

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
