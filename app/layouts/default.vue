<script setup lang="ts">
import NavbarDesktop from '@/components/layout/NavbarDesktop.vue'
import NavbarMobile from '@/components/layout/NavbarMobile.vue'
import MobileMenu from '@/components/layout/MobileMenu.vue'
import SearchModal from '@/components/layout/SearchModal.vue'
import Footer from '@/components/layout/Footer.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
</script>

<template>
  <div class="app">
    <NavbarDesktop />
    <NavbarMobile />
    <MobileMenu />
    <SearchModal />

    <main id="main" class="app__main">
      <slot />
    </main>

    <Footer />
    <ToastHost />
  </div>
</template>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app__main {
  flex: 1;
  padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0));

  @include respond(tablet-l) {
    padding-bottom: 0;
  }
}
</style>
