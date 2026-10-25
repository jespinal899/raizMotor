/*
  Trabajador del sitio instalado como aplicación. Solo hace dos cosas:
  - Las páginas siempre se piden a la red, para que nadie vea una versión vieja; sin conexión se muestra
    /offline.html en lugar del error del navegador.
  - Los archivos de /assets/ llevan su huella en el nombre y nunca cambian: se guardan la primera vez y
    después abren al instante, también al volver a la aplicación.
  Supabase, /api y los mapas van siempre directos a la red: aquí no se tocan.
*/
const ASSETS = 'domusraiz-assets-v1'
const PAGES = 'domusraiz-pages-v1'
const OFFLINE = '/offline.html'
// Cada versión publicada deja sus archivos: se guardan los más recientes y se borran los más viejos.
const MAX_ASSETS = 80

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.add(OFFLINE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  const current = [ASSETS, PAGES]
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !current.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

const trim = async (cache) => {
  const keys = await cache.keys()
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_ASSETS)).map((key) => cache.delete(key)))
}

const fromCacheFirst = async (request) => {
  const cache = await caches.open(ASSETS)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    await cache.put(request, response.clone())
    void trim(cache)
  }

  return response
}

const pageOrOffline = async (request) => {
  try {
    return await fetch(request)
  } catch {
    return (await caches.match(OFFLINE)) ?? Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(pageOrOffline(request))
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(fromCacheFirst(request))
  }
})
