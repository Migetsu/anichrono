<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { fetchAnimeDetails } from '@/lib/api/animeDetails'
import type { ShikimoriAnimeFull } from '@/types/shikimori'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppCrumbs from '@/components/ui/AppCrumbs.vue'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || '')
const animeId = computed(() => slug.value.split('-')[0] || '')

const anime = ref<ShikimoriAnimeFull | null>(null)
const playerUrl = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const retryKey = ref(0)

const title = computed(() => anime.value?.russian || anime.value?.name || '')

useSeoMeta({
  title: computed(() => (anime.value ? `Смотреть ${title.value} — AniChrono` : 'Просмотр — AniChrono')),
  description: computed(() => (anime.value ? `Смотреть аниме ${title.value} онлайн в хорошем качестве.` : '')),
  robots: 'noindex, follow',
})

const crumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: title.value || 'Тайтл', to: `/animes/${slug.value}` },
  { label: 'Просмотр' },
])

async function load() {
  try {
    isLoading.value = true
    error.value = null
    const data = await fetchAnimeDetails(animeId.value)
    if (!data) throw new Error('Тайтл не найден')
    anime.value = data

    const response = await $fetch<{ results?: { link: string }[] }>('/api/kodik/search', {
      params: { shikimori_id: data.id },
    }).catch(() => null)

    if (response?.results?.length) {
      playerUrl.value = response.results[0]?.link ?? null
    } else {
      error.value = 'Плеер для этого тайтла недоступен'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
watch(retryKey, load)
</script>

<template>
  <div class="watch">
    <div class="container">
      <AppCrumbs :items="crumbs" />

      <header class="watch__head">
        <NuxtLink :to="`/animes/${slug}`" class="watch__back">
          <AppIcon name="arrow-left" :size="15" />
          <span>К тайтлу</span>
        </NuxtLink>
        <h1 v-if="anime" class="watch__title">{{ title }}</h1>
      </header>

      <div v-if="isLoading" class="watch__frame watch__frame--skeleton">
        <span class="watch__loading">Загружаем плеер</span>
      </div>

      <div v-else-if="!playerUrl" class="watch__frame watch__frame--state">
        <p class="watch__state-title">Смотреть пока нечего</p>
        <p class="watch__state-text">{{ error }}</p>
        <div class="watch__state-actions">
          <button type="button" class="btn btn--outline" @click="retryKey++">Попробовать снова</button>
          <NuxtLink :to="`/animes/${slug}`" class="btn btn--quiet">К описанию</NuxtLink>
        </div>
      </div>

      <div v-else class="watch__frame">
        <iframe
          :src="playerUrl"
          class="watch__player"
          frameborder="0"
          allowfullscreen
          allow="autoplay; fullscreen"
          referrerpolicy="origin"
        />
      </div>

      <p class="watch__note">
        Плеер Kodik. Если видео не запускается, отключите блокировщик рекламы для этого домена.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.watch {
  padding-block: 20px 56px;

  @include respond(tablet) {
    padding-block: 28px 80px;
  }

  &__head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-block: 18px;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--ink-3);
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--ink);
    }
  }

  &__title {
    font-size: clamp(24px, 3.4vw, 38px);
  }

  &__frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    border: 1px solid var(--rule-strong);
    border-radius: 2px;
    overflow: hidden;

    &--skeleton {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--paper-sunk);
    }

    &--state {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 12px;
      padding: 24px;
      aspect-ratio: auto;
      min-height: 220px;
      background: var(--paper-raised);
    }
  }

  &__player {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
  }

  &__loading {
    font-size: 13px;
    color: var(--ink-3);
    animation: loading-pulse 1600ms var(--ease) infinite;
  }

  &__state-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
  }

  &__state-text {
    font-size: 14px;
    color: var(--ink-3);
  }

  &__state-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
  }

  &__note {
    margin-top: 12px;
    font-size: 12px;
    color: var(--ink-3);
  }
}

@keyframes loading-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}
</style>
