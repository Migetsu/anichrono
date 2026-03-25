<script lang="ts" setup>
import { onMounted } from 'vue';
import { usePopularStore } from '@/stores/popular'

const popularStore = usePopularStore()

onMounted(async () => {
    await popularStore.loadPopular()
})
</script>

<template>
    <section class="popular">
        <h3 class="popular-title">Популярное за всё время</h3>
        <SwiperCards v-if="popularStore.popular.length" :items="popularStore.popular" />
    </section>
</template>

<style lang="scss" scoped>
.popular {
    padding: 40px 0;

    &-title {
        @include Title;
        font-family: var(--font-exo2, sans-serif);
        margin-bottom: 48px;
        background: linear-gradient(45deg, var(--accent), var(--chrono));
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;

        @include respond(tablet) {
            font-size: 2rem;
            margin-bottom: 32px;
        }

        @include respond(mobile-l) {
            font-size: 1.5rem;
            margin-bottom: 24px;
        }
    }
}
</style>