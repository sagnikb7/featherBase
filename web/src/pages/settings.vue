<script setup lang="ts">
import type { Theme } from '~/composables'
import { fireUnlockConfetti, unlockMidnight } from '~/composables'

const themeOptions: { value: Theme; label: string; description: string; icon: string }[] = [
  { value: 'light', label: 'Light', description: 'Always use light mode', icon: 'i-ph-sun-duotone' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode', icon: 'i-ph-moon-duotone' },
  { value: 'auto', label: 'Auto', description: 'Follow system preference', icon: 'i-ph-device-mobile-duotone' },
]

const midnightOption = { value: 'midnight' as Theme, label: 'Midnight', description: 'Deep violet night', icon: 'i-ph-shooting-star-duotone' }

const spreading = ref(false)
const spreadResult = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

function confirmShare() {
  unlockMidnight()
  fireUnlockConfetti()
  spreadResult.value = 'success'
}

async function spreadTheWord() {
  if (spreading.value) return
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
      await shareBirdCard(bird, imgUrl)
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
          :class="{ active: settings.theme === 'midnight', 'midnight-just-unlocked': spreadResult === 'success' }"
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
              <p class="spread-title">Spread the Word</p>
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
