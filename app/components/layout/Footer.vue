<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

const navLinks = [
  { name: 'Каталог', path: '/catalog' },
  { name: 'Фильмы', path: '/movies' },
  { name: 'Расписание', path: '/schedule' },
  { name: 'Рандом', path: '/random' },
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="colophon">
    <div class="container">
      <div class="colophon__grid">
        <div class="colophon__brand">
          <NuxtLink to="/" class="colophon__logo">
            <img class="colophon__logo-image" src="@/assets/images/logo.jpg" alt="">
            <span>AniChrono</span>
          </NuxtLink>
          <p class="colophon__tagline">
            Каталог, расписание эфира и личные списки аниме в одном месте.
          </p>
          <a
            class="colophon__telegram"
            href="https://t.me/m1getsu"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AppIcon name="telegram" :size="17" />
            <span>Написать мне</span>
          </a>
        </div>

        <nav class="colophon__nav" aria-label="Разделы">
          <h2 class="colophon__label">Разделы</h2>
          <ul class="colophon__list">
            <li v-for="link in navLinks" :key="link.path">
              <NuxtLink :to="link.path" class="colophon__link">{{ link.name }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="colophon__about">
          <h2 class="colophon__label">О сервисе</h2>
          <p class="colophon__text">
            Видео не хранится на сайте. Права на контент принадлежат правообладателям.
          </p>
          <p class="colophon__text">
            Данные: <a href="https://shikimori.io" target="_blank" rel="noopener noreferrer">Shikimori</a>,
            <a href="https://kodik-api.com" target="_blank" rel="noopener noreferrer">Kodik</a>,
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>.
          </p>
          <a class="colophon__mail" href="mailto:daniilpichujkov@gmail.com">
            <AppIcon name="mail" :size="15" />
            <span>daniilpichujkov@gmail.com</span>
          </a>
        </div>
      </div>

      <div class="colophon__base">
        <span class="tabular">© {{ currentYear }} AniChrono</span>
        <span>Сделано для тех, кто смотрит ночью</span>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.colophon {
  margin-top: auto;
  padding-top: 48px;
  background: var(--inverse);
  color: var(--on-inverse);

  @include respond(tablet) {
    padding-top: 64px;
  }

  &__grid {
    display: grid;
    gap: 36px;
    padding-bottom: 40px;

    @include respond(tablet) {
      grid-template-columns: 1.4fr 0.8fr 1.4fr;
      gap: 48px;
      padding-bottom: 56px;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--on-inverse);
  }

  &__logo-image {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    object-fit: cover;
  }

  &__tagline {
    max-width: 34ch;
    font-size: 14px;
    line-height: 1.6;
    color: var(--on-inverse-2);
  }

  &__telegram {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding-inline: 14px;
    border: 1px solid rgba(241, 240, 234, 0.24);
    border-radius: 2px;
    font-size: 13.5px;
    color: var(--on-inverse);
    transition: border-color var(--dur-fast) var(--ease),
      background-color var(--dur-fast) var(--ease);

    &:hover {
      border-color: var(--on-inverse);
      background: rgba(241, 240, 234, 0.06);
    }
  }

  &__label {
    font-family: var(--font-main);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    color: var(--on-inverse-2);
    margin-bottom: 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__link {
    font-size: 14.5px;
    color: var(--on-inverse);
    border-bottom: 1px solid transparent;
    transition: border-color var(--dur-fast) var(--ease);

    &:hover {
      border-bottom-color: var(--on-inverse);
    }
  }

  &__about {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__text {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--on-inverse-2);
    max-width: 46ch;

    a {
      color: var(--on-inverse);
      border-bottom: 1px solid rgba(241, 240, 234, 0.35);
      transition: border-color var(--dur-fast) var(--ease);

      &:hover {
        border-bottom-color: var(--on-inverse);
      }
    }
  }

  &__mail {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    color: var(--on-inverse-2);
    transition: color var(--dur-fast) var(--ease);

    &:hover {
      color: var(--on-inverse);
    }
  }

  &__base {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-block: 18px;
    border-top: 1px solid rgba(241, 240, 234, 0.16);
    font-size: 12.5px;
    color: var(--on-inverse-2);
  }
}
</style>
