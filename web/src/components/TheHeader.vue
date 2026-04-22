<script setup lang="ts">
import { toggleDark } from '~/composables'

const route = useRoute()
const hidden = ref(false)
let lastScrollY = 0

const isDetailPage = computed(() => route.path.startsWith('/bird/'))

function onScroll() {
  const y = window.scrollY
  if (Math.abs(y - lastScrollY) < 10) return
  hidden.value = isDetailPage.value && y > lastScrollY && y > 56
  lastScrollY = y
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <nav
    class="header"
    :class="{ 'header--hidden': hidden }"
    :style="{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--glass-blur))',
      WebkitBackdropFilter: 'blur(var(--glass-blur))',
    }"
  >
    <a href="/" class="header-brand" aria-label="FeatherBase home">
      <img src="/favicon.svg" alt="" class="header-logo" width="22" height="22" />
      <span class="header-title">FeatherBase</span>
    </a>
    <div class="header-actions">
      <button class="header-btn" aria-label="Toggle dark mode" @click="toggleDark()">
        <div i-ph-sun-duotone dark:i-ph-moon-duotone />
      </button>
    </div>
  </nav>
</template>
