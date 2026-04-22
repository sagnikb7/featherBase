<script setup lang="ts">
const route = useRoute()

const isHome = computed(() => route?.path === '/')
const isSettings = computed(() => route?.path === '/settings')
</script>

<template>
  <nav class="bottom-nav" aria-label="Navigation">
    <RouterLink
      to="/"
      class="bottom-nav-item"
      :class="{ active: isHome }"
      aria-label="Birds"
    >
      <div class="bottom-nav-icon-wrap">
        <div i-ph-bird-duotone class="bottom-nav-icon" />
      </div>
      <span class="bottom-nav-label">Birds</span>
    </RouterLink>

    <RouterLink
      to="/settings"
      class="bottom-nav-item"
      :class="{ active: isSettings }"
      aria-label="Settings"
    >
      <div class="bottom-nav-icon-wrap">
        <div i-ph-gear-duotone class="bottom-nav-icon" />
      </div>
      <span class="bottom-nav-label">Settings</span>
    </RouterLink>
  </nav>
</template>
