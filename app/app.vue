<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const siteUrl = 'https://anichrono.vercel.app'

// Initialize auth on app mount
onBeforeMount(() => {
  auth.init().catch(err => {
    console.error('Initial auth failed:', err)
  })
})

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
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
