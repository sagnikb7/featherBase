<script setup lang="ts">
import { toggleDark } from '~/composables'
</script>

<template>
  <nav
    class="header"
    :style="{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--glass-blur))',
      WebkitBackdropFilter: 'blur(var(--glass-blur))',
    }"
  >
    <a href="/" class="header-brand" aria-label="FeatherBase home">
      <img src="/favicon.svg" alt="" class="header-logo" width="22" height="22">
      <span class="header-title">FeatherBase</span>
    </a>
    <div class="header-actions">
      <button class="header-btn" aria-label="Toggle dark mode" @click="toggleDark()">
        <div i-ph-sun-duotone dark:i-ph-moon-duotone />
      </button>
    </div>
  </nav>
</template>
