<script setup>
import { computed, ref, watch } from 'vue'
import Fuse from 'fuse.js'
import { baseUrl } from '~/composables'
import BirdCard from '~/components/BirdCard.vue'

const ONLINE_MODE = import.meta.env.VITE_IMG_DELIVERY_MODE === 'online'
const PAGE_SIZE = 20

const searchQuery = ref('')
const selectedGroup = ref('')
const groups = ref([])
const birds = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(null)
const hasNext = ref(false)
const currentPage = ref(1)

const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'scientificName', weight: 0.3 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreDiacritics: true,
  minMatchCharLength: 2,
}

let fuse = null

const isSearching = computed(() => searchQuery.value && searchQuery.value.length >= 2)

const displayBirds = computed(() => {
  if (!isSearching.value || !fuse)
    return birds.value

  return fuse.search(searchQuery.value).map(result => result.item)
})

async function fetchGroups() {
  try {
    const response = await fetch(`${baseUrl}/v1.0/birds/groups`)
    const result = await response.json()
    if (result.success)
      groups.value = result.data
  }
  catch (err) {
    console.error('Error fetching groups:', err)
  }
}

async function fetchBirds(page = 1) {
  const isFirstPage = page === 1
  try {
    if (isFirstPage) loading.value = true
    else loadingMore.value = true

    const params = new URLSearchParams({ page, size: PAGE_SIZE })
    if (selectedGroup.value)
      params.set('group', selectedGroup.value)

    const response = await fetch(`${baseUrl}/v1.0/birds?${params}`)
    const result = await response.json()

    if (result.success) {
      if (isFirstPage) {
        birds.value = result.data
      }
      else {
        birds.value = [...birds.value, ...result.data]
      }
      hasNext.value = result.pagination.hasNext
      currentPage.value = result.pagination.page

      // Rebuild fuse index with all loaded birds
      fuse = new Fuse(birds.value, fuseOptions)
    }
    else {
      throw new Error('Failed to fetch birds data')
    }
  }
  catch (err) {
    error.value = err.message
    console.error('Error fetching birds:', err)
  }
  finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (loadingMore.value || !hasNext.value)
    return
  fetchBirds(currentPage.value + 1)
}

function onGroupChange() {
  birds.value = []
  searchQuery.value = ''
  fetchBirds(1)
}

// Intersection observer for infinite scroll
const sentinel = ref(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isSearching.value) {
        loadMore()
      }
    },
    { rootMargin: '200px' },
  )

  watch(sentinel, (el) => {
    if (el) observer.observe(el)
  }, { immediate: true })

  onUnmounted(() => observer.disconnect())
})

fetchGroups()
fetchBirds()
</script>

<template>
  <div class="search-container">
    <div class="search-row">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search birds by name..."
        :disabled="loading"
      >
      <select
        v-model="selectedGroup"
        :disabled="loading"
        @change="onGroupChange"
      >
        <option value="">
          All Groups
        </option>
        <option v-for="g in groups" :key="g" :value="g">
          {{ g }}
        </option>
      </select>
    </div>
    <div v-if="loading" class="status-box loading">
      Loading birds...
    </div>
    <div v-if="error" class="status-box error">
      {{ error }}
    </div>
    <div
      v-if="!loading && isSearching && displayBirds.length === 0"
      class="status-box no-results"
    >
      No birds found matching "{{ searchQuery }}"
    </div>
    <div v-if="!loading && isSearching" class="search-info">
      {{ displayBirds.length }} result{{ displayBirds.length !== 1 ? 's' : '' }}
    </div>
  </div>

  <div v-if="!loading" class="card-container">
    <BirdCard
      v-for="bird in displayBirds"
      :key="bird.id"
      :bird="bird"
    />
  </div>

  <!-- Infinite scroll sentinel + loader -->
  <div v-if="!loading && !isSearching && hasNext" ref="sentinel" class="scroll-loader">
    <div v-if="loadingMore" class="scroll-loader-dots">
      <span /><span /><span />
    </div>
  </div>
</template>
