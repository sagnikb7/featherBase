const CACHE_NAME = 'featherbase-v3'
const API_CACHE_NAME = 'featherbase-api-v3'

let swIsOffline = false

async function notifyClients(type) {
  const clients = await globalThis.clients.matchAll({ includeUncontrolled: true, type: 'window' })
  clients.forEach(client => client.postMessage({ type }))
}

function markOffline() {
  if (swIsOffline) return
  swIsOffline = true
  notifyClients('NETWORK_OFFLINE')
}

function markOnline() {
  if (!swIsOffline) return
  swIsOffline = false
  notifyClients('NETWORK_ONLINE')
}

const HOME_API_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_STORAGE_BYTES = 50 * 1024 * 1024 // 50 MB

const PRECACHE = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg',
]

// Routes that get stale-while-revalidate with a 5-min TTL.
// Covers the three calls made on every home page load:
//   GET /v1.0/birds/groups
//   GET /v1.0/birds/<id>       (bird of the day + individual detail pages)
//   GET /v1.0/birds?page=...   (bird list, any group filter, NOT search queries)
function isShortTtlApiRequest(url) {
  const { pathname, searchParams } = url
  if (pathname === '/v1.0/birds/groups') return true
  if (/^\/v1\.0\/birds\/\d+$/.test(pathname)) return true
  if (pathname === '/v1.0/birds' && !searchParams.has('search')) return true
  return false
}

async function flushApiCacheIfOverLimit() {
  if (!navigator.storage?.estimate) return
  const { usage } = await navigator.storage.estimate()
  if (usage != null && usage > MAX_STORAGE_BYTES) {
    await caches.delete(API_CACHE_NAME)
    console.log('[SW] Storage over 50 MB — API cache flushed')
  }
}

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
        keys
          .filter(key => key !== CACHE_NAME && key !== API_CACHE_NAME)
          .map(key => caches.delete(key)),
      ))
      .then(() => flushApiCacheIfOverLimit())
      .then(() => globalThis.clients.claim()),
  )
})

globalThis.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.origin !== globalThis.location.origin) return

  if (url.pathname.startsWith('/v1.0/') || url.pathname === '/_health') {
    if (isShortTtlApiRequest(url)) {
      event.respondWith(staleWhileRevalidate(request))
      return
    }
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

// Serve from cache if fresh (< TTL). If stale, serve cached immediately and
// refresh in the background. If nothing cached, block on network.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    const cachedAt = Number(cached.headers.get('X-Cached-At') || 0)
    const isFresh = (Date.now() - cachedAt) < HOME_API_TTL

    if (isFresh) return cached

    // Stale — respond immediately, refresh in background
    fetchAndCache(request, cache).catch(() => markOffline())
    return cached
  }

  return fetchAndCache(request, cache).catch(() =>
    new Response(JSON.stringify({ success: false, error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

async function fetchAndCache(request, cache) {
  const response = await fetch(request)
  if (response.ok) {
    markOnline()
    const headers = new Headers(response.headers)
    headers.set('X-Cached-At', String(Date.now()))
    const stamped = new Response(await response.clone().arrayBuffer(), {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
    cache.put(request, stamped)
  }
  return response
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

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
      markOnline()
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  }
  catch {
    markOffline()
    const cached = await caches.match(request)
    if (cached) return cached

    return new Response(JSON.stringify({ success: false, error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
