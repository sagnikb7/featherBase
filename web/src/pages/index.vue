<script setup>
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { baseUrl } from '~/composables'

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
    } else {
      throw new Error('Failed to fetch birds data')
    }
  } catch (err) {
    error.value = err.message
    console.error('Error fetching birds:', err)
  } finally {
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
    />
    <div v-if="loading" class="loading">Loading birds...</div>
    <div v-if="error" class="error">Error: {{ error }}</div>
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
  <div class="card-container" v-if="!loading">
    <a
      v-for="bird in filteredBirds"
      :key="bird.id"
      :href="`/bird/${bird.id}`"
      class="bird-card"
    >
      <div class="bird-image">
        <img
          :src="bird.image?.url"
          :alt="bird.name"
          loading="lazy"
          @error="$event.target.style.display = 'none'"
        />
      </div>
      <div class="bird-card-content">
        <h3 class="bird-name">{{ bird.name }}</h3>
        <p class="scientific-name">{{ bird.scientificName }}</p>
        <div class="card-arrow">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  </div>
</template>

<style>
:root {
  --bg-color: #f9f9f9;
  --text-color: #333;
  --input-bg-color: #f7f7f7;
  --border-color: #ddd;
  --accent-color: #007acc;
}

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
  box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
}

input[type='text']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  margin-top: 16px;
  padding: 12px;
  background-color: #e0f2fe;
  border: 1px solid #81d4fa;
  border-radius: 6px;
  color: #0277bd;
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

.bird-card {
  display: block;
  text-decoration: none;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0;
  width: 320px;
  height: 335px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  background-color: var(--bg-color);
  color: var(--text-color);
  overflow: hidden;
  position: relative;
}

.bird-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border-color: var(--accent-color);
}

.bird-card:active {
  transform: translateY(-2px);
}

.bird-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background-color: #f5f5f5;
  position: relative;
}

.bird-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.bird-card:hover .bird-image img {
  transform: scale(1.05);
}

.bird-card-content {
  padding: 20px;
  position: relative;
  height: calc(100% - 240px);
  display: flex;
  flex-direction: column;
  text-align: left;
}

.bird-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
  line-height: 1.3;
  letter-spacing: -0.01em;
  text-align: left;
}

.scientific-name {
  margin: 0;
  font-style: italic;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  flex-grow: 1;
  text-align: left;
}

.card-arrow {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  color: #999;
  transition:
    color 0.3s ease,
    background-color 0.3s ease,
    transform 0.3s ease;
}

.card-arrow svg {
  width: 20px;
  height: 20px;
}

.bird-card:hover .card-arrow {
  color: var(--accent-color);
  background-color: rgba(0, 122, 204, 0.1);
  transform: translateX(2px);
}

.dark {
  --bg-color: #1a1a1a;
  --text-color: #f9f9f9;
  --input-bg-color: #2d2d2d;
  --border-color: #404040;
  --accent-color: #4da6ff;
}

.dark .search-container input[type='text'] {
  background-color: var(--input-bg-color);
  color: var(--text-color);
  border-color: var(--border-color);
}

.dark .search-container input[type='text']:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(77, 166, 255, 0.1);
}

.dark .bird-card {
  background-color: var(--bg-color);
  color: var(--text-color);
  border-color: var(--border-color);
}

.dark .bird-card:hover {
  border-color: var(--accent-color);
}

.dark .scientific-name {
  color: #aaa;
}

.dark .card-arrow {
  color: #666;
}

.dark .bird-card:hover .card-arrow {
  color: var(--accent-color);
  background-color: rgba(77, 166, 255, 0.1);
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
  background-color: #1a2332;
  border-color: #0277bd;
  color: #4fc3f7;
}

.dark .error {
  background-color: #2d1b1b;
  border-color: #dc2626;
  color: #ff6b6b;
}

.dark .bird-image {
  background-color: #2d2d2d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-container {
    gap: 16px;
    padding: 0 16px;
  }

  .bird-card {
    width: 100%;
    max-width: 300px;
    height: 335px;
  }

  .search-container {
    margin: 16px;
  }

  input[type='text'] {
    padding: 14px 16px;
    font-size: 16px;
  }

  .card-arrow {
    width: 36px;
    height: 36px;
    top: 16px;
    right: 16px;
  }

  .card-arrow svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .bird-card {
    max-width: 380px;
  }

  .bird-image {
    height: 220px;
  }

  .bird-card-content {
    padding: 16px;
    height: calc(100% - 220px);
  }

  .bird-name {
    font-size: 16px;
  }

  .scientific-name {
    font-size: 13px;
  }

  .card-arrow {
    width: 32px;
    height: 32px;
    top: 12px;
    right: 12px;
  }

  .card-arrow svg {
    width: 16px;
    height: 16px;
  }
}
</style>
