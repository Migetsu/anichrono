<template>
  <section class="profile-page container">
    <h1>Профиль</h1>
    <div v-if="auth.isLoggedIn" class="profile-page__info">
      <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="profile-page__avatar" />
      <p class="profile-page__name">{{ auth.user?.nickname }}</p>
      <button class="profile-page__logout" @click="logout">Выйти</button>
    </div>
    <div v-else>
      <a href="/api/auth/login" class="profile-page__login">Войти</a>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

const avatarUrl = computed(() => {
  const img = auth.user?.image?.x48 || auth.user?.avatar;
  if (!img) return '';
  return img.startsWith('http') ? img : `https://shikimori.one${img}`;
});

const logout = () => {
  window.location.href = '/api/auth/logout';
};

</script>

<style lang="scss" scoped>
.profile-page {
  padding: 40px 0;
  color: #fff;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  &__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__logout {
    padding: 8px 16px;
    border-radius: 8px;
    background: red;
    color: #fff;
    font-weight: 700;
  }

  &__login {
    padding: 8px 16px;
    border-radius: 8px;
    background: red;
    color: #fff;
    font-weight: 700;
  }
}
</style>
