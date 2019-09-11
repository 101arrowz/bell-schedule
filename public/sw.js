const CACHE_VER = 'v1';
const openCache = () => caches.open(CACHE_VER);
const matchWithCache = (val, fallback = null, anyVersion = false) => 
  (anyVersion ? Promise.resolve(caches) : openCache()).then(cache => cache.match(val)).then(val => val === undefined ? (typeof fallback === 'function' ? fallback() : fallback) : val)
self.addEventListener('install', e => e.waitUntil(
  openCache()
    .then(cache => fetch('/pwa-manifest.json', {cache: 'no-store'})
      .then(res => res.json())
      .then(manifest => manifest.filter(el => el !== '/sw.js').map(el => el === '/index.html' ? '/' : el))
      .then(newManifest => cache.addAll(newManifest)))));
self.addEventListener('fetch', e => e.respondWith(
  matchWithCache(e.request, () => fetch(e.request.clone(), {cache: 'no-store'}).then(res => openCache().then(cache => {
    cache.put(e.request.clone(), res.clone());
    return res;
  })))
));