export * from './confetti'
export * from './format'
export * from './settings'
export * from './groupColor'
export * from './iucn'
export * from './rarity'
export * from './shareCard'

// In dev, Vite proxy forwards /v1.0/* to the backend.
// In prod, Express serves everything from the same origin.
// Either way, relative URLs work.
export const baseUrl = ''
