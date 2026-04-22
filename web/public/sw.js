const CACHE_NAME = 'featherbase-v2'

const PRECACHE = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg',
]

globalThis.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => globalThis.skipWaiting()),
  )
})

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)),
      ))
      .then(() => globalThis.clients.claim()),
  )
})

globalThis.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET')
    return
  if (url.origin !== globalThis.location.origin)
    return

  if (url.pathname.startsWith('/v1.0/') || url.pathname === '/_health') {
    event.respondWith(networkFirst(request))
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  event.respondWith(cacheFirst(request))
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached)
    return cached

  try {
    const response = await fetch(request)
    if (response.ok && response.status === 200) {
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) {
        const cache = await caches.open(CACHE_NAME)
        cache.put(request, response.clone())
      }
    }
    return response
  }
  catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  }
  catch {
    const cached = await caches.match(request)
    if (cached)
      return cached

    return new Response(JSON.stringify({ success: false, error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
