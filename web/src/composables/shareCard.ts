import type { Bird } from '~/types/common'
import { groupColor } from './groupColor'
import { getRarity } from './rarity'

const APP_URL = 'featherbase.netlify.app'
const CARD_W = 720
const CARD_H = 1280

const IUCN_COLORS: Record<string, string> = {
  LC: '#4a7c3f', NT: '#8a7a2a', VU: '#c47a1a',
  EN: '#c4501a', CR: '#a63d2f', EW: '#5c3a4a', EX: '#2c2c2c',
}

const IUCN_LABELS: Record<string, string> = {
  LC: 'Least Concern', NT: 'Near Threatened', VU: 'Vulnerable',
  EN: 'Endangered', CR: 'Critically Endangered', EW: 'Extinct in Wild', EX: 'Extinct',
}

const RARITY_ACCENTS: Record<number, { border: string; glow: string }> = {
  1: { border: '#8aaa8a', glow: '' },
  2: { border: '#6aaaba', glow: '' },
  3: { border: '#9a7abe', glow: 'rgba(154, 122, 190, 0.25)' },
  4: { border: '#d4b44a', glow: 'rgba(212, 180, 74, 0.3)' },
  5: { border: '#e09050', glow: 'rgba(224, 144, 80, 0.35)' },
}

interface Theme {
  bg: string
  bg2: string
  surface: string
  text: string
  textMuted: string
  textFaint: string
  divider: string
}

const LIGHT: Theme = {
  bg: '#fcf9f5',
  bg2: '#f6f3ef',
  surface: '#f0ece6',
  text: '#1c1c19',
  textMuted: '#44544e',
  textFaint: '#6d7a74',
  divider: 'rgba(193, 200, 196, 0.3)',
}

const DARK: Theme = {
  bg: '#0d1512',
  bg2: '#141e1a',
  surface: '#1a2824',
  text: '#e1e3de',
  textMuted: '#8a9b94',
  textFaint: '#5e6f68',
  divider: 'rgba(134, 212, 190, 0.1)',
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

function drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  ctx.globalAlpha = alpha
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1)
  }
  ctx.globalAlpha = 1
}

function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, bg: string, fg: string, font = '600 14px sans-serif'): number {
  ctx.font = font
  const w = ctx.measureText(text).width + 18
  roundRect(ctx, x, y, w, 26, 13)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.fillStyle = fg
  ctx.fillText(text, x + 9, y + 17)
  return w
}

