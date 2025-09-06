<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  if (typeof window !== 'undefined') {
    const query = window.location.search;
    window.location.href = `/api/auth/callback${query}`;
  }
});
</script>
