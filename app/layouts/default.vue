<script setup lang="ts">
import NavbarDesktop from '@/components/layout/NavbarDesktop.vue'
import NavbarMobile from '@/components/layout/NavbarMobile.vue'
import MobileMenu from '@/components/layout/MobileMenu.vue'
import SearchModal from '@/components/layout/SearchModal.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="layout-wrapper">
    <header class="header">
      <div class="container">
        <NavbarDesktop />
        <NavbarMobile />
      </div>
    </header>
    <MobileMenu />
    <SearchModal />
    <main class="main-content">
        <slot />
    </main>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>

</style>