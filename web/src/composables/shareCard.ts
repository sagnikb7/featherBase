import { groupColor } from './groupColor'
import { getRarity } from './rarity'
import type { Bird } from '~/types/common'

const APP_URL = 'featherbase.netlify.app'

const W = 630
const H = 880
const S = 2
const PAD = 28
const FRAME = 0

const WHITE = '#F2F2F2'
const GREY = '#999999'
const GREY_DIM = '#787878'
const DIVIDER_DEFAULT = 'rgba(255, 255, 255, 0.07)'

const IUCN_MAP: Record<string, { color: string, label: string }> = {
  LC: { color: '#5a9a4f', label: 'Least Concern' },
  NT: { color: '#9a8a3a', label: 'Near Threatened' },
  VU: { color: '#d48a2a', label: 'Vulnerable' },
  EN: { color: '#d45a2a', label: 'Endangered' },
  CR: { color: '#b8402f', label: 'Critically Endangered' },
  EW: { color: '#6c4a5a', label: 'Extinct in Wild' },
  EX: { color: '#4a4a4a', label: 'Extinct' },
}

interface Tier {
  accent: string
  base: string
  surface: string
  accentSerial: boolean
  accentDivider: boolean
  accentName: boolean
}

const TIERS: Record<number, Tier> = {
  1: { accent: '#7A8B7A', base: '#0D0D0D', surface: '#141414', accentSerial: false, accentDivider: false, accentName: false },
  2: { accent: '#4ECDC4', base: '#041C1C', surface: '#062828', accentSerial: false, accentDivider: false, accentName: false },
  3: { accent: '#7C5CFC', base: '#100828', surface: '#180F38', accentSerial: true, accentDivider: false, accentName: false },
  4: { accent: '#FFB800', base: '#1C1200', surface: '#261800', accentSerial: true, accentDivider: true, accentName: false },
  5: { accent: '#FF6B35', base: '#1A0400', surface: '#240800', accentSerial: true, accentDivider: true, accentName: true },
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('fail'))
    img.src = src
  })
}

function chip(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, bg: string, fg: string): number {
  ctx.font = '600 14px Manrope, sans-serif'
  const w = ctx.measureText(text).width + 20
  const h = 26
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 13)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.fillStyle = fg
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + 10, y + h / 2)
  return w
}

function ellipsis(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max)
    return text
  let t = text
  while (t.length > 0 && ctx.measureText(`${t}…`).width > max)
    t = t.slice(0, -1)
  return `${t}…`
}

