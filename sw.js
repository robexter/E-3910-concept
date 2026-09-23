const CACHE_NAME = 'e3910-concept-v3-refinamento-cic';
const APP_SHELL = [
  './','./index.html','./manifest.json',
  './retirada-e3910-manutencao.html?v=3',
  './icons/icon-192.png','./icons/icon-512.png',
  './icons/icon-maskable-192.png','./icons/icon-maskable-512.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,copy));return r;}).catch(()=>caches.match(event.request).then(c=>c||caches.match('./index.html'))));});
