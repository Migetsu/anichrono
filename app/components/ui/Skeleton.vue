<script lang="ts" setup>
interface Props {
  width?: string
  height?: string
  borderRadius?: string
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '100%',
  borderRadius: '8px'
})
</script>

<template>
  <div 
    class="skeleton" 
    :style="{ width, height, borderRadius }"
  ></div>
</template>

<style lang="scss" scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 37%,
    rgba(255, 255, 255, 0.05) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>