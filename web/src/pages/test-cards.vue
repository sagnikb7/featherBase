<script setup lang="ts">
import type { Bird, SingleBirdResponse } from '~/types/common'
import { baseUrl, generateCard } from '~/composables'

const RARITY_LABELS = ['', 'common', 'uncommon', 'rare', 'very-rare', 'legendary']
const ONLINE_MODE = import.meta.env.VITE_IMG_DELIVERY_MODE !== 'offline'

const birds = ref<Bird[]>([])
const status = ref('idle')
const progress = ref(0)
const loadError = ref('')

function getImageUrl(bird: Bird): string {
  const img = bird.meta?.images?.[0]
  if (!img)
    return ''
  return ONLINE_MODE ? img.url : `/images/birds/${img.file}`
}

async function fetchBirdById(id: number): Promise<Bird | null> {
  try {
    const res = await fetch(`${baseUrl}/v1.0/birds/${id}`)
    const data: SingleBirdResponse = await res.json()
    return data?.data?.name ? data.data : null
  }
  catch { return null }
}

async function loadBirds() {
  status.value = 'loading'
  loadError.value = ''
  const found: Bird[] = []
  const targetRarities = new Set([1, 2, 3, 4, 5])

  for (let id = 1; id <= 200 && targetRarities.size > 0; id++) {
    const bird = await fetchBirdById(id)
    if (bird && targetRarities.has(bird.rarity)) {
      found.push(bird)
      targetRarities.delete(bird.rarity)
    }
  }

  if (found.length === 0) {
    loadError.value = 'Could not fetch any birds. Is the backend running?'
    status.value = 'idle'
    return
  }

  found.sort((a, b) => a.rarity - b.rarity)
  birds.value = found
  status.value = 'ready'
}

async function generateAll() {
  status.value = 'generating'
  progress.value = 0

  for (const bird of birds.value) {
    status.value = `Generating rarity ${bird.rarity}: ${bird.name}...`
    const imgUrl = getImageUrl(bird)
    const blob = await generateCard(bird, imgUrl)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rarity-${bird.rarity}-${RARITY_LABELS[bird.rarity]}.png`
    a.click()
    URL.revokeObjectURL(url)
    progress.value++
    await new Promise(r => setTimeout(r, 800))
  }

  status.value = 'done'
}

loadBirds()
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto; padding: 0 20px; font-family: var(--font-sans);">
    <h1 style="font-family: var(--font-display); font-size: 24px; font-weight: 600; margin-bottom: 8px;">
      Card Generation Test
    </h1>
    <p style="color: var(--color-text-muted); font-size: 14px; margin-bottom: 24px;">
      Fetches one real bird per rarity tier from the API, generates trading cards with actual images,
      and downloads them. Move to <code>reference/cards/</code>.
    </p>

    <div v-if="loadError" style="padding: 12px 16px; background: var(--color-danger-light); color: var(--color-danger-text); border-radius: 8px; font-size: 14px; margin-bottom: 16px;">
      {{ loadError }}
    </div>

    <div v-if="status === 'loading'" style="color: var(--color-text-faint); font-size: 14px;">
      Scanning API for one bird per rarity tier...
    </div>

    <button
      v-if="birds.length > 0"
      :disabled="status === 'generating'"
      style="padding: 10px 24px; border-radius: 9999px; border: none; background: var(--color-accent); color: var(--color-bg); font-weight: 600; font-size: 14px; cursor: pointer;"
      @click="generateAll"
    >
      {{ status === 'done' ? 'Generate Again' : `Generate ${birds.length} Cards` }}
    </button>

    <div v-if="status === 'generating' || status === 'done'" style="margin-top: 20px;">
      <div style="height: 4px; background: var(--color-bg-muted); border-radius: 2px; overflow: hidden;">
        <div
          style="height: 100%; background: var(--color-accent); transition: width 0.3s ease;"
          :style="{ width: `${(progress / birds.length) * 100}%` }"
        />
      </div>
      <p style="margin-top: 8px; font-size: 13px; color: var(--color-text-faint);">
        {{ status === 'done' ? `All ${birds.length} cards downloaded!` : status }}
      </p>
    </div>

    <div v-if="birds.length" style="margin-top: 32px; border-top: 1px solid var(--color-divider); padding-top: 20px;">
      <h2 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--color-text-muted);">
        Birds Found
      </h2>
      <div
        v-for="bird in birds"
        :key="bird.rarity"
        style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--color-divider);"
      >
        <span style="font-family: var(--font-mono); font-size: 13px; color: var(--color-text-faint); width: 36px;">
          R{{ bird.rarity }}
        </span>
        <span style="font-family: var(--font-serif); font-size: 15px; flex: 1;">
          {{ bird.name }}
        </span>
        <span style="font-size: 12px; color: var(--color-text-faint);">
          {{ bird.iucnStatus }} · {{ bird.meta?.images?.length || 0 }} img
        </span>
      </div>
    </div>
  </div>
</template>
