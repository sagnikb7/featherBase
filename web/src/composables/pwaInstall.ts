// Module-level so the deferred prompt survives navigation between pages.
// initPwaListeners() must be called once from App.vue on mount.

const deferredPrompt = ref<any>(null)

const isStandalone = ref(
  typeof window !== 'undefined'
  && (window.matchMedia('(display-mode: standalone)').matches
  || (navigator as any).standalone === true),
)

export function usePwaInstall() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  // Show the card when not already installed, and either:
  //   - we caught a deferred prompt (Android / Chrome / Edge)
  //   - or it's iOS (we show manual instructions instead)
  const showInstallCard = computed(
    () => !isStandalone.value && (deferredPrompt.value !== null || isIOS),
  )

  function initPwaListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
    })
    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null
      isStandalone.value = true
    })
  }

  async function installApp() {
    if (!deferredPrompt.value)
      return
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.value = null
      isStandalone.value = true
    }
  }

  return { showInstallCard, isIOS, isStandalone, installApp, initPwaListeners }
}
