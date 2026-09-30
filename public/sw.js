// ============================================================================
// RADAR DO ROLÊ - SERVICE WORKER OFICIAL (PWA)
// Versão do Cache: v1.0.0
// Estratégia: Stale-While-Revalidate para assets estáticos, Network-First para navegação
// ============================================================================

const CACHE_NAME = 'radar-do-role-v1';
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo-official.jpg',
  '/favicon.ico',
];

// Instalação do Service Worker & Pre-caching
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache warning:', err);
      });
    })
  );
});

// Ativação do Service Worker & Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de Requisições de Rede (Fetch)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Apenas intercepta requisições HTTP/HTTPS no mesmo domínio ou de imagens estáticas
  if (!req.url.startsWith('http')) return;

  // Ignora requisições de backend Supabase / API para não cachear dados dinâmicos de portaria/auth
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    return;
  }

  // Requisições de Navegação (Páginas HTML): Network-First
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(req).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // Requisições de Assets (Imagens, CSS, JS, Fontes): Stale-While-Revalidate
  if (
    req.destination === 'image' ||
    req.destination === 'style' ||
    req.destination === 'script' ||
    req.destination === 'font'
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }
});

// Atualização imediata sob demanda
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
