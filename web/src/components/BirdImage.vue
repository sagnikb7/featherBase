<script setup>
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  colors: { type: String, default: '' },
})

const loaded = ref(false)
const failed = ref(false)

const fallbackGradient = computed(() => {
  // Map common bird color words to actual CSS colors
  const colorMap = {
    black: '#2a2a2a',
    white: '#f0ece4',
    grey: '#8a8a7e',
    gray: '#8a8a7e',
    brown: '#7a5c3a',
    red: '#a04030',
    orange: '#c47030',
    yellow: '#c4a440',
    green: '#4a7a4a',
    blue: '#4a6a8a',
    olive: '#6a7a3a',
    chestnut: '#7a4a2a',
    rufous: '#8a4a2a',
    cinnamon: '#9a6a3a',
    cream: '#e8dcc8',
    buff: '#c8b088',
    golden: '#b89a40',
    tawny: '#9a7a4a',
    crimson: '#8a2030',
    pink: '#c08080',
    purple: '#6a4a7a',
    violet: '#5a3a7a',
    slate: '#5a6a7a',
    sandy: '#c4a878',
    copper: '#a06830',
    maroon: '#5a2030',
    scarlet: '#c03020',
    azure: '#3a7ab0',
    turquoise: '#40908a',
    indigo: '#3a3a7a',
    mahogany: '#6a3020',
    ochre: '#b08030',
  }

  if (!props.colors)
    return 'linear-gradient(135deg, var(--color-bg-muted), var(--color-border))'

  const text = props.colors.toLowerCase()
  const found = []
  for (const [word, hex] of Object.entries(colorMap)) {
    if (text.includes(word))
      found.push(hex)
  }

  if (found.length === 0)
    return 'linear-gradient(135deg, var(--color-bg-muted), var(--color-border))'
  if (found.length === 1)
    return `linear-gradient(135deg, ${found[0]}dd, ${found[0]}88)`
  return `linear-gradient(135deg, ${found.slice(0, 3).join(', ')})`
})

function onLoad() {
  loaded.value = true
}

function onError() {
  failed.value = true
}

// flush:sync resets state before any DOM patch, preventing a race where
// a cached image fires @load during the patch and then gets overridden by the watcher
watch(() => props.src, () => {
  loaded.value = false
  failed.value = false
}, { flush: 'sync' })
</script>

<template>
  <div class="bird-img-wrap" :style="{ background: loaded && !failed ? 'var(--color-bg-muted)' : fallbackGradient }">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      class="bird-img"
      :class="{ 'bird-img--loaded': loaded }"
      @load="onLoad"
      @error="onError"
    >
    <span v-if="failed || !src" class="bird-img-fallback">
      {{ alt }}
    </span>
  </div>
</template>

<style>
.bird-img-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bird-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.bird-img--loaded {
  opacity: 1;
}

.bird-img-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: var(--space-4);
  font-family: var(--font-serif);
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.88);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}
</style>
