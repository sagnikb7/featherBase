<script setup lang="ts">
import { baseUrl, formatSerial, groupColor, saveBotdSerial } from '~/composables'

const route = useRoute()

interface GroupEntry { title: string, count: number }

function seededRandom(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = seededRandom(seed)
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const PAGE_SIZE = 20

const searchQuery = ref('')
const selectedGroup = ref('')
const groups = ref<GroupEntry[]>([])
const birds = ref<any[]>([])
const searchResults = ref<any[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const searching = ref(false)
const showDropdown = ref(false)
const error = ref<string | null>(null)
const hasNext = ref(false)
const currentPage = ref(1)
const totalCount = ref(0)
const birdOfTheDay = ref<any>(null)
const botdLoading = ref(true)
let botdStarted = false

let searchTimer: ReturnType<typeof setTimeout> | null = null

function isNumericQuery(q: string) {
  return /^\d+$/.test(q)
}
function minSearchLen(q: string) {
  return isNumericQuery(q) ? 1 : 3
}

const isSearchActive = computed(() => searchQuery.value.length >= minSearchLen(searchQuery.value))

const todaySeed = Math.floor(Date.now() / 86400000)

const orderedChips = computed(() =>
  seededShuffle(groups.value, todaySeed).slice(0, 8),
)

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

function selectGroup(group: string) {
  selectedGroup.value = group
  onGroupChange()
}

async function fetchBirdOfTheDay(total: number) {
  const serial = (todaySeed % total) + 1
  try {
    const response = await fetch(`${baseUrl}/v1.0/birds/${serial}`)
    const result = await response.json()
    if (result.success && result.data?.serialNumber) {
      birdOfTheDay.value = result.data
      saveBotdSerial(result.data.serialNumber)
    }
  }
  catch {
    // non-critical
  }
  finally {
    botdLoading.value = false
  }
}

async function fetchBirds(page = 1) {
  const isFirstPage = page === 1
  try {
    if (isFirstPage)
      loading.value = true
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
      totalCount.value = result.pagination.total
      if (isFirstPage) {
        localStorage.setItem('featherbase-bird-total', String(result.pagination.total))
        if (!selectedGroup.value && !botdStarted) {
          botdStarted = true
          fetchBirdOfTheDay(result.pagination.total)
        }
      }
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
  if (query.length < minSearchLen(query)) {
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
  if (searchTimer)
    clearTimeout(searchTimer)

  if (searchQuery.value.length < minSearchLen(searchQuery.value)) {
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
  setTimeout(() => {
    showDropdown.value = false
  }, 150)
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
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting)
        loadMore()
    },
    { rootMargin: '200px' },
  )

  // Pre-select group from query param (e.g. navigating from detail page group pill)
  const groupFromQuery = route.query.group as string | undefined
  if (groupFromQuery)
    selectedGroup.value = groupFromQuery

  fetchGroups()

  const cachedTotal = localStorage.getItem('featherbase-bird-total')
  if (cachedTotal && !selectedGroup.value) {
    botdStarted = true
    fetchBirdOfTheDay(Number(cachedTotal))
  }

  fetchBirds()

  watch(sentinel, (el, previousEl) => {
    if (previousEl)
      observer?.unobserve(previousEl)
    if (el)
      observer?.observe(el)
  }, { immediate: true })
})

onUnmounted(() => {
  if (searchTimer)
    clearTimeout(searchTimer)
  observer?.disconnect()
})
</script>

<template>
  <div class="home-page">
    <header class="page-hero">
      <h1 class="page-hero-title">
        <span class="page-hero-feather">feather</span><span class="page-hero-base">Base</span>
      </h1>
      <p class="page-hero-tagline">
        Birds of the Indian Subcontinent
      </p>
    </header>

    <div class="search-container">
      <div class="search-input-wrap">
        <label class="sr-only" for="bird-search">Search birds</label>
        <div i-ph-magnifying-glass class="search-icon" />
        <input
          id="bird-search"
          v-model="searchQuery"
          type="text"
          placeholder="Search birds, species or #serial…"
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
              class="bird-row"
              :style="{ '--row-accent': groupColor(bird.commonGroup).text, '--row-accent-bg': groupColor(bird.commonGroup).bg }"
            >
              <div class="bird-row-info">
                <span class="bird-row-name">{{ bird.name }}</span>
                <span class="bird-row-scientific">
                  <span class="bird-row-serial">{{ formatSerial(bird.serialNumber) }}</span>
                  · {{ bird.scientificName }}
                </span>
                <span
                  v-if="bird.commonGroup"
                  class="bird-row-group bird-row-group--mobile capitalize"
                  :style="{ background: groupColor(bird.commonGroup).bg, color: groupColor(bird.commonGroup).text }"
                >{{ bird.commonGroup }}</span>
              </div>
              <span
                v-if="bird.commonGroup"
                class="bird-row-group capitalize"
                :style="{ background: groupColor(bird.commonGroup).bg, color: groupColor(bird.commonGroup).text }"
              >{{ bird.commonGroup }}</span>
              <div i-ph-caret-right class="bird-row-arrow" />
            </a>
          </template>
          <div v-else class="search-dropdown-status">
            No birds found for "{{ searchQuery }}"
          </div>
        </div>
      </div>

      <div v-if="groups.length" class="group-chips">
        <button
          class="group-chip"
          :class="{ active: selectedGroup === '' }"
          @click="selectGroup('')"
        >
          All
        </button>
        <button
          v-for="chip in orderedChips"
          :key="chip.title"
          class="group-chip capitalize"
          :class="{ active: selectedGroup === chip.title }"
          :style="selectedGroup === chip.title
            ? { background: groupColor(chip.title).bg, color: groupColor(chip.title).text, borderColor: `${groupColor(chip.title).text}33` }
            : {}"
          @click="selectGroup(chip.title)"
        >
          {{ chip.title }}
          <span class="chip-count">{{ chip.count }}</span>
        </button>
      </div>
      <div v-if="loading" class="loader" role="status">
        <div class="loader-dots">
          <span /><span /><span />
        </div>
      </div>
      <div v-if="error" class="status-box error" role="alert">
        {{ error }}
      </div>
    </div>

    <div v-if="botdLoading && !selectedGroup" class="botd-skeleton" aria-hidden="true">
      <div class="botd-skeleton-eyebrow" />
      <div class="botd-skeleton-name" />
      <div class="botd-skeleton-scientific" />
      <div class="botd-skeleton-footer">
        <div class="botd-skeleton-meta" />
        <div class="botd-skeleton-cta" />
      </div>
    </div>

    <a
      v-if="birdOfTheDay && !selectedGroup"
      :href="`/bird/${birdOfTheDay.serialNumber}`"
      class="botd-card"
      :style="{ '--botd-accent': groupColor(birdOfTheDay.commonGroup)?.text ?? 'var(--color-accent)' }"
    >
      <p class="botd-eyebrow">
        Bird of the Day
      </p>
      <p class="botd-name">
        {{ birdOfTheDay.name }}
      </p>
      <p class="botd-scientific">
        {{ birdOfTheDay.scientificName }}
      </p>
      <div class="botd-footer">
        <div class="botd-meta">
          <span class="botd-serial">{{ formatSerial(birdOfTheDay.serialNumber) }}</span>
          <span
            v-if="birdOfTheDay.commonGroup"
            class="bird-row-group capitalize"
            :style="{ background: groupColor(birdOfTheDay.commonGroup).bg, color: groupColor(birdOfTheDay.commonGroup).text }"
          >{{ birdOfTheDay.commonGroup }}</span>
        </div>
        <span class="botd-cta">
          Explore <div i-ph-arrow-right />
        </span>
      </div>
    </a>

    <div v-if="!loading" class="index-header">
      <span class="index-header-label">
        <span i-ph-list-dashes class="index-header-icon" />
        {{ selectedGroup ? selectedGroup : 'Field Index' }}
      </span>
      <span class="index-header-count">{{ totalCount }} species</span>
    </div>

    <div v-if="!loading" class="bird-list">
      <a
        v-for="bird in birds"
        :key="bird.id"
        :href="`/bird/${bird.id}`"
        class="bird-row"
        :style="{ '--row-accent': groupColor(bird.commonGroup).text, '--row-accent-bg': groupColor(bird.commonGroup).bg }"
      >
        <div class="bird-row-info">
          <span class="bird-row-name">{{ bird.name }}</span>
          <span class="bird-row-scientific">
            <span class="bird-row-serial">{{ formatSerial(bird.serialNumber) }}</span>
            · {{ bird.scientificName }}
          </span>
          <span
            v-if="bird.commonGroup"
            class="bird-row-group bird-row-group--mobile capitalize"
            :style="{ background: groupColor(bird.commonGroup).bg, color: groupColor(bird.commonGroup).text }"
          >{{ bird.commonGroup }}</span>
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
  </div>
</template>
