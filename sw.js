// Change the version when this file list changes.
const CACHE = 'c-stories-v1';

const ASSETS = [
  './',
  'index.html',
  'C Stories.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'courses/c-basics/01-how-c-becomes-a-program.md',
  'courses/c-basics/02-pointers.md',
  'courses/c-basics/03-heap-memory.md',
  'courses/c-basics/04-strings.md',
  'courses/c-basics/05-bytes-and-layout.md',
  'courses/c-basics/06-file-descriptors.md',
  'courses/sqlite/01-repl.md',
  'courses/sqlite/02-prepare-and-execute.md',
  'courses/sqlite/03-parse-insert.md',
  'courses/sqlite/04-rows-in-pages.md',
  'courses/sqlite/05-save-to-disk.md',
  'courses/sqlite/06-cursors.md',
  'courses/sqlite/07-btree-shape.md',
  'courses/sqlite/08-leaf-nodes.md',
  'courses/sqlite/09-sorted-leaf.md',
  'courses/sqlite/10-split-leaves.md',
  'courses/sqlite/11-search-internal-nodes.md',
  'courses/sqlite/12-scan-multiple-leaves.md',
  'courses/sqlite/13-update-parent-nodes.md',
  'courses/sqlite/14-split-internal-nodes.md'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Answer from the cache at once, and refresh the cache from the network
// in the background, so edited lessons show up on the next visit.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  const fresh = fetch(request).then(async response => {
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  });
  event.waitUntil(fresh.catch(() => {}));
  event.respondWith(caches.match(request).then(cached => cached || fresh));
});
