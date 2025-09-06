<template>
  <header class="header">
    <nav
      class="header__nav"
      :class="{ transparent: isTransparent }"
      @click="handleInteraction"
    >
      <div class="header__nav-container container">
        <ul class="header__nav-list">
          <li>
            <router-link to="/" class="header__nav-logo">
              <img src="@/assets/images/logo.svg" alt="Logo" />
            </router-link>
          </li>
          <li v-for="link in links" :key="link.url">
            <router-link :to="link.url" class="header__nav-link">
              {{ link.title }}
            </router-link>
          </li>
        </ul>
        <div class="header__nav-list2">
          <div class="header__nav-form" @click.stop>
            <form class="nav__search" @submit.prevent>
              <input
                v-model="query"
                @input="handleSearch"
                type="text"
                class="nav__search-input"
                placeholder="Поиск"
              />
              <button type="submit" class="nav__search-button">
                <font-awesome-icon
                  :icon="['fas', 'search']"
                  class="nav__search-icon"
                />
              </button>
            </form>
            <ul v-if="results.length" class="nav__search-results">
              <li v-for="a in results" :key="a.id">
                <router-link
                  class="nav__search-result"
                  :to="`/animes/${a.id}`"
                  @click="clearSearch"
                >
                  {{ a.russian || a.name }}
                </router-link>
              </li>
            </ul>
          </div>
          <div class="header__nav-profile profile">
            <router-link to="/">
              <font-awesome-icon :icon="['fas', 'user']" />
            </router-link>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { searchAnimes } from "@/scripts/searchAnimes";

const links = reactive([
  { title: "Релизы", url: "/releases" },
  { title: "Онгоинги", url: "/ongoings" },
  { title: "Популярное", url: "/populars" },
]);

const isTransparent = ref(false);
const query = ref("");
const results = ref([]);
let scrollTimeout;
let searchTimeout;

const handleScroll = () => {
  isTransparent.value = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isTransparent.value = false;
  }, 200);
};

const handleInteraction = () => {
  isTransparent.value = false;
  clearSearch();
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  if (!query.value.trim()) {
    results.value = [];
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      results.value = await searchAnimes(query.value.trim());
    } catch (e) {
      results.value = [];
    }
  }, 300);
};

const clearSearch = () => {
  query.value = "";
  results.value = [];
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  clearTimeout(scrollTimeout);
  clearTimeout(searchTimeout);
});
</script>

<style></style>
