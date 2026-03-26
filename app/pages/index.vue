<script setup lang="ts">
const siteUrl = 'https://anichrono.vercel.app'

useSeoMeta({
  title: 'AniChrono — Каталог аниме, фильмов и сериалов',
  ogTitle: 'AniChrono — Каталог аниме, фильмов и сериалов',
  description: 'Добро пожаловать на AniChrono! Смотрите актуальные релизы аниме, популярные сезоны и ведите список просмотренного.',
  ogDescription: 'Добро пожаловать на AniChrono! Смотрите актуальные релизы аниме, популярные сезоны и ведите список просмотренного.',
  ogImage: `${siteUrl}/logo.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'AniChrono — Каталог аниме, фильмов и сериалов',
  twitterDescription: 'Добро пожаловать на AniChrono! Смотрите актуальные релизы аниме, популярные сезоны и ведите список просмотренного.',
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