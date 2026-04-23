import { onMounted, onUnmounted, ref } from 'vue'

const isOffline = ref(false)

export function useNetworkStatus() {
  function onSwMessage(event: MessageEvent) {
    if (event.data?.type === 'NETWORK_OFFLINE')
      isOffline.value = true
    if (event.data?.type === 'NETWORK_ONLINE')
      isOffline.value = false
  }

  async function onBrowserOnline() {
    try {
      await fetch('/_health', { cache: 'no-store' })
      isOffline.value = false
    }
    catch {
      // SW will notify when a real request succeeds
    }
  }

  function onBrowserOffline() {
    isOffline.value = true
  }

  onMounted(() => {
    navigator.serviceWorker?.addEventListener('message', onSwMessage)
    window.addEventListener('online', onBrowserOnline)
    window.addEventListener('offline', onBrowserOffline)
  })

  onUnmounted(() => {
    navigator.serviceWorker?.removeEventListener('message', onSwMessage)
    window.removeEventListener('online', onBrowserOnline)
    window.removeEventListener('offline', onBrowserOffline)
  })

  return { isOffline }
}
