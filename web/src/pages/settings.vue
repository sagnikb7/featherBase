<script setup lang="ts">
import type { Theme } from '~/composables'
import { fireUnlockConfetti, unlockMidnight, usePwaInstall } from '~/composables'

const { showInstallCard, isIOS, installApp } = usePwaInstall()

const themeOptions: { value: Theme, label: string, description: string, icon: string }[] = [
  { value: 'light', label: 'Light', description: 'Always use light mode', icon: 'i-ph-sun-duotone' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode', icon: 'i-ph-moon-duotone' },
  { value: 'auto', label: 'Auto', description: 'Follow system preference', icon: 'i-ph-device-mobile-duotone' },
]

const midnightOption = { value: 'midnight' as Theme, label: 'Midnight', description: 'Deep violet night', icon: 'i-ph-shooting-star-duotone' }

const spreading = ref(false)
const spreadResult = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

const clearing = ref(false)
const cacheSize = ref<string | null>(null)

async function loadCacheSize() {
  try {
    const keys = await caches.keys()
    let total = 0
    for (const key of keys) {
      const cache = await caches.open(key)
      const requests = await cache.keys()
      await Promise.all(requests.map(async (req) => {
        const resp = await cache.match(req)
        if (resp) {
          const buf = await resp.clone().arrayBuffer()
          total += buf.byteLength
        }
      }))
    }
    cacheSize.value = total === 0
      ? null
      : total < 1024 * 1024
        ? `${(total / 1024).toFixed(1)} KB`
        : `${(total / (1024 * 1024)).toFixed(1)} MB`
  }
  catch {
    // non-critical
  }
}

onMounted(() => {
  loadCacheSize()
})

async function clearCache() {
  if (clearing.value)
    return
  clearing.value = true
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map(k => caches.delete(k)))
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(r => r.unregister()))
    window.location.reload()
  }
  catch {
    clearing.value = false
  }
}

function confirmShare() {
  unlockMidnight()
  fireUnlockConfetti()
  spreadResult.value = 'success'
}

async function spreadTheWord() {
  if (spreading.value)
    return
  spreading.value = true
  spreadResult.value = 'idle'
  try {
    const todaySeed = Math.floor(Date.now() / 86400000)
    const listRes = await fetch('/v1.0/birds?page=1&size=1')
    const listData = await listRes.json()
    const total = listData.pagination?.total ?? 100
    const serial = (todaySeed % total) + 1

    const birdRes = await fetch(`/v1.0/birds/${serial}`)
    const birdData = await birdRes.json()

    if (birdData.success && birdData.data) {
      const bird = birdData.data
      const imgUrl = bird.meta?.images?.[0]?.cdn ?? ''
      await shareBirdCard(bird, imgUrl, true)
      spreadResult.value = 'pending'
    }
    else {
      spreadResult.value = 'error'
    }
  }
  catch {
    spreadResult.value = 'error'
  }
  finally {
    spreading.value = false
  }
}
</script>

