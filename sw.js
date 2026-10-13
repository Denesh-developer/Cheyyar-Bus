/* CheyyarBus service worker: network-first so updates show immediately, cache fallback for offline use.
   version.json is never cached, so the in-app APK update check keeps working. */
const CACHE = "cheyyarbus-v1";
const CORE = ["./", "index.html", "style.css", "dash.css", "extras.css", "i18n.js", "bus3d.js", "dash.js", "script.js", "extras.js",
  "data/timetable.js", "manifest.webmanifest", "icons/icon-192.png", "assets/ai-girl.png"];
const STATIC_HOSTS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.endsWith("/version.json")) return;
    e.respondWith(networkFirst(req));
  } else if (STATIC_HOSTS.includes(url.hostname)) {
    e.respondWith(staleWhileRevalidate(req));
  }
});
async function networkFirst(req) {
  const c = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.status === 200) c.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") { const idx = await c.match("index.html"); if (idx) return idx; }
    throw err;
  }
}
async function staleWhileRevalidate(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req);
  const net = fetch(req).then(r => { if (r && (r.status === 200 || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || net;
}
