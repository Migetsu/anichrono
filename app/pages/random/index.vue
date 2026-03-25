<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { slugify } from '@/utils/slugify'
import { fetchRandomAnime } from '@/lib/api/animeDetails'

const router = useRouter()
const error = ref<string | null>(null)

useSeoMeta({
  title: 'Случайное аниме - AniChrono',
  description: 'Подбор случайного аниме для просмотра.'
})

async function roll() {
  const anime = await fetchRandomAnime()
  if (anime) {
    // Redirect to the anime page with ID-Slug format
    await router.replace(`/animes/${anime.id}-${slugify(anime.name)}`)
  }
}

onMounted(async () => {
  await roll()
})
</script>

<template>
  <div class="random-page">
    <div class="container">
      <div v-if="error" class="error-state">
        <Icon name="solar:sad-circle-bold" class="icon" />
        <p>{{ error }}</p>
        <button @click="roll" class="retry-btn">Попробовать снова</button>
      </div>
      <div v-else class="loading-state">
        <div class="dice-wrapper">
           <Icon name="solar:shuffle-linear" class="dice-icon" />
        </div>
        <h2>Ищем что-то интересное...</h2>
        <p>Подбираем для вас отличный тайтл</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.random-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: fadeIn 0.5s ease;
}

.dice-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(230, 57, 70, 0.4) 0%, transparent 70%);
    filter: blur(20px);
    animation: pulse 2s infinite;
  }
}

.dice-icon {
  font-size: 80px;
  color: var(--accent);
  animation: shake 2s infinite ease-in-out;
}

h2 {
  font-size: 28px;
  margin: 0;
  color: white;
}

p {
  color: var(--muted);
  margin: 0;
}

.icon {
    font-size: 64px;
    color: var(--accent);
}

.retry-btn {
    padding: 12px 24px;
    background: rgba(230, 57, 70, 0.1);
    color: var(--accent);
    border: 1px solid rgba(230, 57, 70, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    
    &:hover {
        background: var(--accent);
        color: #fff;
    }
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>