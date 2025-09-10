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
    <div v-if="auth.isLoggedIn" class="profile-page__lists">
      <div v-for="(items, status) in groupedLists" :key="status" class="profile-page__list">
        <h2 class="profile-page__list-title">{{ statusLabels[status] || status }}</h2>
        <ul class="profile-page__animes">
          <li v-for="r in items" :key="r.id" class="profile-page__anime">
            <router-link :to="`/animes/${r.anime.id}`">{{ r.anime.russian || r.anime.name }}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'

const auth = useAuthStore()
const lists = useListsStore()

const avatarUrl = computed(() => {
  const img = auth.user?.image?.x48 || auth.user?.avatar
  if (!img) return ''
  return img.startsWith('http') ? img : `https://shikimori.one${img}`
})

const statusLabels = {
  planned: 'Запланировано',
  completed: 'Просмотрено',
  dropped: 'Брошено',
  rewatching: 'Пересматриваю',
  on_hold: 'Отложено',
  watching: 'Смотрю'
}

const groupedLists = computed(() => lists.grouped)

onMounted(() => {
  if (auth.isLoggedIn && !lists.rates.length) lists.fetchRates()
})

const logout = () => {
  window.location.href = '/api/auth/logout'
}

</script>

<style lang="scss" scoped>
.profile-page {
  margin-top: 100px;
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

  &__lists {
    margin-top: 40px;
    display: grid;
    gap: 32px;
  }

  &__list-title {
    margin: 0 0 12px;
    font-size: 22px;
  }

  &__animes {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__anime a {
    color: #fff;
    text-decoration: none;
  }
}
</style>
