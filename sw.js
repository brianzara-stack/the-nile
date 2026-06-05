const CACHE='nile-v2';const SHELL=['/','/index.html','/css/main.css','/js/app.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(!e.request.url.includes('supabase')&&!e.request.url.includes('listennotes')&&e.request.method==='GET'){e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).catch(()=>caches.match('/index.html'))))}});
