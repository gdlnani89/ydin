const CACHE_NAME = "ydin1.0.0";
const urlsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/main.js",
    "/icon.png",
    "/manifest.json",
    "/vue.global.js"
];

console.log('Service Worker: Iniciando...');

self.addEventListener("install", (event) => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Cache preenchido com sucesso');
            })
            .catch((error) => {
                console.error('Service Worker: Erro ao preencher cache:', error);
            })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('Service Worker: Servindo do cache:', event.request.url);
                    return response;
                }
                console.log('Service Worker: Buscando da rede:', event.request.url);
                return fetch(event.request);
            })
            .catch((error) => {
                console.error('Service Worker: Erro na requisição:', error);
            })
    );
});

self.addEventListener("activate", (event) => {
    console.log('Service Worker: Ativando...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => cacheName !== CACHE_NAME);
            })
            .then((cachesToDelete) => {
                console.log('Service Worker: Removendo caches antigos:', cachesToDelete);
                return Promise.all(cachesToDelete.map((cacheName) => caches.delete(cacheName)));
            })
            .then(() => {
                console.log('Service Worker: Ativação concluída');
            })
    );
});