export async function generateCard(bird: Bird, imageUrl: string): Promise<Blob> {
  const rarity = bird.rarity || 1
  const rarityInfo = getRarity(rarity)
  const tier = TIERS[rarity] || TIERS[1]
  const gc = groupColor(bird.commonGroup)

  // Build metadata lines
  const meta: [string, string][] = []
  if (bird.habitat?.length)
    meta.push(['Habitat', bird.habitat.join(', ')])
  if (bird.size)
    meta.push(['Size', `${bird.size}${bird.sizeRange ? ` · ${bird.sizeRange}` : ''}`])
  if (bird.diet?.length)
    meta.push(['Diet', bird.diet.join(', ')])
  if (bird.bestSeenAt)
    meta.push(['Best seen at', bird.bestSeenAt])

  const nameSize = bird.name.length > 20 ? 32 : 40
  const metaLineH = 32

  // Image capped at 55%, info gets the rest
  const imgH = Math.round(H * 0.55)
  const infoY = FRAME + imgH

  const canvas = document.createElement('canvas')
  canvas.width = W * S
  canvas.height = H * S
  const ctx = canvas.getContext('2d')!
  ctx.scale(S, S)

  // ── Fill base (no radius — sharp card) ──
  ctx.fillStyle = tier.base
  ctx.fillRect(0, 0, W, H)

  // ── Info surface ──
  ctx.fillStyle = tier.surface
  ctx.fillRect(0, infoY, W, H - infoY)

  // ── Bottom accent glow ──
  if (rarity >= 2) {
    const glowH = 60 + (rarity - 2) * 20
    const glow = ctx.createLinearGradient(0, H - glowH, 0, H)
    glow.addColorStop(0, 'transparent')
    glow.addColorStop(1, `${tier.accent}${Math.round((0.03 + (rarity - 2) * 0.015) * 255).toString(16).padStart(2, '0')}`)
    ctx.fillStyle = glow
    ctx.fillRect(0, H - glowH, W, glowH)
  }

  // ── Image ──
  const imgX = FRAME
  const imgY = FRAME
  const imgW = W - FRAME * 2
  const imgDrawH = imgH

  ctx.save()
  ctx.beginPath()
  ctx.rect(imgX, imgY, imgW, imgDrawH)
  ctx.clip()
  ctx.fillStyle = '#151515'
  ctx.fillRect(imgX, imgY, imgW, imgDrawH)

  if (imageUrl) {
    for (const url of [imageUrl, `/v1.0/birds/image-proxy?url=${encodeURIComponent(imageUrl)}`]) {
      try {
        const img = await loadImg(url)
        const scale = Math.max(imgW / img.width, imgDrawH / img.height)
        const sw = img.width * scale
        const sh = img.height * scale
        ctx.drawImage(img, imgX + (imgW - sw) / 2, imgY + (imgDrawH - sh) / 2, sw, sh)
        break
      }
      catch { /* next */ }
    }
  }
  else {
    ctx.font = '100px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.fillText('🪶', W / 2, imgY + imgDrawH / 2)
  }

  // Shelf line — hard cut between image and info
  ctx.restore()
  ctx.strokeStyle = `${tier.accent}60`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, infoY + 1)
  ctx.lineTo(W, infoY + 1)
  ctx.stroke()

  // Serial pill — top-left of image
  const serial = `#${String(bird.serialNumber).padStart(3, '0')}`
  ctx.font = '700 18px "DM Mono", monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  const serialW = ctx.measureText(serial).width + 20
  ctx.beginPath()
  ctx.roundRect(imgX + 14, imgY + 14, serialW, 30, 5)
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fill()
  ctx.fillStyle = '#E8E8E8'
  ctx.fillText(serial, imgX + 24, imgY + 14 + 21)

  // ── Info section ──
  const infoX = PAD
  const contentW = W - PAD * 2
  let y = infoY + 10

  // Bird name
  ctx.textAlign = 'left'
  ctx.font = `700 ${nameSize}px Newsreader, Georgia, serif`
  ctx.fillStyle = tier.accentName ? tier.accent : WHITE
  ctx.fillText(ellipsis(ctx, bird.name, contentW), infoX, y + nameSize * 0.8)

  // Scientific name
  y += nameSize + 12
  ctx.font = 'italic 400 18px Newsreader, Georgia, serif'
  ctx.fillStyle = GREY_DIM
  ctx.fillText(bird.scientificName, infoX, y)

  // Chips
  y += 18
  let cx = infoX
  const cBg = gc.bg.replace('0.12', '0.2')
  cx += chip(ctx, cx, y, bird.commonGroup, cBg, gc.text) + 6

  const iucn = IUCN_MAP[bird.iucnStatus]
  if (iucn) {
    const label = `● ${bird.iucnStatus} ${iucn.label}`
    chip(ctx, cx, y, label, `${iucn.color}25`, iucn.color)
  }

  // Divider — y += chip height (26) + gap (14)
  y += 40
  ctx.strokeStyle = tier.accentDivider ? `${tier.accent}40` : DIVIDER_DEFAULT
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(infoX, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()

  // Metadata — two-column: right-aligned label | left-aligned value
  y += 20
  const LABEL_COL = 100
  ctx.textBaseline = 'alphabetic'
  for (const [label, value] of meta) {
    ctx.textAlign = 'right'
    ctx.font = '600 13px Manrope, sans-serif'
    ctx.fillStyle = GREY_DIM
    ctx.fillText(label, infoX + LABEL_COL, y)

    ctx.textAlign = 'left'
    ctx.font = '400 15px Manrope, sans-serif'
    ctx.fillStyle = '#BEBEBE'
    ctx.fillText(ellipsis(ctx, value, contentW - LABEL_COL - 14), infoX + LABEL_COL + 14, y)

    y += metaLineH
  }

  // Rarity label + footer — anchored to bottom
  const rarityText = `★  ${rarityInfo.label.toUpperCase()}`
  ctx.textAlign = 'center'
  ctx.font = '700 14px Manrope, sans-serif'
  ctx.fillStyle = tier.accent
  ctx.letterSpacing = '2px'
  ctx.fillText(rarityText, W / 2, H - 52)
  ctx.letterSpacing = '0px'

  // Footer — label + url on one horizontal line, centered as a unit
  ctx.font = '400 12px Manrope, sans-serif'
  const footerLabelW = ctx.measureText('explore the full collection at').width
  ctx.font = '600 13px Manrope, sans-serif'
  const footerUrlW = ctx.measureText(APP_URL).width
  const footerGap = 8
  const footerX = (W - footerLabelW - footerGap - footerUrlW) / 2

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = '400 12px Manrope, sans-serif'
  ctx.fillStyle = GREY_DIM
  ctx.fillText('explore the full collection at', footerX, H - 20)

  ctx.font = '600 13px Manrope, sans-serif'
  ctx.fillStyle = GREY
  ctx.fillText(APP_URL, footerX + footerLabelW + footerGap, H - 20)

  return new Promise(resolve =>
    canvas.toBlob(blob => resolve(blob!), 'image/png'),
  )
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
