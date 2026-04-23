<script setup lang="ts">
import BottomNav from '~/components/BottomNav.vue'
import { useNetworkStatus, usePwaInstall } from '~/composables'

const { initPwaListeners } = usePwaInstall()
const { isOffline } = useNetworkStatus()

onMounted(() => initPwaListeners())
</script>

<template>
  <main class="app-shell">
    <Transition name="offline-banner">
      <div v-if="isOffline" class="offline-banner" role="status" aria-live="polite">
        <div i-ph-wifi-slash class="offline-icon" />
        <span>No connection · showing cached data</span>
      </div>
    </Transition>
    <div class="app-content">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" v-if="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </div>
    <BottomNav />
  </main>
</template>
