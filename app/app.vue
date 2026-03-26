<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const siteUrl = 'https://anichrono.vercel.app'

// Initialize auth on app mount
auth.init()

useSeoMeta({
  title: 'AniChrono - Смотреть аниме, фильмы и сериалы онлайн',
  ogTitle: 'AniChrono - Смотреть аниме, фильмы и сериалы онлайн',
  description: 'Крупнейший каталог аниме, фильмов и сериалов. Удобный поиск, фильтры и вся необходимая информация в одном месте.',
  ogDescription: 'Крупнейший каталог аниме, фильмов и сериалов. Удобный поиск, фильтры и вся необходимая информация в одном месте.',
  ogImage: `${siteUrl}/logo.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'AniChrono - Смотреть аниме, фильмы и сериалы онлайн',
  twitterDescription: 'Крупнейший каталог аниме, фильмов и сериалов. Удобный поиск, фильтры и вся необходимая информация в одном месте.',
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
