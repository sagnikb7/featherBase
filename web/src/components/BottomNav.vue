<script setup lang="ts">
const route = useRoute()

const isHome = computed(() => route.path === '/')
const isDetail = computed(() => route.path.startsWith('/bird/'))
</script>

<template>
  <nav class="bottom-nav" aria-label="Mobile navigation">
    <a
      href="/"
      class="bottom-nav-item"
      :class="{ active: isHome }"
      aria-label="Home"
    >
      <div i-ph-house-duotone class="bottom-nav-icon" />
      <span class="bottom-nav-label">Home</span>
    </a>
    <button
      class="bottom-nav-item"
      aria-label="Toggle dark mode"
      @click="toggleDark()"
    >
      <div i-ph-sun-duotone dark:i-ph-moon-duotone class="bottom-nav-icon" />
      <span class="bottom-nav-label">{{ isDark ? 'Light' : 'Dark' }}</span>
    </button>
  </nav>
</template>
