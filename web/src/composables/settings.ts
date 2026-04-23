export type Theme = 'light' | 'dark' | 'auto' | 'midnight'

interface Settings {
  theme: Theme
  midnightUnlocked: boolean
}

const STORAGE_KEY = 'featherbase-settings'
const VALID_THEMES: Theme[] = ['light', 'dark', 'auto', 'midnight']

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        theme: VALID_THEMES.includes(parsed.theme) ? (parsed.theme as Theme) : 'auto',
        midnightUnlocked: Boolean(parsed.midnightUnlocked),
      }
    }
  }
  catch {}
  return { theme: 'dark', midnightUnlocked: false }
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export const settings = reactive<Settings>(loadSettings())

const systemDark = ref(
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
)

window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  systemDark.value = e.matches
})

export const isDark = computed(() => {
  if (settings.theme === 'dark' || settings.theme === 'midnight')
    return true
  if (settings.theme === 'light')
    return false
  return systemDark.value
})

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
  document.documentElement.classList.toggle('midnight', settings.theme === 'midnight')
}

watch(() => [isDark.value, settings.theme] as const, applyTheme, { immediate: true })

export function setTheme(theme: Theme) {
  settings.theme = theme
  saveSettings(settings)
}

export function unlockMidnight() {
  settings.midnightUnlocked = true
  if (settings.theme !== 'midnight')
    settings.theme = 'midnight'
  saveSettings(settings)
}
