const CACHE = 'afyayako-v21'
const OFFLINE_URL = '/offline.html'

// Pre-cache shell on install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([
      '/',
      '/offline.html',
    ])).then(() => self.skipWaiting())
  )
})

// Claim clients on activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Network-first for API, cache-first for static
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Skip non-GET and external requests
  if (e.request.method !== 'GET') return
  if (!url.origin.includes('uberhealth') && !url.origin.includes('mhapke') && url.origin !== self.location.origin) return

  // API: network-first, no cache
  if (url.pathname.startsWith('/api/') || url.hostname.startsWith('api.')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(async () => {
        const cached = await caches.match(e.request)
        if (cached) return cached
        // Return offline page for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL) ?? new Response('Offline', { status: 503 })
        }
        return new Response('Network error', { status: 503 })
      })
  )
})

// Push notification handler
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
