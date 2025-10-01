<template>
    <div class="canvas-wrapper">
        <CanvasBackground />
        <div class="canvas-overlay"></div>
    </div>
    <main ref="intro" class="intro">
        <h1 class="intro__title">AniChrono</h1>
        <p class="intro__desc">Погрузитесь в мир аниме с передовыми технологиями потокового вещания</p>
        <form action="" class="intro__form">
            <input type="text" class="intro__form-inp" placeholder="Поиск аниме, жанров, персонажей...">
            <button class="intro__form-btn">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
            </button>
        </form>
    </main>
    <section class="popular">
        <h3 class="popular__title">Популярное сейчас</h3>
        <TitleCard />
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
    <section class="seasonal">
        <h3 class="seasonal__title">Новинки сезона</h3>
        <TitleCard />
    </section>
    <Footer />
</template>

<script setup>
import { ref } from 'vue'
import CanvasBackground from '@/components/CanvasBackground.vue'
import TitleCard from '@/components/TitleCard.vue'
import Footer from '@/components/Footer.vue'
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
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('@/assets/images/hero-main.png');
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
        max-width: 1525px;
        padding: 0 15px;
        margin: 0 auto;
        overflow: hidden;
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