const STORAGE_KEY = 'featherbase-botd'

interface BotdEntry { serial: number, date: string }

function todayKey() {
  return String(Math.floor(Date.now() / 86400000))
}

export function saveBotdSerial(serial: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ serial, date: todayKey() }))
  }
  catch {}
}

export function isBotd(serialNumber: number): boolean {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw)
      return false
    const entry: BotdEntry = JSON.parse(raw)
    return entry.date === todayKey() && entry.serial === serialNumber
  }
  catch {
    return false
  }
}
