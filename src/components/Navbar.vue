<template>
    <header class="header">
        <div class="header__logo">
            <router-link to="/">
                <span>Ani</span>
                <span>Chrono</span>
            </router-link>
        </div>
        <nav class="header__nav">
            <ul class="header__nav-list">
                <li class="header__nav-item"><router-link class="header__nav-link" to="/">Главная</router-link></li>
                <li class="header__nav-item"><router-link class="header__nav-link" to="/catalog">Каталог</router-link>
                </li>
                <li class="header__nav-item"><router-link class="header__nav-link" to="/watch">Смотреть</router-link>
                </li>
            </ul>
        </nav>
        <div class="header__profile">
            <button class="header__nav-link login">Войти</button>
        </div>
    </header>
</template>

<script>

</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.header {
    display: flex;
    justify-content: space-around;
    background: rgba(10, 10, 10, 0.95);
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px 0;
    align-items: center;

    &__logo {
        & span {
            color: #fff;
            font-size: 24px;
            line-height: 32px;
            font-family: 'Orbitron';
            font-weight: 700;
        }

        & span:first-child {
            color: $accent-coral;
        }

        & span:last-child {
            color: $accent-turquoise;
        }
    }

    &__nav {
        &-link {
            position: relative;
            color: #fff;
            padding: 8px 16px;
            transition: all 0.3s ease;
            border-radius: 5px;
            font-family: "Comfortaa";
            font-weight: 400;
            font-size: 16px;

            &.router-link-exact-active {
                color: $accent-coral;
                text-shadow: 0 0 10px $accent-coral;
            }

            &:hover {
                color: $accent-coral;
                background: rgba(255, 107, 107, 0.1);
            }

            &:hover::after {
                width: 80%;
            }

            &::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 50%;
                transform: translateX(-50%);
                height: 2px;
                width: 0;
                background: $accent-coral;
                transition: all 0.3s ease;
            }
        }

        &-list {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
    }
}

.login {
    background: transparent;
}
</style>