<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found-icon" i-ph-bird-duotone />
    <h1 class="not-found-title">
      Page not found
    </h1>
    <p class="not-found-text">
      This bird seems to have flown away.
    </p>
    <a href="/" class="not-found-link" @click.prevent="router.push('/')">
      <div i-ph-arrow-left />
      Back to all birds
    </a>
  </div>
</template>
