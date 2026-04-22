const RARITY_META: Record<number, { label: string, color: string, bg: string, glow: string }> = {
  1: { label: 'Common', color: '#5a7a5a', bg: 'rgba(90, 122, 90, 0.10)', glow: '' },
  2: { label: 'Uncommon', color: '#4a7a8a', bg: 'rgba(74, 122, 138, 0.10)', glow: '' },
  3: { label: 'Rare', color: '#7a5a9a', bg: 'rgba(122, 90, 154, 0.12)', glow: 'rgba(122, 90, 154, 0.3)' },
  4: { label: 'Very Rare', color: '#b8942a', bg: 'rgba(184, 148, 42, 0.12)', glow: 'rgba(184, 148, 42, 0.35)' },
  5: { label: 'Legendary', color: '#c47030', bg: 'rgba(196, 112, 48, 0.14)', glow: 'rgba(196, 112, 48, 0.4)' },
}

const RARITY_META_DARK: Record<number, { color: string, bg: string }> = {
  1: { color: '#8aaa8a', bg: 'rgba(138, 170, 138, 0.12)' },
  2: { color: '#7ab0c0', bg: 'rgba(122, 176, 192, 0.12)' },
  3: { color: '#b090d0', bg: 'rgba(176, 144, 208, 0.14)' },
  4: { color: '#d4b84a', bg: 'rgba(212, 184, 74, 0.14)' },
  5: { color: '#e09050', bg: 'rgba(224, 144, 80, 0.16)' },
}

export function getRarity(level: number) {
  return RARITY_META[level] || RARITY_META[1]
}

export function getRarityDark(level: number) {
  return RARITY_META_DARK[level] || RARITY_META_DARK[1]
}
