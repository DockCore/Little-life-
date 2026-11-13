// Service worker de Little Life — version 9817cc3bd5
const V='ll-9817cc3bd5',PRE=["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-512-maskable.png", "apple-touch-icon.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==V&&n!=='ll-fonts').map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 // polices Google : gardées pour le hors ligne
 if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){e.respondWith(caches.open('ll-fonts').then(c=>c.match(r).then(m=>m||fetch(r).then(x=>{c.put(r,x.clone());return x}).catch(()=>m))));return}
 if(u.origin!==location.origin)return;
 // page du jeu : le réseau d'abord (pour recevoir les nouvelles versions), sinon la copie gardée
 if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){e.respondWith(Promise.race([fetch(r).then(x=>{if(x.ok){const y=x.clone();caches.open(V).then(c=>c.put('index.html',y))}return x}),new Promise((_,j)=>setTimeout(j,4000))]).catch(()=>caches.match('index.html').then(m=>m||caches.match('./'))));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{if(x.ok){const y=x.clone();caches.open(V).then(c=>c.put(r,y))}return x})))});