<template>
  <div class="settings-page">
    <header class="settings-hero">
      <h1 class="settings-title">
        Settings
      </h1>
      <p class="settings-subtitle">
        Customise your FeatherBase experience
      </p>
    </header>

    <div class="settings-body">
      <section class="settings-section">
        <h2 class="settings-section-title">
          <div i-ph-paint-brush-duotone class="settings-section-icon" />
          Appearance
        </h2>

        <div class="theme-picker">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            class="theme-option"
            :class="{ active: settings.theme === opt.value }"
            @click="setTheme(opt.value)"
          >
            <div :class="opt.icon" class="theme-option-icon" />
            <span class="theme-option-label">{{ opt.label }}</span>
            <span class="theme-option-desc">{{ opt.description }}</span>
            <div class="theme-option-check">
              <div i-ph-check-bold />
            </div>
          </button>
        </div>

        <!-- No <Transition> wrapper — unplugin-vue-router devtools crashes on null vnode children -->
        <button
          v-if="settings.midnightUnlocked"
          class="theme-option theme-option--midnight"
          :class="{ 'active': settings.theme === 'midnight', 'midnight-just-unlocked': spreadResult === 'success' }"
          @click="setTheme(midnightOption.value)"
        >
          <div class="midnight-shimmer" aria-hidden="true" />
          <div :class="midnightOption.icon" class="theme-option-icon" />
          <div class="midnight-text">
            <span class="theme-option-label">{{ midnightOption.label }}</span>
            <span class="theme-option-desc">{{ midnightOption.description }}</span>
          </div>
          <span class="midnight-badge">✦ Unlocked</span>
          <div class="theme-option-check">
            <div i-ph-check-bold />
          </div>
        </button>
      </section>

      <!-- Hidden once midnight is unlocked -->
      <section v-if="!settings.midnightUnlocked" class="settings-section">
        <h2 class="settings-section-title">
          <div i-ph-megaphone-duotone class="settings-section-icon" />
          Community
        </h2>

        <div class="spread-card">
          <div class="spread-card-body">
            <div class="spread-icon-wrap" aria-hidden="true">
              <div i-ph-paper-plane-tilt-duotone class="spread-icon" />
            </div>
            <div class="spread-text">
              <p class="spread-title">
                Spread the Word
              </p>
              <p class="spread-desc">
                Share today's featured bird as a card. Unlock the <strong>Midnight</strong> theme as a thank you.
              </p>
            </div>
          </div>

          <!-- No <Transition> — causes __vrv_devtools null vnode crash in dev -->
          <div v-if="spreadResult === 'success'" class="spread-success spread-success--animate">
            <div i-ph-shooting-star-duotone class="spread-success-icon" />
            <span>Midnight theme unlocked</span>
          </div>
          <button
            v-else-if="spreadResult === 'pending'"
            class="spread-btn spread-btn--confirm"
            @click="confirmShare"
          >
            <div i-ph-check-circle class="spread-btn-icon" />
            Did you share it? Tap to unlock
          </button>
          <button
            v-else
            class="spread-btn"
            :disabled="spreading"
            @click="spreadTheWord"
          >
            <div i-ph-paper-plane-tilt class="spread-btn-icon" />
            {{ spreading ? 'Generating card…' : 'Share Today\'s Bird' }}
          </button>
        </div>
      </section>

      <section v-if="showInstallCard" class="settings-section">
        <h2 class="settings-section-title">
          <div i-ph-device-mobile-duotone class="settings-section-icon" />
          Install
        </h2>
        <div class="settings-card">
          <div class="settings-row install-row">
            <div class="install-row-label">
              <div i-ph-device-mobile-camera-duotone class="install-row-icon" />
              <div>
                <p class="install-row-title">
                  Add to Home Screen
                </p>
                <p class="install-row-sub">
                  {{ isIOS ? 'Safari: Share → Add to Home Screen' : 'Full-screen · offline · instant launch' }}
                </p>
              </div>
            </div>
            <button v-if="!isIOS" class="install-pill-btn" @click="installApp">
              Install
            </button>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="settings-section-title">
          <div i-ph-hard-drives-duotone class="settings-section-icon" />
          Storage
        </h2>
        <div class="spread-card">
          <div class="spread-card-body">
            <div class="spread-icon-wrap cache-icon-wrap" aria-hidden="true">
              <div i-ph-broom-duotone class="spread-icon cache-icon" />
            </div>
            <div class="spread-text">
              <p class="spread-title">
                Clear Cache
              </p>
              <p class="spread-desc">
                Something feel off? A fresh start usually fixes it.
              </p>
              <p v-if="cacheSize" class="cache-size-label">
                {{ cacheSize }} cached
              </p>
            </div>
          </div>
          <button
            class="spread-btn cache-btn"
            :disabled="clearing"
            @click="clearCache"
          >
            <div i-ph-arrows-clockwise class="spread-btn-icon" :class="{ 'cache-btn-spinning': clearing }" />
            {{ clearing ? 'Clearing…' : 'Clear Cache & Refresh' }}
          </button>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="settings-section-title">
          <div i-ph-info-duotone class="settings-section-icon" />
          About
        </h2>
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-label">App</span>
            <span class="settings-row-value">FeatherBase</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Coverage</span>
            <span class="settings-row-value">Indian subcontinent</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Data source</span>
            <span class="settings-row-value">LLMs &amp; eBird</span>
          </div>
          <a
            href="https://github.com/sagnikb7/featherBase"
            target="_blank"
            rel="noopener noreferrer"
            class="settings-row settings-row-link"
          >
            <span class="settings-row-label">Source</span>
            <span class="settings-row-value settings-row-github">
              <div i-ph-github-logo class="settings-github-icon" />
              sagnikb7/featherBase
              <div i-ph-arrow-square-out class="settings-external-icon" />
            </span>
          </a>
        </div>
      </section>

      <p class="settings-made-with">
        Crafted with care · © 2025–2026 FeatherBase
      </p>
    </div>
  </div>
</template>
