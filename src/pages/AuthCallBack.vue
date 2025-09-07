<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const hash = new URLSearchParams(location.hash.slice(1))
  const token = hash.get('access_token')

  if (token) {
    auth.setToken(token)          // положили токен (LS, стор)
    try { await auth.fetchUser?.() } catch {}
    // ВАЖНО: навигация через роутер, чтобы размонтировать /auth/callback
    await router.replace({ name: 'home' }) // или router.replace('/')
  } else {
    await router.replace({ name: 'home' }) // или '/'
  }
})
</script>
<template>
  <div>
    Входим...
  </div>
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
