<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { slugify } from '@/utils/slugify'
import { fetchRandomAnime } from '@/lib/api/animeDetails'

const router = useRouter()
const error = ref<string | null>(null)
const isPicking = ref(true)

useSeoMeta({
  title: 'Случайное аниме — AniChrono',
  description: 'Подбор случайного аниме для просмотра.',
})

async function roll() {
  error.value = null
  isPicking.value = true
  try {
    const anime = await fetchRandomAnime()
    if (!anime) {
      error.value = 'Shikimori не отдал случайный тайтл'
      return
    }
    await router.replace(`/animes/${anime.id}-${slugify(anime.name)}`)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Не получилось выбрать тайтл'
  } finally {
    isPicking.value = false
  }
}

onMounted(roll)
</script>

<template>
  <div class="random">
    <div class="container random__inner">
      <p class="random__label">Случайный тайтл</p>

      <template v-if="error">
        <h1 class="random__title">Не получилось</h1>
        <p class="random__text">{{ error }}</p>
        <div class="random__actions">
          <button type="button" class="btn btn--primary" @click="roll">Ещё раз</button>
          <NuxtLink to="/catalog" class="btn btn--outline">В каталог</NuxtLink>
        </div>
      </template>

      <template v-else>
        <h1 class="random__title">Выбираем</h1>
        <p class="random__text">Открываем случайный тайтл из каталога.</p>
        <div class="random__progress" aria-hidden="true">
          <span class="random__progress-bar"></span>
        </div>
        <span class="visually-hidden" role="status">{{ isPicking ? 'Идёт выбор' : '' }}</span>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.random {
  display: flex;
  min-height: 62vh;
  align-items: center;
  padding-block: 48px;

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  &__label {
    font-size: 12.5px;
    color: var(--ink-3);
  }

  &__title {
    font-size: clamp(31px, 5vw, 48px);
  }

  &__text {
    max-width: 44ch;
    font-size: 15px;
    color: var(--ink-2);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 8px;
  }

  &__progress {
    width: min(100%, 320px);
    height: 2px;
    margin-top: 16px;
    background: var(--rule);
    overflow: hidden;
  }

  &__progress-bar {
    display: block;
    width: 40%;
    height: 100%;
    background: var(--lapis);
    animation: picking 1200ms var(--ease) infinite;
  }
}

@keyframes picking {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(350%);
  }
}
</style>
