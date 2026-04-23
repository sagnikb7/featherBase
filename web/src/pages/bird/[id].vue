<script setup lang="ts">
import type { Bird, Image, SingleBirdResponse } from '~/types/common'
import { baseUrl, formatSerial, getRarity, groupColor, isBotd, shareBirdCard, useIucnStatus } from '~/composables'
import BirdImage from '~/components/BirdImage.vue'

const route = useRoute()
const router = useRouter()
const routeBirdId = computed(() => {
  const match = route.path.match(/^\/bird\/(\d+)$/)
  return match ? Number.parseInt(match[1], 10) : Number.NaN
})

const ONLINE_MODE = import.meta.env.VITE_IMG_DELIVERY_MODE !== 'offline'

const currentBird = ref<Bird | undefined>()
const images = ref<Image[]>([])
const activeImage = ref(0)
const loading = ref(true)

const { iucnStatus, iucnStatusLabel, iucnStatusExplanation, iucnChipClass } = useIucnStatus(currentBird)
const sharing = ref(false)


// TODO: retire version check and sizeRange fallback once all birds are updated to v2 data
const sizeDetail = computed(() => {
  const b = currentBird.value
  if (!b) return null
  const isV2 = b.version && b.version >= '2026.04'
  if (isV2) return b.lengthCm ? `${b.lengthCm} cm` : null
  return b.sizeRange ?? null
})

const weightDisplay = computed(() => {
  const w = currentBird.value?.weightG
  if (!w) return null
  const useKg = w.max >= 1000
  const fmt = (g: number) => useKg ? (g / 1000).toFixed(2) : `${g}`
  const unit = useKg ? 'kg' : 'g'
  return w.min === w.max ? `${fmt(w.min)} ${unit}` : `${fmt(w.min)}–${fmt(w.max)} ${unit}`
})

const wingspanDisplay = computed(() => {
  const w = currentBird.value?.wingspanCm
  if (!w) return null
  return w.min === w.max ? `${w.min} cm` : `${w.min}–${w.max} cm`
})

const currentImageUrl = computed(() => {
  const img = images.value[activeImage.value]
  return img ? imageSrc(img) : ''
})

async function share() {
  if (!currentBird.value || sharing.value)
    return

  sharing.value = true
  try {
    await shareBirdCard(currentBird.value, currentImageUrl.value, isBotd(currentBird.value.serialNumber))
  }
  finally {
    sharing.value = false
  }
}

const birdId = computed(() => currentBird.value?.serialNumber ?? routeBirdId.value)
const hasPrev = computed(() => Number.isInteger(birdId.value) && birdId.value > 1)

function imageSrc(img: Image) {
  return ONLINE_MODE ? (img.cdn ?? '') : `/images/birds/${img.file}`
}

function visibleTags(img: Image) {
  return (img.tags || []).filter(t => t.toLowerCase() !== 'default')
}

async function getBirdData(id: number) {
  if (!Number.isInteger(id) || id < 1) {
    currentBird.value = undefined
    images.value = []
    loading.value = false
    return false
  }

  loading.value = true
  activeImage.value = 0
  try {
    const res = (await (
      await fetch(`${baseUrl}/v1.0/birds/${id}`)
    ).json()) as SingleBirdResponse

    if (res?.data?.name) {
      currentBird.value = res.data
      images.value = res.data.meta?.images || []
      return true
    }

    currentBird.value = undefined
    images.value = []
    return false
  }
  catch {
    currentBird.value = undefined
    images.value = []
    return false
  }
  finally {
    loading.value = false
  }
}

async function navigate(id: number) {
  if (id < 1)
    return

  await router.push(`/bird/${id}`)
}

function prevImage() {
  if (activeImage.value > 0)
    activeImage.value--
}

function nextImage() {
  if (activeImage.value < images.value.length - 1)
    activeImage.value++
}

let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) < 40)
    return
  if (dx < 0)
    nextImage()
  else
    prevImage()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' && hasPrev.value)
    navigate(birdId.value - 1)
  if (e.key === 'ArrowDown' && currentBird.value)
    navigate(birdId.value + 1)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

