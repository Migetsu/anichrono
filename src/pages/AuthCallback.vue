<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const params = new URLSearchParams(location.hash.slice(1))
  const token = params.get('access_token')
  if (!token) return router.replace({ name: 'home' })

  auth.setToken(token)                                     // кладём токен
  history.replaceState(null, '', location.pathname + location.search) // чистим URL
  await auth.fetchMe().catch(() => auth.clearToken?.())    // тянем профиль
  router.replace({ name: 'home' })                         // уходим на главную
})
</script>

<template><div>Входим...</div></template>


<style scoped>
div {
  margin-top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 40px;
}
</style>
