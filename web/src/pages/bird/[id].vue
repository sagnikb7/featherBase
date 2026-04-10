<script setup lang="ts">
import type { Bird, SingleBirdResponse } from '~/types/common'
import { baseUrl, useIucnStatus } from '~/composables'
import BirdImage from '~/components/BirdImage.vue'

const route = useRoute()
const router = useRouter()
const birdId = ref(Number.parseInt(route.params.id as string))

const ONLINE_MODE = import.meta.env.VITE_IMG_DELIVERY_MODE === 'online'

const currentBird = ref<Bird | undefined>()
const imageUrl = ref('')
const loading = ref(true)

const { iucnStatusClasses, iucnStatusExplanation } = useIucnStatus(currentBird)

const hasPrev = computed(() => birdId.value > 1)
const hasNext = computed(() => !!currentBird.value)

async function getBirdData(id: number) {
  loading.value = true
  try {
    const res = (await (
      await fetch(`${baseUrl}/v1.0/birds/${id}`)
    ).json()) as SingleBirdResponse

    if (res?.data?.name) {
      currentBird.value = res.data
      const img = res.data.meta.images[0]
      imageUrl.value = img
        ? (ONLINE_MODE ? img.url : `/images/birds/${img.file}`)
        : ''
    }
    else {
      currentBird.value = undefined
    }
  }
  catch (e) {
    console.error(e)
    currentBird.value = undefined
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

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' && hasPrev.value) navigate(birdId.value - 1)
  if (e.key === 'ArrowRight' && hasNext.value) navigate(birdId.value + 1)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

getBirdData(birdId.value)
</script>

<template>
  <div v-if="currentBird" class="bird-detail">
    <!-- Top-left: Image -->
    <div class="bird-detail-image">
      <BirdImage
        :src="imageUrl"
        :alt="currentBird.name"
        :colors="currentBird.colors"
        class="bird-detail-img-contain"
      />
      <!-- Navigation arrows overlaid on image -->
      <button
        v-if="hasPrev"
        class="bird-nav bird-nav--prev"
        title="Previous bird (←)"
        @click="navigate(birdId - 1)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="hasNext"
        class="bird-nav bird-nav--next"
        title="Next bird (→)"
        @click="navigate(birdId + 1)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Top-right: Intro -->
    <div class="bird-detail-intro">
      <h1 class="bird-name">
        {{ currentBird.name }}
      </h1>
      <div class="bird-subtitle">
        <p class="bird-scientific">{{ currentBird.scientificName }}</p>
        <span
          :title="iucnStatusExplanation"
          :class="`iucn-badge ${iucnStatusClasses}`"
        >
          {{ currentBird.iucnStatus }}
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

    <!-- Bottom-left: Habitat & Range -->
    <div class="bird-detail-panel">
      <p class="panel-title">Habitat & Range</p>
      <div class="detail-meta">
        <div class="detail-meta-item">
          <span class="detail-meta-label">Habitat</span>
          <span class="detail-meta-value capitalize">{{ currentBird.habitat.join(', ') }}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Best seen at</span>
          <span class="detail-meta-value">{{ currentBird.bestSeenAt }}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Distribution</span>
          <span class="detail-meta-value capitalize">{{ currentBird.distributionRangeSize }}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Migration</span>
          <span class="detail-meta-value capitalize">{{ currentBird.migrationStatus }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom-right: Taxonomy & Diet -->
    <div class="bird-detail-panel">
      <p class="panel-title">Taxonomy</p>
      <div class="detail-meta">
        <div class="detail-meta-item">
          <span class="detail-meta-label">Order</span>
          <span class="detail-meta-value">{{ currentBird.order }}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Family</span>
          <span class="detail-meta-value">{{ currentBird.family }}</span>
        </div>
        <div class="detail-meta-item">
          <span class="detail-meta-label">Group</span>
          <span class="detail-meta-value capitalize">{{ currentBird.commonGroup }}</span>
        </div>
        <div v-if="currentBird.diet?.length" class="detail-meta-item">
          <span class="detail-meta-label">Diet</span>
          <span class="detail-meta-value capitalize">{{ currentBird.diet.join(', ') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
