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
        <div class="popular__title">Популярное сейчас</div>
        <TitleCard />
    </section>
</template>

<script setup>
import { ref } from 'vue'
import CanvasBackground from '@/components/CanvasBackground.vue'
import TitleCard from '@/components/TitleCard.vue'
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
        font-family: "Orbitron";
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