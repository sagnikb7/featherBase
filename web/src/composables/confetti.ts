import confetti from 'canvas-confetti'

export function fireUnlockConfetti() {
  const colors = ['#a78bfa', '#c4b5fd', '#7ecdb7', '#86d4be', '#e8e6f6', '#faf7f2']

  const base = {
    colors,
    ticks: 220,
    gravity: 0.9,
    scalar: 0.95,
    drift: 0,
  }

  // Main centre burst
  confetti({ ...base, particleCount: 90, spread: 80, origin: { x: 0.5, y: 0.6 } })

  // Left wing
  setTimeout(() => {
    confetti({ ...base, particleCount: 45, spread: 60, angle: 65, origin: { x: 0.18, y: 0.68 } })
  }, 110)

  // Right wing
  setTimeout(() => {
    confetti({ ...base, particleCount: 45, spread: 60, angle: 115, origin: { x: 0.82, y: 0.68 } })
  }, 200)

  // Trailing sparkle
  setTimeout(() => {
    confetti({ ...base, particleCount: 30, spread: 100, scalar: 0.7, origin: { x: 0.5, y: 0.55 } })
  }, 320)
}
