<!-- /src/pages/AuthCallback.vue -->
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const params = new URLSearchParams(location.hash.slice(1))
  const token = params.get('access_token')

  if (!token) {
    // нет токена в hash — уходим на главную
    return router.replace({ name: 'home' })
  }

  // 1) Сохраняем токен в стор/LS
  auth.setToken(token)

  // 2) Чистим url (убираем #access_token=...)
  history.replaceState(null, '', location.pathname + location.search)

  // 3) Тянем профиль
  try {
    await auth.fetchMe()
  } catch (e) {
    // на всякий — чистим и уходим
    auth.clearToken?.()
  } finally {
    // 4) Переход на главную (или куда нужно)
    router.replace({ name: 'home' })
  }
})
</script>

<template>
  <div>Входим...</div>
</template>

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
