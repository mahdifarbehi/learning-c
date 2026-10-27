const CACHE_NAME = 'c-stories-v2';
const APP_FILES = [
  './',
  './index.html',
  './C Stories.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './courses/c-basics/01-how-c-becomes-a-program.md',
  './courses/c-basics/02-pointers.md',
  './courses/c-basics/03-heap-memory.md',
  './courses/c-basics/04-arrays-strings-buffers.md',
  './courses/c-basics/05-bytes-and-layout.md',
  './courses/sqlite/01-repl.md',
  './courses/sqlite/02-prepare-and-execute.md',
  './courses/sqlite/03-rows-in-memory.md',
  './courses/sqlite/04-reject-bad-input.md',
  './courses/sqlite/05-persist-pages.md',
  './courses/sqlite/06-cursors.md',
  './courses/sqlite/07-btree-shape.md',
  './courses/sqlite/08-leaf-nodes.md',
  './courses/sqlite/09-sorted-leaf-search.md',
  './courses/sqlite/10-split-leaves.md',
  './courses/sqlite/11-search-internal-nodes.md',
  './courses/sqlite/12-scan-multiple-leaves.md',
  './courses/sqlite/13-update-parent-nodes.md',
  './courses/sqlite/14-split-internal-nodes.md'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
