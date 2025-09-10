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
        <div v-for="s in statuses" :key="s.value" class="profile-page__list">
          <h2 class="profile-page__list-title">{{ s.label }}</h2>
          <div v-if="groupedLists[s.value]?.length" class="cards">
            <RouterLink
              v-for="r in groupedLists[s.value]"
              :key="r.id"
              class="card"
              :to="`/animes/${r.anime.id}`"
              :title="r.anime.russian || r.anime.name"
              :style="{
                backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${r.anime.poster?.originalUrl || fallback})`,
                backgroundSize: '100% 100%, cover',
                backgroundPosition: 'center, center',
                backgroundRepeat: 'no-repeat, no-repeat'
              }"
            >
              <div class="card__content">
                <h3 class="card__title">{{ r.anime.russian || r.anime.name }}</h3>
                <small class="card__meta">★ {{ r.anime.score || '—' }}</small>
              </div>
            </RouterLink>
          </div>
          <p v-else class="profile-page__empty">Пусто</p>
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

const statuses = [
  { value: 'planned', label: 'Запланировано' },
  { value: 'watching', label: 'Смотрю' },
  { value: 'rewatching', label: 'Пересматриваю' },
  { value: 'completed', label: 'Просмотрено' },
  { value: 'on_hold', label: 'Отложено' },
  { value: 'dropped', label: 'Брошено' }
]

const groupedLists = computed(() => lists.grouped)
const fallback = '/placeholder.jpg'

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

  &__empty {
    color: #ccc;
  }
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.card {
  position: relative;
  display: block;
  border-radius: 14px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  text-decoration: none;
  aspect-ratio: 2 / 3;
}

.card__content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  padding: 0 12px;
  color: #fff;
  z-index: 2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, .45);
  display: grid;
  gap: 4px;
}

.card__title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 1200px) {
  .card__title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.card__meta {
  opacity: .9;
  font-weight: 600;
  font-size: 16px;
}
</style>
