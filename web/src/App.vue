<script setup lang="ts">
import BottomNav from '~/components/BottomNav.vue'
</script>

<template>
  <main class="app-shell">
    <TheHeader />
    <div class="app-content">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </div>
    <BottomNav />
  </main>
</template>
