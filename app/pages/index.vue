<script setup lang="ts">
const siteUrl = 'https://anichrono.vercel.app'

useSeoMeta({
  title: 'AniChrono — Смотреть аниме онлайн',
  ogTitle: 'AniChrono — Смотреть аниме онлайн',
  description: 'AniChrono — аниме-сервис для просмотра и отслеживания аниме. Актуальные релизы, онгоинги, сезонные новинки и ваш личный список просмотренного.',
  ogDescription: 'AniChrono — аниме-сервис для просмотра и отслеживания аниме. Актуальные релизы, онгоинги, сезонные новинки и ваш личный список просмотренного.',
  ogImage: `${siteUrl}/logo.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'AniChrono — Смотреть аниме онлайн',
  twitterDescription: 'AniChrono — аниме-сервис для просмотра и отслеживания аниме. Актуальные релизы, онгоинги, сезонные новинки и ваш личный список просмотренного.',
  twitterImage: `${siteUrl}/logo.jpg`,
})
</script>

<template>
    <div class="wrapper">
        <HomeReleaseCalendar />
        <Seasonal />
        <Popular />
    </div>
</template>

<style lang="scss" scoped>

</style>