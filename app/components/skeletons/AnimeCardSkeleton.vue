<script lang="ts" setup>
import Skeleton from '@/components/ui/Skeleton.vue'
</script>

<template>
  <div class="anime-card-skeleton">
    <div class="anime-card-skeleton-poster">
      <Skeleton height="100%" borderRadius="16px" />
    </div>
    <div class="anime-card-skeleton-content">
      <div class="anime-card-skeleton-title">
        <Skeleton height="18px" width="90%" borderRadius="4px" />
        <Skeleton height="18px" width="60%" borderRadius="4px" />
      </div>
      <div class="anime-card-skeleton-meta">
         <Skeleton height="14px" width="50px" borderRadius="4px" />
         <Skeleton height="14px" width="40px" borderRadius="4px" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.anime-card-skeleton {
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    width: 100%;
    height: 100%;

    &-poster {
        position: relative;
        padding-top: 115%; // Match USER fixed proportion
        background: var(--surface2);
        
        :deep(.skeleton) {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }

    &-content {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        min-height: 90px;

        @include respond(sm) {
            padding: 10px 12px;
            min-height: 80px;
        }
    }

    &-title {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
        height: 2.8em; // Match TitleCard fixed height
    }

    &-meta {
        display: flex;
        gap: 8px;
        margin-top: auto;
    }
}
</style>