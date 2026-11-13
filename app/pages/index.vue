<script setup lang="ts">
const siteUrl = 'https://anichrono.vercel.app'

useSeoMeta({
  title: 'AniChrono — расписание эфира и каталог аниме',
  ogTitle: 'AniChrono — расписание эфира и каталог аниме',
  description: 'Ближайшие эфиры, новинки сезона и популярные тайтлы. AniChrono следит за выходом серий и хранит ваши списки.',
  ogDescription: 'Ближайшие эфиры, новинки сезона и популярные тайтлы. AniChrono следит за выходом серий и хранит ваши списки.',
  ogImage: `${siteUrl}/logo.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'AniChrono — расписание эфира и каталог аниме',
  twitterDescription: 'Ближайшие эфиры, новинки сезона и популярные тайтлы. AniChrono следит за выходом серий и хранит ваши списки.',
  twitterImage: `${siteUrl}/logo.jpg`,
})
</script>

<template>
  <div class="home">
    <HomeBroadcast />
    <HomeWeekStrip />
    <HomeSeasonRail />
    <HomePopularChart />
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
}
</style>