watch(
  routeBirdId,
  (id) => {
    getBirdData(id)
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="loading" class="detail-loader">
    <div class="loader" role="status">
      <div class="loader-dots">
        <span /><span /><span />
      </div>
    </div>
  </div>
  <div v-else-if="currentBird" class="bird-detail">
    <div
      class="bird-detail-image"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <BirdImage
        v-if="images.length"
        :src="imageSrc(images[activeImage])"
        :alt="currentBird.name"
        :colors="currentBird.colors"
        class="bird-detail-img-contain"
      />
      <div v-else class="bird-no-photo">
        <div i-ph-camera-slash class="bird-no-photo-icon" />
        <span class="bird-no-photo-label">No photo</span>
      </div>

      <div v-if="visibleTags(images[activeImage] || {}).length" class="image-tags">
        <span v-for="tag in visibleTags(images[activeImage])" :key="tag" class="image-tag">
          {{ tag }}
        </span>
      </div>

      <div v-if="images.length > 1" class="carousel-controls">
        <button
          class="carousel-arrow"
          :disabled="activeImage === 0"
          aria-label="Previous image"
          @click="prevImage"
        >
          <div i-ph-caret-left />
        </button>
        <div class="carousel-dots">
          <button
            v-for="(_, i) in images"
            :key="i"
            class="carousel-dot"
            :class="{ active: i === activeImage }"
            :aria-label="`Image ${i + 1}`"
            @click="activeImage = i"
          />
        </div>
        <button
          class="carousel-arrow"
          :disabled="activeImage === images.length - 1"
          aria-label="Next image"
          @click="nextImage"
        >
          <div i-ph-caret-right />
        </button>
      </div>
    </div>

    <div class="bird-detail-intro">
      <div class="bird-nav-row">
        <button
          class="bird-nav-btn"
          :disabled="!hasPrev"
          aria-label="Previous bird"
          @click="navigate(birdId - 1)"
        >
          <div i-ph-caret-left />
          <span>Prev</span>
        </button>
        <span class="bird-serial">
          {{ formatSerial(currentBird.serialNumber) }}
        </span>
        <button
          class="bird-nav-btn"
          aria-label="Next bird"
          @click="navigate(birdId + 1)"
        >
          <span>Next</span>
          <div i-ph-caret-right />
        </button>
      </div>

      <div class="bird-identity">
        <h1 class="bird-name">
          {{ currentBird.name }}
        </h1>
        <p class="bird-scientific">
          {{ currentBird.scientificName }}
        </p>
      </div>

      <div class="bird-badges">
        <button
          class="detail-tag detail-tag--clickable capitalize"
          :style="{ background: groupColor(currentBird.commonGroup).bg, color: groupColor(currentBird.commonGroup).text }"
          :title="`Browse all ${currentBird.commonGroup}`"
          @click="router.push({ path: '/', query: { group: currentBird.commonGroup } })"
        >
          {{ currentBird.commonGroup }}
          <span i-ph-caret-right class="group-pill-arrow" />
        </button>
        <span
          v-if="iucnStatus"
          :title="iucnStatusExplanation"
          class="iucn-chip"
          :class="iucnChipClass"
        >
          <span class="iucn-dot" />
          <span class="iucn-code">{{ iucnStatus }}</span>
          <span class="iucn-label">{{ iucnStatusLabel }}</span>
        </span>
        <span
          v-if="currentBird.rarity"
          class="rarity-chip"
          :style="{ background: getRarity(currentBird.rarity).bg, color: getRarity(currentBird.rarity).color }"
        >
          <span i-ph-star-fill class="rarity-star" />
          {{ getRarity(currentBird.rarity).label }}
        </span>
        <span v-if="isBotd(currentBird.serialNumber)" class="botd-chip">
          <span i-ph-sun-horizon-duotone class="botd-chip-icon" />
          Bird of the Day
        </span>
        <span v-if="!currentBird.verification" class="unverified-chip" title="This record hasn't been cross-checked against eBird yet">
          <span i-ph-warning class="unverified-icon" />
          Unverified
        </span>
      </div>

      <button
        class="bird-share-cta"
        :class="{ 'bird-share-cta--loading': sharing }"
        :disabled="sharing"
        aria-label="Share bird card"
        @click="share"
      >
        <div i-ph-paper-plane-tilt-duotone class="bird-share-cta-icon" />
        <span>{{ sharing ? 'Creating card…' : 'Share Bird Card' }}</span>
        <div i-ph-arrow-right class="bird-share-cta-arrow" />
      </button>

      <p class="detail-callout">
        {{ currentBird.identification }}
      </p>

      <span class="bird-version-badge">v{{ currentBird.version ?? '2025.01' }}</span>

      <div class="intro-meta">
        <div class="detail-meta-item">
          <span class="detail-meta-label">Colors</span>
          <span class="detail-meta-value">{{ currentBird.colors }}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Size</span>
          <span class="size-display" :style="{ '--accent': groupColor(currentBird.commonGroup).text }">
            <span class="size-display-category">{{ currentBird.size }}</span>
            <span v-if="sizeDetail" class="size-display-detail"> · {{ sizeDetail }}</span>
          </span>
        </div>
        <div v-if="weightDisplay" class="detail-meta-item">
          <span class="detail-meta-label">Weight</span>
          <span class="detail-meta-value">{{ weightDisplay }}</span>
        </div>
        <div v-if="wingspanDisplay" class="detail-meta-item">
          <span class="detail-meta-label">Wingspan</span>
          <span class="detail-meta-value">{{ wingspanDisplay }}</span>
        </div>
      </div>
    </div>

    <div class="bird-detail-panel">
      <p class="panel-title">
        <span i-ph-tree-evergreen class="panel-icon" />
        Habitat & Range
      </p>
      <div class="detail-meta detail-meta--stacked">
        <div class="detail-meta-item">
          <span class="detail-meta-label">Habitat</span>
          <div class="tag-row">
            <span v-for="h in currentBird.habitat" :key="h" class="detail-tag capitalize">{{ h }}</span>
          </div>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Best seen at</span>
          <div v-if="Array.isArray(currentBird.bestSeenAt) && currentBird.bestSeenAt.length" class="tag-row">
            <span v-for="loc in currentBird.bestSeenAt" :key="loc" class="detail-tag">{{ loc }}</span>
          </div>
          <span v-else class="detail-meta-value">{{ currentBird.bestSeenAt }}</span>
        </div>
        <div class="detail-meta-item detail-meta-pair">
          <div>
            <span class="detail-meta-label">Distribution</span>
            <span class="detail-meta-value capitalize">{{ currentBird.distributionRangeSize }}</span>
          </div>
          <div>
            <span class="detail-meta-label">Migration</span>
            <span class="detail-meta-value capitalize">{{ currentBird.migrationStatus }}</span>
          </div>
        </div>
        <div v-if="currentBird.seasonalityInIndia" class="detail-meta-item">
          <span class="detail-meta-label">Seasonality</span>
          <span class="detail-meta-value capitalize">{{ currentBird.seasonalityInIndia }}</span>
        </div>
      </div>
    </div>

    <div v-if="currentBird.diet?.length" class="bird-detail-panel">
      <p class="panel-title">
        <span i-ph-bowl-food class="panel-icon" />
        <span>Diet</span>
      </p>
      <div class="tag-row">
        <span v-for="d in currentBird.diet" :key="d" class="detail-tag capitalize">{{ d }}</span>
      </div>
    </div>

  </div>
  <div v-else class="not-found">
    <div i-ph-binoculars class="not-found-icon" />
    <h1 class="not-found-title">
      Bird not found
    </h1>
    <p class="not-found-text">
      No species matched ID #{{ Number.isInteger(routeBirdId) ? routeBirdId : '???' }}.
    </p>
    <a href="/" class="not-found-link">
      <span i-ph-arrow-left />
      <span>Back to collection</span>
    </a>
  </div>
</template>
