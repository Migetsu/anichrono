<script setup lang="ts">
const navLinks = [
  { name: 'Каталог', path: '/catalog' },
  { name: 'Фильмы', path: '/movies' },
  { name: 'Расписание', path: '/schedule' },
  { name: 'Рандом', path: '/random' },
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__glow"></div>
    <div class="container footer__inner">

      <div class="footer__brand">
        <NuxtLink to="/" class="footer__logo">
          <span class="footer__logo-ani">Ani</span><span class="footer__logo-chrono">Chrono</span>
        </NuxtLink>
        <p class="footer__tagline">Смотри аниме. Следи за выходом.</p>
        <a href="https://t.me/m1getsu" target="_blank" rel="noopener noreferrer" class="footer__telegram">
          <Icon name="simple-icons:telegram" size="18" />
          <span>Написать мне</span>
        </a>
      </div>

      <nav class="footer__nav">
        <span class="footer__nav-title">Навигация</span>
        <ul class="footer__nav-list">
          <li v-for="link in navLinks" :key="link.name">
            <NuxtLink :to="link.path" class="footer__nav-link">{{ link.name }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="footer__info">
        <span class="footer__nav-title">О сервисе</span>
        <p class="footer__disclaimer">
          AniChrono не хранит видеофайлы. Все права на контент принадлежат их правообладателям.
        </p>
        <p class="footer__powered">
          Данные предоставлены <a href="https://shikimori.io" target="_blank" rel="noopener noreferrer">Shikimori</a> и Kodik.
        </p>
        <a href="mailto:daniilpichujkov@gmail.com" class="footer__email">
          <Icon name="solar:letter-linear" size="15" />
          <span>daniilpichujkov@gmail.com</span>
        </a>
      </div>

    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <span class="footer__copyright">© {{ currentYear }} AniChrono. Все права защищены.</span>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  position: relative;
  margin-top: auto;
  border-top: 1px solid var(--border);
  background: var(--bg);
  padding: 48px 0 0;

  &__glow {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(var(--accent-rgb), 0.3) 20%, 
      rgba(var(--chrono-rgb), 0.3) 80%, 
      transparent 100%
    );
    pointer-events: none;
  }

  &__inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    padding-bottom: 40px;

    @include respond(tablet) {
      grid-template-columns: 1.5fr 1fr 1.5fr;
      gap: 48px;
      padding-bottom: 60px;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__logo {
    display: inline-flex;
    font-size: 1.5rem;
    font-weight: 800;
    text-decoration: none;
    letter-spacing: -1px;
    font-family: var(--font-logo);

    &-ani {
      color: var(--accent);
    }

    &-chrono {
      color: var(--chrono);
    }
  }

  &__tagline {
    font-size: 0.9rem;
    color: var(--muted);
    margin: 0;
    line-height: 1.5;
  }

  &__telegram {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
    text-decoration: none;
    padding: 12px 20px;
    border-radius: 14px;
    width: fit-content;
    background: linear-gradient(135deg, #0088cc 0%, #00aaff 100%);
    box-shadow: 0 4px 15px rgba(0, 136, 204, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 136, 204, 0.4);
      filter: brightness(1.1);
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &-title {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--muted);
    }

    &-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    &-link {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--muted);
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: var(--text);
      }

      &.router-link-active {
        color: var(--accent);
      }
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__disclaimer,
  &__powered {
    font-size: 0.85rem;
    color: var(--muted);
    margin: 0;
    line-height: 1.6;

    a {
      color: var(--text);
      font-weight: 600;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.2s;

      &:hover {
        color: var(--accent);
        border-bottom-color: var(--accent);
      }
    }
  }

  &__email {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: var(--muted);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--accent);
    }
  }

  &__bottom {
    border-top: 1px solid var(--border);
    background: var(--surface);

    &-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
    }
  }

  &__copyright {
    font-size: 0.8rem;
    color: var(--muted);
  }
}
</style>