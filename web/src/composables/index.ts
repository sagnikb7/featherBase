export * from './dark'
export * from './groupColor'
export * from './iucn'

// In dev, Vite proxy forwards /v1.0/* to the backend.
// In prod, Express serves everything from the same origin.
// Either way, relative URLs work.
export const baseUrl = ''
