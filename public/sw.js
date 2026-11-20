// Service worker mínimo. Ele NÃO guarda páginas nem dados do sistema (nada de
// vendas, estoque ou clientes fica em cache no aparelho): só mostra uma página
// de "sem conexão" quando a rede cai ao abrir ou trocar de tela.
const OFFLINE_CACHE = "jp-espeto-offline-v1"
const OFFLINE_ASSETS = ["/offline.html", "/logo-sm.jpg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== OFFLINE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET" || request.mode !== "navigate") return

  event.respondWith(
    fetch(request).catch(() => caches.match("/offline.html").then((page) => page || Response.error()))
  )
})