export async function generateCard(bird: Bird, imageUrl: string): Promise<Blob> {
  const isDark = document.documentElement.classList.contains('dark')
  const t = isDark ? DARK : LIGHT
  const rarity = bird.rarity || 1
  const rarityInfo = getRarity(rarity)
  const accent = RARITY_ACCENTS[rarity] || RARITY_ACCENTS[1]

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')!

  // Card background
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 32)
  ctx.fillStyle = t.bg
  ctx.fill()
  ctx.clip()

  drawGrain(ctx, CARD_W, CARD_H, isDark ? 0.02 : 0.015)

  // Rarity border
  const bp = 8
  roundRect(ctx, bp, bp, CARD_W - bp * 2, CARD_H - bp * 2, 26)
  ctx.strokeStyle = accent.border
  ctx.lineWidth = rarity >= 4 ? 3 : rarity >= 3 ? 2.5 : 1.5
  ctx.stroke()

  if (accent.glow) {
    ctx.shadowColor = accent.glow
    ctx.shadowBlur = 20
    ctx.stroke()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }

  // Layout constants
  const pad = 36
  const imgY = pad
  const imgW = CARD_W - pad * 2
  const imgH = 500
  const infoX = pad + 8
  const contentW = CARD_W - pad * 2 - 16

  // Image area
  ctx.save()
  roundRect(ctx, pad, imgY, imgW, imgH, 18)
  ctx.clip()
  ctx.fillStyle = t.surface
  ctx.fillRect(pad, imgY, imgW, imgH)

  let hasImage = false
  if (imageUrl) {
    try {
      const proxyUrl = `/v1.0/birds/image-proxy?url=${encodeURIComponent(imageUrl)}`
      const img = await loadImage(proxyUrl)
      const scale = Math.max(imgW / img.width, imgH / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, pad + (imgW - sw) / 2, imgY + (imgH - sh) / 2, sw, sh)
      hasImage = true
    }
    catch {
      try {
        const img = await loadImage(imageUrl)
        const scale = Math.max(imgW / img.width, imgH / img.height)
        const sw = img.width * scale
        const sh = img.height * scale
        ctx.drawImage(img, pad + (imgW - sw) / 2, imgY + (imgH - sh) / 2, sw, sh)
        hasImage = true
      }
      catch { /* both failed */ }
    }
  }

  if (!hasImage) {
    ctx.fillStyle = isDark ? 'rgba(134, 212, 190, 0.06)' : 'rgba(2, 36, 29, 0.04)'
    ctx.font = '140px serif'
    ctx.textAlign = 'center'
    ctx.fillText('🪶', CARD_W / 2, imgY + imgH / 2 + 50)
  }
  ctx.restore()

  // Overlays on image
  const serial = `#${String(bird.serialNumber).padStart(3, '0')}`
  ctx.font = '700 14px monospace'
  const serialW = ctx.measureText(serial).width + 16
  const pillBg = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.82)'
  roundRect(ctx, pad + 12, imgY + 12, serialW, 28, 14)
  ctx.fillStyle = pillBg
  ctx.fill()
  ctx.fillStyle = t.textMuted
  ctx.textAlign = 'left'
  ctx.fillText(serial, pad + 20, imgY + 31)

  const badgeText = `★ ${rarityInfo.label}`
  ctx.font = 'bold 14px sans-serif'
  const badgeW = ctx.measureText(badgeText).width + 18
  roundRect(ctx, CARD_W - pad - badgeW - 12, imgY + 12, badgeW, 28, 14)
  ctx.fillStyle = pillBg
  ctx.fill()
  ctx.fillStyle = accent.border
  ctx.fillText(badgeText, CARD_W - pad - badgeW - 3, imgY + 31)

  // ── Info section ──
  let y = imgY + imgH + 48

  // Bird name
  ctx.textAlign = 'left'
  ctx.font = '500 42px Georgia, serif'
  ctx.fillStyle = t.text
  if (ctx.measureText(bird.name).width > contentW) ctx.font = '500 34px Georgia, serif'
  ctx.fillText(bird.name, infoX, y, contentW)

  // Scientific name
  y += 34
  ctx.font = 'italic 300 18px Georgia, serif'
  ctx.fillStyle = t.textFaint
  ctx.fillText(bird.scientificName, infoX, y)

  // Tags row
  y += 44
  const gc = groupColor(bird.commonGroup)
  let chipX = infoX
  chipX += drawChip(ctx, chipX, y - 13, bird.commonGroup, gc.bg.replace('0.12', isDark ? '0.25' : '0.18'), gc.text) + 8

  if (bird.iucnStatus && IUCN_COLORS[bird.iucnStatus]) {
    const ic = IUCN_COLORS[bird.iucnStatus]
    const iLabel = `● ${bird.iucnStatus} ${IUCN_LABELS[bird.iucnStatus]}`
    chipX += drawChip(ctx, chipX, y - 13, iLabel, `${ic}20`, ic) + 8
  }

  // Divider
  y += 40
  ctx.strokeStyle = t.divider
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(infoX, y)
  ctx.lineTo(CARD_W - pad - 8, y)
  ctx.stroke()

  // Metadata — 2-column grid
  y += 36
  const metaFields: [string, string][] = []
  if (bird.habitat?.length) metaFields.push(['HABITAT', bird.habitat.join(', ')])
  if (bird.size) metaFields.push(['SIZE', `${bird.size}${bird.sizeRange ? ` · ${bird.sizeRange}` : ''}`])
  if (bird.colors) metaFields.push(['COLORS', bird.colors])
  if (bird.diet?.length) metaFields.push(['DIET', bird.diet.join(', ')])

  const colW = (contentW - 24) / 2
  for (let i = 0; i < metaFields.length; i++) {
    const [label, value] = metaFields[i]
    const col = i % 2
    const row = Math.floor(i / 2)
    const mx = infoX + col * (colW + 24)
    const my = y + row * 56

    ctx.font = '700 10px sans-serif'
    ctx.fillStyle = t.textFaint
    ctx.fillText(label, mx, my)

    ctx.font = '400 14px sans-serif'
    ctx.fillStyle = t.textMuted
    ctx.fillText(truncateText(ctx, value, colW), mx, my + 20)
  }

  // Footer
  ctx.font = '400 15px sans-serif'
  ctx.fillStyle = t.textFaint
  ctx.textAlign = 'center'
  ctx.globalAlpha = 0.5
  ctx.fillText(APP_URL, CARD_W / 2, CARD_H - 36)
  ctx.globalAlpha = 1

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 0 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1)
  return `${t}…`
}

export async function shareBirdCard(bird: Bird, imageUrl: string) {
  const blob = await generateCard(bird, imageUrl)
  const file = new File([blob], `featherbase-${bird.serialNumber}.png`, { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `${bird.name} — FeatherBase`,
      text: `Check out ${bird.name} (#${String(bird.serialNumber).padStart(3, '0')}) on FeatherBase`,
      url: `https://${APP_URL}/bird/${bird.serialNumber}`,
      files: [file],
    })
  }
  else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }
}
