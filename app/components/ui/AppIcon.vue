<script setup lang="ts">
type IconName =
  | 'search' | 'menu' | 'close' | 'play' | 'bookmark' | 'star' | 'clock'
  | 'calendar' | 'home' | 'grid' | 'user' | 'mail' | 'telegram' | 'logout'
  | 'arrow-right' | 'arrow-left' | 'arrow-up-right' | 'check' | 'plus'
  | 'trash' | 'chevron-left' | 'chevron-right' | 'external' | 'film'

const props = withDefaults(defineProps<{
  name: IconName
  size?: number
  stroke?: number
}>(), {
  size: 18,
  stroke: 1.6,
})

// Stroked shapes (24x24 grid). Filled shapes live in `filled`.
const stroked: Record<string, string[]> = {
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm16.6 16.6 4.4 4.4'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  bookmark: ['M6.5 4.5h11v15l-5.5-4-5.5 4z'],
  clock: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M12 8v4.4l3 1.9'],
  calendar: ['M5 6.5h14v13H5z', 'M5 10.5h14', 'M9 4v4', 'M15 4v4'],
  home: ['M4 11 12 4l8 7v8.5H4z', 'M9.5 19.5v-4.6h5v4.6'],
  grid: ['M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z'],
  user: ['M12 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', 'M5 20c1.2-3.4 3.8-5.1 7-5.1s5.8 1.7 7 5.1'],
  mail: ['M4 6.5h16v11H4z', 'm4.6 7.4 7.4 5.4 7.4-5.4'],
  telegram: ['m20.4 5.2-2.9 13.4-4.9-3.8-2.5 2.4.4-4.2 7.5-6.9-9.2 5.9-4.3-1.5z'],
  logout: ['M14 5h4.5v14H14', 'M4 12h9.5', 'm11 8.5 3.5 3.5-3.5 3.5'],
  'arrow-right': ['M4 12h15', 'm13.5 6.5 5.5 5.5-5.5 5.5'],
  'arrow-left': ['M20 12H5', 'm10.5 6.5-5.5 5.5 5.5 5.5'],
  'arrow-up-right': ['M7 17 17 7', 'M8.5 7H17v8.5'],
  check: ['m5 12.5 4.5 4.5L19 7'],
  plus: ['M12 5v14', 'M5 12h14'],
  trash: ['M5 7h14', 'M10 7V5h4v2', 'M7 7l1 13h8l1-13', 'M10.5 11v5', 'M13.5 11v5'],
  'chevron-left': ['m14 6-6 6 6 6'],
  'chevron-right': ['m10 6 6 6-6 6'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v6H4V6h6'],
  film: ['M4 5.5h16v13H4z', 'M4 9.5h16', 'M4 14.5h16', 'M8 5.5v4', 'M16 5.5v4', 'M8 14.5v4', 'M16 14.5v4'],
}

const filled: Record<string, string> = {
  play: 'M8 5.2v13.6L19.2 12z',
  star: 'M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z',
}

const paths = computed(() => stroked[props.name] ?? [])
const isFilled = computed(() => props.name in filled)
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    :fill="isFilled ? 'currentColor' : 'none'"
    :stroke="isFilled ? 'none' : 'currentColor'"
    :stroke-width="isFilled ? undefined : stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path v-if="isFilled" :d="filled[name]" />
    <path v-for="d in paths" v-else :key="d" :d="d" />
  </svg>
</template>

<style scoped>
.app-icon {
  flex: none;
  display: block;
}
</style>
