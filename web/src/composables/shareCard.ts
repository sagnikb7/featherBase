import type { Bird, Image } from '~/types/common'
import { groupColor } from './groupColor'

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

  // Background
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  bg.addColorStop(0, '#02241d')
  bg.addColorStop(1, '#0a3a30')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  // Subtle grain texture
  ctx.globalAlpha = 0.03
  for (let i = 0; i < 8000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
    ctx.fillRect(Math.random() * CARD_W, Math.random() * CARD_H, 1, 1)
  }
  ctx.globalAlpha = 1

  // Image area (top portion with rounded bottom)
  const imgH = 620
  const imgPad = 40
  const imgW = CARD_W - imgPad * 2
  ctx.save()
  roundRect(ctx, imgPad, imgPad, imgW, imgH, 20)
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
      // CORS blocked — draw gradient fallback
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

  // Serial number
  let y = imgH + imgPad + 56
  const serial = `#${String(bird.serialNumber).padStart(3, '0')}`
  ctx.font = '600 22px "DM Mono", monospace'
  ctx.fillStyle = 'rgba(134, 212, 190, 0.5)'
  ctx.textAlign = 'left'
  ctx.fillText(serial, imgPad + 8, y)

  // Bird name
  y += 52
  ctx.font = '500 48px "Newsreader", Georgia, serif'
  ctx.fillStyle = '#e1e3de'
  ctx.fillText(bird.name, imgPad + 8, y)

  // Scientific name
  y += 36
  ctx.font = 'italic 300 22px "Newsreader", Georgia, serif'
  ctx.fillStyle = 'rgba(225, 227, 222, 0.5)'
  ctx.fillText(bird.scientificName, imgPad + 8, y)

  // Group tag
  y += 48
  const gc = groupColor(bird.commonGroup)
  const groupText = bird.commonGroup
  ctx.font = '600 16px "Manrope", sans-serif'
  const gw = ctx.measureText(groupText).width + 20
  roundRect(ctx, imgPad + 8, y - 16, gw, 28, 14)
  ctx.fillStyle = gc.bg.replace('0.12', '0.25')
  ctx.fill()
  ctx.fillStyle = gc.text
  ctx.fillText(groupText, imgPad + 18, y + 4)

  // IUCN chip
  if (bird.iucnStatus && IUCN_COLORS[bird.iucnStatus]) {
    const iucnColor = IUCN_COLORS[bird.iucnStatus]
    const iucnLabel = `${bird.iucnStatus} · ${IUCN_LABELS[bird.iucnStatus]}`
    ctx.font = '500 14px "Manrope", sans-serif'
    const iw = ctx.measureText(iucnLabel).width + 32
    const ix = imgPad + 8 + gw + 10
    roundRect(ctx, ix, y - 16, iw, 28, 14)
    ctx.fillStyle = `${iucnColor}30`
    ctx.fill()

    // Dot
    ctx.beginPath()
    ctx.arc(ix + 14, y - 2, 4, 0, Math.PI * 2)
    ctx.fillStyle = iucnColor
    ctx.fill()

    ctx.fillStyle = iucnColor
    ctx.fillText(iucnLabel, ix + 24, y + 3)
  }

  // Divider line
  y += 52
  ctx.strokeStyle = 'rgba(134, 212, 190, 0.12)'
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
