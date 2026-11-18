// Service worker ÉLAN : la page est toujours redemandée au réseau (données fraîches) ; sans réseau, la dernière version
// enregistrée s'affiche. Polices et icônes : servies depuis le cache, rafraîchies en arrière-plan.
const CACHE = 'elan-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png']))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {   // la page : réseau d'abord, cache en secours
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./', cp)); return res; }).catch(() => caches.match('./')));
    return;
  }
  if (u.origin === location.origin || u.hostname.endsWith('fonts.googleapis.com') || u.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.open(CACHE).then(c => c.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
