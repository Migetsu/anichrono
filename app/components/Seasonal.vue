<script lang="ts" setup>
import { onMounted } from 'vue';
import { useLatestStore } from '@/stores/latest'

const latestStore = useLatestStore()

onMounted(async () => {
    await latestStore.loadLatest()
})
</script>

<template>
    <section class="seasonal">
        <h3 class="seasonal-title">Новинки Сезона</h3>
        <SwiperCards v-if="latestStore.latest.length" :items="latestStore.latest" />
    </section>
</template>

<style lang="scss" scoped>
.seasonal {
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