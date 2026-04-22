export function formatSerial(n: number): string {
  return `#${String(n).padStart(4, '0')}`
}
