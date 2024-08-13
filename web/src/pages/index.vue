<script setup lang="ts" generic="T extends any, O extends any">
import type { Bird, SingleBirdResponse } from '~/types/common'

const TOTAL_BIRDS = 25
const ONLINE_MODE = import.meta.env.VITE_IMG_DELIVERY_MODE === 'online'
// const currentBird = ref<Bird>(
//   {
//     _id: '6671ddb34c14b3a7946a5b26',
//     name: 'Indian Courser',
//     imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Indian_courser_%28Cursorius_coromandelicus%29_Photograph_by_Shantanu_Kuveskar.jpg/440px-Indian_courser_%28Cursorius_coromandelicus%29_Photograph_by_Shantanu_Kuveskar.jpg',
//     scientificName: 'Cursorius coromandelicus',
//     serialNumber: 300,
//     hash: 'cf41475e9fad365be2b7c775e386df8e',
//     iucnStatus: 'LC',
//     habitat: ['dry plains', 'semi-arid regions'],
//     distributionRangeSize: 'large',
//     bestSeenAt: 'Desert National Park, Rajasthan',
//     migrationStatus: 'resident',
//     order: 'Charadriiformes',
//     family: 'Glareolidae',
//     commonGroup: 'coursers',
//     rarity: 3,
//     identification: 'Reddish-brown upperparts, white underparts, black and white head pattern.',
//     colors: 'Reddish-brown, white, black',
//     size: 'medium',
//     sizeRange: '23-25 cm',
//     diet: ['insects'],
//     created_at: '2024-06-18T19:19:15.157Z',
//     updated_at: '2024-06-18T19:19:15.157Z',
//     __v: 0,
//   },
// )
const currentBird = ref<Bird | undefined>()
const birdBg = ref<HTMLElement | undefined>()

async function getRandomBird() {
  const randomIndex = Math.round(Math.random() * TOTAL_BIRDS)
  try {
    const newBird = (await (await fetch(`/v1.0/birds/${randomIndex}`)).json()) as SingleBirdResponse
    if (newBird) {
      currentBird.value = newBird.data
      const birdImageUrl = ONLINE_MODE ? newBird.data.meta.images[0]?.url : `/images/birds/${newBird.data.meta.images[0]?.file}`
      birdBg.value!.style.backgroundImage = `url('${birdImageUrl}')`
    }
  }
  catch (e) {
    console.error(e)
  }
}

getRandomBird()
</script>

<template>
  <div class="bird-view mx-auto mt-2 flex items-center justify-center container">
    <div ref="birdBg" class="bird-profile-photo h-full max-w-96 overflow-y-auto rounded-b rounded-t-xl">
      <!-- <img :src="currentBird.imgUrl" class="h-[60vh] min-h-sm w-96 rounded-t-xl object-cover"> -->
      <div v-if="currentBird" class="mt-[265px] rounded-tl-3xl bg-gray-100 p-4 pb-6 text-start dark:bg-neutral-900">
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold">
            {{ currentBird.name }}
          </p>
          <span
            title="IUCN Status: It is an inventory of the global conservation status and extinction risk of biological species."
            class="cursor-help rounded bg-gray-300 px-2 py-0.5 font-bold font-mono dark-bg-slate-700">
            {{ currentBird.iucnStatus }}
          </span>
        </div>
        <p class="text-xl font-light font-italic">
          {{ currentBird.scientificName }}
        </p>
        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Colors
        </p>
        <p class="text-sm">
          {{ currentBird.colors }}
        </p>

        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Identification
        </p>
        <p class="text-sm">
          {{ currentBird.identification }}
        </p>

        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Habitat
        </p>
        <p class="text-sm capitalize">
          {{ currentBird.habitat.join(', ') }}
        </p>

        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Best seen at
        </p>
        <p class="text-sm capitalize">
          {{ currentBird.bestSeenAt }}
        </p>

        <div class="mt-3 h-1px w-full border-t" />

        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Migration Status
        </p>
        <p class="text-sm capitalize">
          {{ currentBird.migrationStatus }}
        </p>

        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Order
        </p>
        <p class="text-sm capitalize">
          {{ currentBird.order }}
        </p>

        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Family
        </p>
        <p class="text-sm capitalize">
          {{ currentBird.family }}
        </p>

        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          Common Group
        </p>
        <p class="text-sm capitalize">
          {{ currentBird.commonGroup }}
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="css">
.bird-view {
  height: calc(100vh - 68px);
}

.bird-profile-photo {
  background-repeat: no-repeat;
  background-size: contain;
  background-position: top;
}
</style>
