// Bump on every meaningful change — new version strings evict old caches
// and force clients to install the new worker.
const VERSION      = 'afyayako-v22'
const HTML_CACHE   = `${VERSION}-html`
const ASSET_CACHE  = `${VERSION}-assets`
const OFFLINE_URL  = '/offline.html'

// Pre-cache the offline shell so the app works without a network on first visit.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(HTML_CACHE)
      .then(c => c.addAll(['/', OFFLINE_URL]))
      .then(() => self.skipWaiting())
  )
})

// On activate: drop every cache from an older VERSION.
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// Allow the app to force a waiting SW to take over.
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  if (e.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  // API traffic bypasses the SW entirely — no caching, no interception.
  if (url.pathname.startsWith('/api/') || url.hostname.startsWith('api.')) return

  // Detect an HTML navigation request. The Accept header check catches
  // link previews and prefetches that don't set mode='navigate'.
  const isHTML = e.request.mode === 'navigate'
              || (e.request.headers.get('accept') || '').includes('text/html')

  if (isHTML) {
    // Network-first for HTML: fresh deploys are visible immediately.
    // Fall back to the last known HTML only when offline, then to the
    // offline shell as a last resort.
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(HTML_CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
        .catch(async () => {
          const cached = await caches.match(e.request)
          if (cached) return cached
          const offline = await caches.match(OFFLINE_URL)
          return offline ?? new Response('Offline', { status: 503 })
        })
    )
    return
  }

  // Assets (JS/CSS/fonts/images) — cache-first. Vite fingerprints these
  // filenames on every build, so the URL changes when the file changes;
  // a stale entry can never mask a new one.
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(ASSET_CACHE).then(c => c.put(e.request, clone))
        }
        return res
      }).catch(() => new Response('Network error', { status: 503 }))
    })
  )
})

// Push notification handler — unchanged behaviour.
self.addEventListener('push', e => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'Afya Yako Siri Yako', {
      body:  data.body ?? 'You have a new notification.',
      icon:  '/favicon.svg',
      badge: '/favicon.svg',
      data:  data,
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(all => {
      const url = e.notification.data?.url ?? '/'
      for (const c of all) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.navigate(url)
          return c.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
