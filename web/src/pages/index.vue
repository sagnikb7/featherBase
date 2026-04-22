<script setup lang="ts">
import { baseUrl, groupColor } from '~/composables'

const PAGE_SIZE = 20

const searchQuery = ref('')
const selectedGroup = ref('')
const groups = ref<string[]>([])
const birds = ref<any[]>([])
const searchResults = ref<any[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const searching = ref(false)
const showDropdown = ref(false)
const error = ref<string | null>(null)
const hasNext = ref(false)
const currentPage = ref(1)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const isSearchActive = computed(() => searchQuery.value.length >= 3)

async function fetchGroups() {
  try {
    const response = await fetch(`${baseUrl}/v1.0/birds/groups`)
    const result = await response.json()
    if (result.success)
      groups.value = result.data
  }
  catch {
    // groups are non-critical
  }
}

async function fetchBirds(page = 1) {
  const isFirstPage = page === 1
  try {
    if (isFirstPage) loading.value = true
    else loadingMore.value = true
    error.value = null

    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) })
    if (selectedGroup.value)
      params.set('group', selectedGroup.value)

    const response = await fetch(`${baseUrl}/v1.0/birds?${params}`)
    const result = await response.json()

    if (result.success) {
      birds.value = isFirstPage ? result.data : [...birds.value, ...result.data]
      hasNext.value = result.pagination.hasNext
      currentPage.value = result.pagination.page
    }
    else {
      throw new Error('Failed to fetch birds data')
    }
  }
  catch (err: any) {
    error.value = err.message
  }
  finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function searchBirds(query: string) {
  if (query.length < 3) {
    searchResults.value = []
    showDropdown.value = false
    return
  }

  searching.value = true
  try {
    const params = new URLSearchParams({ search: query, size: '8' })
    if (selectedGroup.value)
      params.set('group', selectedGroup.value)

    const response = await fetch(`${baseUrl}/v1.0/birds?${params}`)
    const result = await response.json()

    if (result.success) {
      searchResults.value = result.data
      showDropdown.value = true
    }
  }
  catch {
    searchResults.value = []
  }
  finally {
    searching.value = false
  }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    showDropdown.value = false
    return
  }
  searchTimer = setTimeout(() => searchBirds(searchQuery.value), 300)
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
  showDropdown.value = false
}

function dismissDropdown() {
  setTimeout(() => { showDropdown.value = false }, 150)
}

function onGroupChange() {
  birds.value = []
  clearSearch()
  fetchBirds(1)
}

function loadMore() {
  if (loadingMore.value || !hasNext.value)
    return
  fetchBirds(currentPage.value + 1)
}

const sentinel = ref<HTMLElement | null>(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting)
        loadMore()
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
      <div class="search-input-wrap">
        <label class="sr-only" for="bird-search">Search birds</label>
        <div i-ph-magnifying-glass class="search-icon" />
        <input
          id="bird-search"
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or scientific name..."
          autocomplete="off"
          :disabled="loading"
          @input="onSearchInput"
          @focus="isSearchActive && searchResults.length && (showDropdown = true)"
          @blur="dismissDropdown"
        >
        <button
          v-if="searchQuery"
          class="search-clear"
          aria-label="Clear search"
          @mousedown.prevent="clearSearch"
        >
          <div i-ph-x />
        </button>

        <div v-if="showDropdown" class="search-dropdown">
          <div v-if="searching" class="search-dropdown-status">
            Searching...
          </div>
          <template v-else-if="searchResults.length">
            <a
              v-for="bird in searchResults"
              :key="bird.id"
              :href="`/bird/${bird.id}`"
              class="search-result"
            >
              <span class="search-result-serial">#{{ String(bird.serialNumber).padStart(3, '0') }}</span>
              <div class="search-result-info">
                <span class="search-result-name">{{ bird.name }}</span>
                <span class="search-result-scientific">{{ bird.scientificName }}</span>
              </div>
              <span
                v-if="bird.commonGroup"
                class="search-result-group capitalize"
                :style="{ background: groupColor(bird.commonGroup).bg, color: groupColor(bird.commonGroup).text }"
              >{{ bird.commonGroup }}</span>
            </a>
          </template>
          <div v-else class="search-dropdown-status">
            No birds found for "{{ searchQuery }}"
          </div>
        </div>
      </div>

      <label class="sr-only" for="group-filter">Filter by group</label>
      <select
        id="group-filter"
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
    <div v-if="loading" class="loader" role="status">
      <img src="/favicon.svg" alt="" class="loader-feather" />
      <span class="loader-text">Loading birds</span>
    </div>
    <div v-if="error" class="status-box error" role="alert">
      {{ error }}
    </div>
  </div>

  <div v-if="!loading" class="bird-list">
    <a
      v-for="bird in birds"
      :key="bird.id"
      :href="`/bird/${bird.id}`"
      class="bird-row"
    >
      <span class="bird-row-serial">#{{ String(bird.serialNumber).padStart(3, '0') }}</span>
      <div class="bird-row-info">
        <span class="bird-row-name">{{ bird.name }}</span>
        <span class="bird-row-scientific">{{ bird.scientificName }}</span>
      </div>
      <span
        v-if="bird.commonGroup"
        class="bird-row-group capitalize"
        :style="{ background: groupColor(bird.commonGroup).bg, color: groupColor(bird.commonGroup).text }"
      >{{ bird.commonGroup }}</span>
      <div i-ph-caret-right class="bird-row-arrow" />
    </a>
  </div>

  <div v-if="!loading && hasNext" ref="sentinel" class="scroll-loader">
    <div v-if="loadingMore" class="scroll-loader-dots">
      <span /><span /><span />
    </div>
  </div>
</template>
