<script setup>
import BirdImage from '~/components/BirdImage.vue'

const ONLINE_MODE = import.meta.env.VITE_IMG_DELIVERY_MODE === 'online'

const props = defineProps({
  bird: {
    type: Object,
    required: true,
  },
})

const imageSrc = computed(() => {
  const img = props.bird.image
  if (!img) return ''
  return ONLINE_MODE ? img.url : `/images/birds/${img.file}`
})
</script>

<template>
  <a :href="`/bird/${bird.id}`" class="bird-card">
    <div class="bird-image">
      <BirdImage
        :src="imageSrc"
        :alt="bird.name"
        :colors="bird.colors || ''"
      />
    </div>
    <div class="bird-card-content">
      <h3 class="bird-card-name truncate">
        {{ bird.name }}
      </h3>
      <div class="bird-card-footer">
        <p class="scientific-name truncate">{{ bird.scientificName }}</p>
      </div>
    </div>
  </a>
</template>
