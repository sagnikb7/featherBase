const PALETTE = [
  { bg: 'rgba(74, 124, 63, 0.12)', text: '#3d6834' },
  { bg: 'rgba(58, 100, 140, 0.12)', text: '#2e5a7a' },
  { bg: 'rgba(180, 120, 50, 0.12)', text: '#8a5a20' },
  { bg: 'rgba(140, 70, 70, 0.12)', text: '#7a3a3a' },
  { bg: 'rgba(100, 80, 140, 0.12)', text: '#5a4080' },
  { bg: 'rgba(60, 120, 120, 0.12)', text: '#2a6a6a' },
  { bg: 'rgba(160, 100, 60, 0.12)', text: '#8a5030' },
  { bg: 'rgba(120, 100, 60, 0.12)', text: '#6a5a28' },
  { bg: 'rgba(90, 90, 130, 0.12)', text: '#4a4a7a' },
  { bg: 'rgba(130, 80, 100, 0.12)', text: '#7a4060' },
]

export function groupColor(group: string) {
  let hash = 0
  for (const ch of group) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
