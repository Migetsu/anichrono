<template>
  <div class="wrapper">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar/Navbar.vue'

// в любом месте старта приложения (например, в App.vue или main.js)
const hash = window.location.hash;
const m = hash.match(/access_token=([^&]+)/);
if (m) {
  const token = decodeURIComponent(m[1]);

  // очищаем hash, чтобы не мешался в адресной строке
  history.replaceState(null, '', window.location.pathname + window.location.search);

  fetch('https://shikimori.one/api/users/whoami', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(user => {
      console.log('USER:', user); // <-- объект с данными пользователя
      // здесь можешь положить user в Pinia
    })
    .catch(err => console.error('whoami failed:', err));
}

</script>

<style></style>
