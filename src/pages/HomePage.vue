<template>
    <div class="canvas-wrapper">
        <CanvasBackground />
        <div class="canvas-overlay"></div>
    </div>
    <main ref="intro" class="intro">
        
        <TypedTitle ref="typedTitleRef" />
        <p class="intro__desc">Погрузитесь в мир аниме с передовыми технологиями потокового вещания</p>
        <form action="" class="intro__form" @submit.prevent>
            <input v-model="query" @input="handleSearch" type="text" class="intro__form-inp" placeholder="Поиск аниме, жанров, персонажей...">
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
                        <span v-if="a.russian && a.name && a.russian !== a.name" class="search-result__subtitle">{{ a.name }}</span>
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
import TitleCard from '@/components/TitleCard.vue'
import Footer from '@/components/Footer.vue'
import TypedTitle from '@/components/TypedTitle.vue'
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
    // Очищаем предыдущий таймаут
    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }
    
    if (!query.value.trim()) {
        results.value = []
        // Возобновляем анимацию заголовка когда поиск пустой
        if (typedTitleRef.value) {
            typedTitleRef.value.resumeAnimation()
        }
        return;
    }
    
    // Приостанавливаем анимацию заголовка во время поиска
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
    // Возобновляем анимацию заголовка при очистке поиска
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
@import '@/styles/_variables.scss';

.intro {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('@/assets/images/intro_bg.jpg');
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;

    &__form {
        border-radius: 50px;
        max-width: 500px;
        width: 100%;
        background: rgba(26, 26, 46, 0.8);
        display: flex;
        border: 2px solid rgba(255, 107, 107, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;

        .search-results {
            position: absolute;
            top: calc(100% + 10px);
            left: 0;
            right: 0;
            margin: 0;
            padding: 8px;
            background: rgba(26, 26, 46, 0.6);
            border: 1px solid rgba(255, 107, 107, 0.2);
            border-radius: 12px;
            overflow-y: auto;
            z-index: 150;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            max-height: 320px;

            &::before {
                content: '';
                position: absolute;
                top: -8px;
                left: 20px;
                width: 14px;
                height: 14px;
                background: rgba(26, 26, 46, 0.6);
                border-left: 1px solid rgba(255, 107, 107, 0.2);
                border-top: 1px solid rgba(255, 107, 107, 0.2);
                transform: rotate(45deg);
                backdrop-filter: blur(10px);
            }

            .search-item {
                list-style: none;
                border-radius: 8px;
                overflow: hidden;
            }

            .search-result {
                display: block;
                padding: 12px 14px;
                text-decoration: none;
                background: linear-gradient(135deg, rgba(255, 107, 107, 0) 0%, rgba(78, 205, 196, 0) 100%);
                transition: all 0.25s ease;
                color: $text-primary;

                &:hover {
                    background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(78, 205, 196, 0.15) 100%);
                    transform: translateX(4px);
                }

                &__title {
                    display: block;
                    font-weight: 700;
                    font-size: 16px;
                    color: $text-primary;
                }

                &__subtitle {
                    display: block;
                    margin-top: 2px;
                    font-size: 13px;
                    color: $text-secondary;
                }
            }

            /* Scrollbar styling */
            &::-webkit-scrollbar { width: 8px; }
            &::-webkit-scrollbar-thumb { background: rgba(255, 107, 107, 0.35); border-radius: 8px; }
            &::-webkit-scrollbar-track { background: transparent; }
        }

        &:focus-within {
            border-color: $accent-coral;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
        }

        &-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: $accent-coral;
            border-radius: 100%;
            width: 40px;
            height: 40px;
            color: #fff;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                background: darken($accent-coral, 10%);
                transform: scale(1.05);
            }
        }

        &-clear {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 107, 107, 0.2);
            border-radius: 100%;
            width: 32px;
            height: 32px;
            color: $text-secondary;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-right: 8px;

            &:hover {
                background: rgba(255, 107, 107, 0.4);
                color: $text-primary;
                transform: scale(1.1);
            }
        }

        &-inp {
            padding: 16px 24px;
            width: 90%;
            background: transparent;
            font-size: 16px;
            color: $text-primary;
            font-family: "Comfortaa";
            font-weight: 400;

            &::placeholder {
                color: $text-primary;
            }
        }
    }

    &__title {
        font-family: "Orbitron";
        font-weight: 900;
        font-size: 64px;
        background: linear-gradient(45deg, $accent-coral, $accent-turquoise, $accent-gold);
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 16px;
    }

    &__desc {
        font-family: "Exo2";
        font-weight: 400;
        color: $text-secondary;
        font-size: 24px;
        max-width: 730px;
        text-align: center;
        margin-bottom: 32px;
    }
}

.canvas-wrapper {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
}

.canvas-bg {
    display: block;
    width: 100%;
    height: 100%;
}

.canvas-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 2;
    pointer-events: none;
}

.popular {
    padding: 80px 0;

    &__title {
        font-family: "Exo2";
        font-weight: 700;
        margin-bottom: 48px;
        font-size: 40px;
        background: linear-gradient(45deg, $accent-coral, $accent-turquoise);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
    }
}

.features {
    padding: 80px 0;

    &__title {
        font-family: "Exo2";
        font-weight: 700;
        margin-bottom: 48px;
        background: linear-gradient(45deg, $accent-coral, $accent-turquoise);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
        font-size: 40px;
    }

    &-container {
        max-width: 1530px;
        padding: 0 15px;
        margin: 0 auto;
        position: relative;
    }

    &__content {
        display: grid;
        gap: 32px;
        grid-template-columns: repeat(4, 1fr);

        &-item {
            background: rgba(26, 26, 46, 0.6);
            padding: 32px;
            border-radius: 15px;
            text-align: center;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 107, 107, 0.2);
            backdrop-filter: blur(10px);

            &:hover {
                box-shadow: 0 15px 30px rgba(255, 107, 107, 0.2);
                transform: scale(1.02);
            }

            &:hover .features-icon {
                transform: scale(1.1);
                text-shadow: 0 0 20px $accent-coral;
                transition: all .3s ease;
            }
        }

        &-icon {
            font-size: 48px;
            color: $accent-coral;
            margin-bottom: 16px;
            transition: all 0.3s ease;
        }

        &-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            color: $text-primary;
        }

        &-desc {
            font-family: "Comfortaa";
            font-weight: 400;
            color: $text-secondary;
            display: flex;
        }
    }
}

.seasonal {
    padding: 80px 0;

    &__title {
        font-family: "Exo2";
        font-weight: 700;
        margin-bottom: 48px;
        font-size: 40px;
        background: linear-gradient(45deg, $accent-coral, $accent-turquoise);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
    }
}
</style>