<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { baseUrl } from '~/composables'
import BirdCard from '~/components/BirdCard.vue'

const searchQuery = ref('')
const birds = ref([])
const loading = ref(true)
const error = ref(null)

// Fuse.js configuration
const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'scientificName', weight: 0.3 },
  ],
  threshold: 0.4, // Lower threshold means more strict matching
  includeScore: true,
  ignoreDiacritics: true,
  minMatchCharLength: 2,
}

// Create Fuse instance (will be updated when data loads)
let fuse = null

const filteredBirds = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2 || !fuse) {
    return birds.value
  }

  const results = fuse.search(searchQuery.value)
  return results.map(result => result.item)
})

async function fetchBirds() {
  try {
    loading.value = true
    const response = await fetch(`${baseUrl}/v1.0/birds`)
    const result = await response.json()

    if (result.success) {
      birds.value = result.data
      // Create new Fuse instance with the fetched data
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
  }
}

fetchBirds()
</script>

<template>
  <div class="search-container">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search for birds..."
      :disabled="loading"
    >
    <div v-if="loading" class="loading">
      Loading birds...
    </div>
    <div v-if="error" class="error">
      Error: {{ error }}
    </div>
    <div
      v-if="!loading && searchQuery && filteredBirds.length === 0"
      class="no-results"
    >
      No birds found matching "{{ searchQuery }}"
    </div>
    <div v-if="!loading && searchQuery" class="search-info">
      Found {{ filteredBirds.length }} bird{{
        filteredBirds.length !== 1 ? 's' : ''
      }}
    </div>
  </div>
  <div v-if="!loading" class="card-container">
    <BirdCard
      v-for="bird in filteredBirds"
      :key="bird.id"
      :bird="bird"
    />
  </div>
</template>

<style>
.search-container {
  margin: 20px;
  text-align: center;
}

input[type='text'] {
  width: 100%;
  max-width: 600px;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--input-bg-color);
  color: var(--text-color);
  transition:
    background-color 0.3s,
    color 0.3s,
    border-color 0.3s;
  outline: none;
}

input[type='text']:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-light);
}

input[type='text']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--accent-light);
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  color: #004d80;
  font-size: 14px;
}

.error {
  margin-top: 16px;
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
}

.no-results {
  margin-top: 16px;
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
}

.search-info {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
  gap: 20px;
  padding: 0 20px;
}

.dark .search-container input[type='text'] {
  background-color: var(--input-bg-color);
  color: var(--text-color);
  border-color: var(--border-color);
}

.dark .search-container input[type='text']:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.dark .search-info {
  color: #ccc;
}

.dark .no-results {
  background-color: #2d1b1b;
  border-color: #dc2626;
  color: #ff6b6b;
}

.dark .loading {
  background-color: rgba(175, 224, 219, 0.1);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.dark .error {
  background-color: #2d1b1b;
  border-color: #dc2626;
  color: #ff6b6b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-container {
    gap: 16px;
    padding: 0 16px;
  }

  .search-container {
    margin: 16px;
  }

  input[type='text'] {
    padding: 14px 16px;
    font-size: 16px;
  }
  }
</style>
