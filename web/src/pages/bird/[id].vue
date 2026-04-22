<script setup lang="ts">
import type { Bird, Image, SingleBirdResponse } from '~/types/common'
import { baseUrl, getRarity, groupColor, shareBirdCard, useIucnStatus } from '~/composables'
import BirdImage from '~/components/BirdImage.vue'

const route = useRoute()
const router = useRouter()
const birdId = ref(Number.parseInt(route.params.id as string))

const ONLINE_MODE = import.meta.env.VITE_IMG_DELIVERY_MODE !== 'offline'

const currentBird = ref<Bird | undefined>()
const images = ref<Image[]>([])
const activeImage = ref(0)
const loading = ref(true)

const { iucnStatus, iucnStatusLabel, iucnStatusExplanation, iucnChipClass } = useIucnStatus(currentBird)
const sharing = ref(false)

const currentImageUrl = computed(() => {
  const img = images.value[activeImage.value]
  return img ? imageSrc(img) : ''
})

async function share() {
  if (!currentBird.value || sharing.value) return
  sharing.value = true
  try {
    await shareBirdCard(currentBird.value, currentImageUrl.value)
  }
  finally {
    sharing.value = false
  }
}

const hasPrev = computed(() => birdId.value > 1)
const hasNext = computed(() => !!currentBird.value)

function imageSrc(img: Image) {
  return ONLINE_MODE ? img.url : `/images/birds/${img.file}`
}

function visibleTags(img: Image) {
  return (img.tags || []).filter(t => t.toLowerCase() !== 'default')
}

async function getBirdData(id: number) {
  loading.value = true
  activeImage.value = 0
  try {
    const res = (await (
      await fetch(`${baseUrl}/v1.0/birds/${id}`)
    ).json()) as SingleBirdResponse

    if (res?.data?.name) {
      currentBird.value = res.data
      images.value = res.data.meta?.images || []
    }
    else {
      currentBird.value = undefined
      images.value = []
    }
  }
  catch {
    currentBird.value = undefined
    images.value = []
  }
  finally {
    loading.value = false
  }
}

function navigate(id: number) {
  birdId.value = id
  router.replace(`/bird/${id}`)
  getBirdData(id)
}

function prevImage() {
  if (activeImage.value > 0) activeImage.value--
}

function nextImage() {
  if (activeImage.value < images.value.length - 1) activeImage.value++
}

let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) < 40) return
  if (dx < 0) nextImage()
  else prevImage()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp' && hasPrev.value) navigate(birdId.value - 1)
  if (e.key === 'ArrowDown' && hasNext.value) navigate(birdId.value + 1)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

getBirdData(birdId.value)
</script>

<template>
  <div v-if="loading" class="detail-loader">
    <div class="loader" role="status">
      <img src="/favicon.svg" alt="" class="loader-feather" />
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
      <BirdImage
        v-else
        src=""
        :alt="currentBird.name"
        :colors="currentBird.colors"
        class="bird-detail-img-contain"
      />

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
          #{{ String(currentBird.serialNumber).padStart(3, '0') }}
        </span>
        <div class="bird-nav-actions">
          <button
            class="bird-nav-btn"
            :disabled="sharing"
            aria-label="Share bird card"
            @click="share"
          >
            <div i-ph-share-network />
          </button>
          <button
            class="bird-nav-btn"
            :disabled="!hasNext"
            aria-label="Next bird"
            @click="navigate(birdId + 1)"
          >
            <span>Next</span>
            <div i-ph-caret-right />
          </button>
        </div>
      </div>

      <div class="bird-identity">
        <h1 class="bird-name">
          {{ currentBird.name }}
        </h1>
        <p class="bird-scientific">{{ currentBird.scientificName }}</p>
      </div>

      <div class="bird-badges">
        <span
          class="detail-tag capitalize"
          :style="{ background: groupColor(currentBird.commonGroup).bg, color: groupColor(currentBird.commonGroup).text }"
        >{{ currentBird.commonGroup }}</span>
        <span
          v-if="iucnStatus"
          :title="iucnStatusExplanation"
          :class="['iucn-chip', iucnChipClass]"
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
      </div>

      <p class="detail-callout">
        {{ currentBird.identification }}
      </p>

      <div class="intro-meta">
        <div class="detail-meta-item">
          <span class="detail-meta-label">Colors</span>
          <span class="detail-meta-value">{{ currentBird.colors }}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Size</span>
          <span class="detail-meta-value capitalize">{{ currentBird.size }} · {{ currentBird.sizeRange }}</span>
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
          <span class="detail-meta-value">{{ currentBird.bestSeenAt }}</span>
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
      </div>
    </div>

    <div v-if="currentBird.diet?.length" class="bird-detail-panel">
      <p class="panel-title">
        <span i-ph-bowl-food class="panel-icon" />
        Diet
      </p>
      <div class="tag-row">
        <span v-for="d in currentBird.diet" :key="d" class="detail-tag capitalize">{{ d }}</span>
      </div>
    </div>
  </div>
</template>
