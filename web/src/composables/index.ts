export * from './dark'
export * from './iucn'

export const baseUrl = import.meta.env.MODE === 'development'
  ? (import.meta.env.VITE_IMG_DELIVERY_MODE === 'online'
      ? 'https://featherbase.onrender.com'
      : 'http://localhost:8888')
  : window.location.origin
