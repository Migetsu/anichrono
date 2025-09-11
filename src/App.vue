<template>
  <div class="wrapper">
    <Navbar />
    <div v-if="authBusy" class="login-overlay">Входим...</div>
    <router-view v-else-if="!authBusy"/>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar/Navbar.vue'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const authBusy = computed(() => auth.loggingIn || auth.loading)

</script>

<style>
.login-overlay {
  margin-top: 100px;
  color: #fff;
  font-size: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
