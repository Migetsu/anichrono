<template>
  <div id="app">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar/Navbar.vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'AniChrono - Смотри аниме онлайн',
  titleTemplate: '%s | AniChrono',
  meta: [
    { name: 'description', content: 'AniChrono - современная платформа для просмотра аниме. Огромная база, высокое качество, удобный поиск.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'AniChrono' }
  ]
})
</script>

<style scoped></style>
