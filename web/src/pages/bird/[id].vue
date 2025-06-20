<script setup lang="ts" generic="T extends any, O extends any">
import type { Bird, SingleBirdResponse } from '~/types/common'
import { baseUrl, useIucnStatus } from '~/composables'

const route = useRoute()
const birdId = Number.parseInt(route.params.id)

const ONLINE_MODE = import.meta.env.VITE_IMG_DELIVERY_MODE === 'online'

const currentBird = ref<Bird | undefined>()
const birdBg = ref<HTMLElement | undefined>()

const { iucnStatusClasses, iucnStatusExplanation } = useIucnStatus(currentBird)

async function getBirdData() {
  try {
    const newBird = (await (
      await fetch(`${baseUrl}/v1.0/birds/${birdId}`)
    ).json()) as SingleBirdResponse
    if (newBird) {
      currentBird.value = newBird.data
      const birdImageUrl = ONLINE_MODE
        ? newBird.data.meta.images[0]?.url
        : `/images/birds/${newBird.data.meta.images[0]?.file}`
      birdBg.value!.style.backgroundImage = `url('${birdImageUrl ?? '/no_image.png'}')`
    }
  } catch (e) {
    console.error(e)
  }
}

getBirdData()
</script>

<template>
  <div
    class="bird-view mx-auto mt-2 flex items-center justify-center container"
  >
    <div
      ref="birdBg"
      class="bird-profile-photo h-full max-w-96 overflow-y-auto rounded-b rounded-t-xl"
    >
      <!-- <img :src="currentBird.imgUrl" class="h-[60vh] min-h-sm w-96 rounded-t-xl object-cover"> -->
      <div
        v-if="currentBird"
        class="mt-[265px] rounded-tl-3xl bg-gray-100 p-4 pb-6 text-start dark:bg-neutral-900"
      >
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-stretch-semi-expanded">
            {{ currentBird.name }}
          </p>
          <span
            :title="iucnStatusExplanation"
            :class="`cursor-help rounded px-2 py-0.5 font-bold font-mono ${iucnStatusClasses}`"
          >
            {{ currentBird.iucnStatus }}
          </span>
        </div>
        <p class="text-xl font-light font-italic font-serif">
          {{ currentBird.scientificName }}
        </p>
        <p class="detail-header">Colors</p>
        <p class="text-sm">
          {{ currentBird.colors }}
        </p>

        <p class="detail-header">Identification</p>
        <p class="text-sm">
          {{ currentBird.identification }}
        </p>

        <p class="detail-header">Habitat</p>
        <p class="text-sm capitalize">
          {{ currentBird.habitat.join(', ') }}
        </p>

        <p class="detail-header">Best seen at</p>
        <p class="text-sm capitalize">
          {{ currentBird.bestSeenAt }}
        </p>

        <div class="mt-3 h-1px w-full border-t" />

        <p class="detail-header">Migration Status</p>
        <p class="text-sm capitalize">
          {{ currentBird.migrationStatus }}
        </p>

        <p class="detail-header">Order</p>
        <p class="text-sm capitalize">
          {{ currentBird.order }}
        </p>

        <p class="detail-header">Family</p>
        <p class="text-sm capitalize">
          {{ currentBird.family }}
        </p>

        <p class="detail-header">Common Group</p>
        <p class="text-sm capitalize">
          {{ currentBird.commonGroup }}
        </p>
      </div>
    </div>
  </div>
</template>

<style>
.bird-view {
  height: calc(100vh - 68px);
}

.bird-profile-photo {
  background-repeat: no-repeat;
  background-size: contain;
  background-position: top;
}

.detail-header {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  line-height: 1.5rem;
  color: var(--accent-color);
  font-stretch: expanded;
}
</style>
