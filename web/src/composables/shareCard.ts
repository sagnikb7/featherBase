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

const RARITY_BORDER: Record<number, { border: string; glow: string; bg2: string }> = {
  1: { border: '#4a6a5a', glow: '', bg2: '#0a3a30' },
  2: { border: '#4a8a9a', glow: '', bg2: '#0a303a' },
  3: { border: '#8a6aaa', glow: 'rgba(138, 106, 170, 0.2)', bg2: '#1a1a3a' },
  4: { border: '#c4a430', glow: 'rgba(196, 164, 48, 0.25)', bg2: '#2a2210' },
  5: { border: '#d48040', glow: 'rgba(212, 128, 64, 0.3)', bg2: '#2a1a10' },
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
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

export async function generateCard(bird: Bird, imageUrl: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')!

  const rarity = bird.rarity || 1
  const rarityInfo = getRarity(rarity)
  const rarityVisual = RARITY_BORDER[rarity] || RARITY_BORDER[1]

  // Background gradient — shifts hue based on rarity
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#02241d')
  bg.addColorStop(1, rarityVisual.bg2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Grain texture
  ctx.globalAlpha = 0.03
  for (let i = 0; i < 8000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    ctx.fillRect(Math.random() * CARD_W, Math.random() * CARD_H, 1, 1)
  }
  ctx.globalAlpha = 1

  // Rarity border frame
  const borderPad = 16
  roundRect(ctx, borderPad, borderPad, CARD_W - borderPad * 2, CARD_H - borderPad * 2, 28)
  ctx.strokeStyle = rarityVisual.border
  ctx.lineWidth = rarity >= 3 ? 3 : 2
  ctx.stroke()

  // Outer glow for rare+ cards
  if (rarityVisual.glow) {
    ctx.shadowColor = rarityVisual.glow
    ctx.shadowBlur = 30
    ctx.stroke()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }

  // Image area
  const imgH = 580
  const imgPad = 48
  const imgW = CARD_W - imgPad * 2
  ctx.save()
  roundRect(ctx, imgPad, imgPad, imgW, imgH, 16)
  ctx.clip()

  let hasImage = false
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl)
      const scale = Math.max(imgW / img.width, imgH / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, imgPad + (imgW - sw) / 2, imgPad + (imgH - sh) / 2, sw, sh)
      hasImage = true
    }
    catch {
      // CORS blocked
    }
  }

  if (!hasImage) {
    const grd = ctx.createLinearGradient(imgPad, imgPad, imgPad + imgW, imgPad + imgH)
    grd.addColorStop(0, '#1a4a3a')
    grd.addColorStop(1, '#0a2a20')
    ctx.fillStyle = grd
    ctx.fillRect(imgPad, imgPad, imgW, imgH)
    ctx.fillStyle = 'rgba(134, 212, 190, 0.15)'
    ctx.font = '120px serif'
    ctx.textAlign = 'center'
    ctx.fillText('🪶', CARD_W / 2, imgPad + imgH / 2 + 40)
  }

  ctx.restore()

  // Rarity badge (top right of image)
  const badgeText = `★ ${rarityInfo.label}`
  ctx.font = '700 16px "Manrope", sans-serif'
  const badgeW = ctx.measureText(badgeText).width + 20
  const badgeX = CARD_W - imgPad - badgeW - 8
  const badgeY = imgPad + 12
  roundRect(ctx, badgeX, badgeY, badgeW, 28, 14)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fill()
  ctx.fillStyle = rarityVisual.border
  ctx.fillText(badgeText, badgeX + 10, badgeY + 19)

  // Serial number
  let y = imgH + imgPad + 52
  const serial = `#${String(bird.serialNumber).padStart(3, '0')}`
  ctx.font = '600 22px "DM Mono", monospace'
  ctx.fillStyle = 'rgba(134, 212, 190, 0.5)'
  ctx.textAlign = 'left'
  ctx.fillText(serial, imgPad + 8, y)

  // Bird name
  y += 52
  ctx.font = '500 46px "Newsreader", Georgia, serif'
  ctx.fillStyle = '#e1e3de'
  const nameText = bird.name
  const maxNameW = CARD_W - imgPad * 2 - 16
  if (ctx.measureText(nameText).width > maxNameW) {
    ctx.font = '500 36px "Newsreader", Georgia, serif'
  }
  ctx.fillText(nameText, imgPad + 8, y, maxNameW)

  // Scientific name
  y += 34
  ctx.font = 'italic 300 20px "Newsreader", Georgia, serif'
  ctx.fillStyle = 'rgba(225, 227, 222, 0.5)'
  ctx.fillText(bird.scientificName, imgPad + 8, y)

  // Tags row: group + IUCN
  y += 48
  const gc = groupColor(bird.commonGroup)
  ctx.font = '600 15px "Manrope", sans-serif'
  const gw = ctx.measureText(bird.commonGroup).width + 20
  roundRect(ctx, imgPad + 8, y - 16, gw, 28, 14)
  ctx.fillStyle = gc.bg.replace('0.12', '0.25')
  ctx.fill()
  ctx.fillStyle = gc.text
  ctx.fillText(bird.commonGroup, imgPad + 18, y + 4)

  let chipX = imgPad + 8 + gw + 10

  if (bird.iucnStatus && IUCN_COLORS[bird.iucnStatus]) {
    const iucnColor = IUCN_COLORS[bird.iucnStatus]
    const iucnLabel = `${bird.iucnStatus} · ${IUCN_LABELS[bird.iucnStatus]}`
    ctx.font = '500 14px "Manrope", sans-serif'
    const iw = ctx.measureText(iucnLabel).width + 32
    roundRect(ctx, chipX, y - 16, iw, 28, 14)
    ctx.fillStyle = `${iucnColor}30`
    ctx.fill()
    ctx.beginPath()
    ctx.arc(chipX + 14, y - 2, 4, 0, Math.PI * 2)
    ctx.fillStyle = iucnColor
    ctx.fill()
    ctx.fillText(iucnLabel, chipX + 24, y + 3)
  }

  // Divider
  y += 52
  ctx.strokeStyle = `${rarityVisual.border}30`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(imgPad + 8, y)
  ctx.lineTo(CARD_W - imgPad - 8, y)
  ctx.stroke()

  // App URL
  y += 36
  ctx.font = '400 18px "Manrope", sans-serif'
  ctx.fillStyle = 'rgba(134, 212, 190, 0.4)'
  ctx.textAlign = 'center'
  ctx.fillText(APP_URL, CARD_W / 2, y)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })
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
