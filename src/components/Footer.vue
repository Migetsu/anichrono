<template>
    <footer class="footer">
        <div class="footer-container">
            <div class="footer__title">
                <span>Ani</span>
                <span>Chrono</span>
            </div>
            <p class="footer__desc">© 2025 AniChrono. Все права защищены.</p>
        </div>
    </footer>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.footer {
    background: rgba(10, 10, 10, 0.95);
    padding: 32px 0;
    text-align: center;
    border-top: 1px solid rgba(255, 107, 107, 0.2);

    &-container {
        padding: 0 16px;
        max-width: 1534px;
        margin: 0 auto;
    }

    &__title {
        font-weight: 700;
        font-size: 18px;
        line-height: 28px;
        margin-bottom: 8px;
        font-family: "Orbitron";

        & span:first-child {
            color: $accent-coral;
        }
        & span:last-child {
            color: $accent-turquoise;
        }
    }

    &__desc {
        color: rgb(156 163 175 / var(--tw-text-opacity, 1));
        font-family: 'Comfortaa';
        font-weight: 400;
    }
}
</style>