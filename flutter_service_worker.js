'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "71ff82915d235f803d6d224b38736335",
"index.html": "b2ee9437a51c6c37411273e02bc848ca",
"/": "b2ee9437a51c6c37411273e02bc848ca",
"main.dart.js": "009b37aa8dded867bf48dfcde0163036",
"upload.js": "193f0131d98e377a35c7b0b34aa8e4d9",
"favicon.png": "7c71a323d9f6d08a80bc3f0e249bead9",
"icons/Icon-192.png": "9d013e152d495e848053857e5ec396d2",
"icons/Icon-512.png": "5a690ac3909fbd83251fc17d236ff9e8",
"manifest.json": "45a28b43f8e8f7722b902667dc094d73",
"mylink@210411.zip": "029cce6f1dbbe557378c074aa4388064",
"assets/AssetManifest.json": "279a364817a0e2631a2de5e529e848e7",
"assets/NOTICES": "e31953e01d03ed23d8cb1da8833f6d7f",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/assets/images/venus.png": "71811484967ae7d16468fd1e7ea69299",
"assets/assets/images/uranus.png": "d91badb92b4fcac3c5901d54a4a3e5fc",
"assets/assets/images/astronaut.png": "776e39a549f2768e86129c2286e6f32f",
"assets/assets/images/ujoonet.png": "2a2dd3bc96fbaff0b21686ac4cddc73e",
"assets/assets/images/space-1920.jpg": "02542344136f8c6cefd9138785bf6f40",
"assets/assets/images/telescope.png": "6430e3ff0047b5cf4b6ead22b4c1b7de",
"assets/assets/images/spaceship.png": "82fe6920652510c51e1e9d849c08dfaa",
"assets/assets/images/ursa-minor.png": "c3ea495034ed3c15fdf5c08b5ea40a5b",
"assets/assets/images/moon-flag.png": "225bb3862ca0511458485b2e945e9cb5",
"assets/assets/images/earth.png": "7a12bc26fbcabe1b35288ca85dc248b6",
"assets/assets/images/solar-system.png": "0892f90c85a1418f0405ccc12e6e278b",
"assets/assets/images/moon.png": "27e04a2be131931afe6335313f842677",
"assets/assets/images/satelite.png": "903283a9c359af02033040b0fe3a51b4",
"assets/assets/images/rocket.png": "4a57106cc4f10bfa8da15a3d69b5ad63",
"assets/assets/images/alien.png": "91254c54db0d47c50a85b36bcd0468b5",
"assets/assets/images/ufo.png": "7ba2b560b100787d16d00d8b3ec9799e",
"assets/assets/images/asteroid.png": "d2a38baa397df35353dba8a1c3674770",
"assets/assets/images/asteroid-earth.png": "c2dfb6b8e3d4c06111481ae6cca423cd",
"assets/assets/images/satelite-radar.png": "4c0b1bae45916097d03cc55b74c6bb17",
"assets/assets/images/astronaut-moon.png": "b7ec03813cb02a32a24238da6b79ed62",
"assets/assets/images/sun.png": "b7843d2652c674f633a9d53038519422",
"assets/assets/images/saturn.png": "c4b1a364b0e281c3286ad420cd2eef14",
"assets/assets/lang/en.json": "a5f0686e11dd9658a20bacaa2252cecf",
"assets/assets/lang/ko.json": "dde38346b9a2ad463f11072093d40122",
"assets/assets/icons/rocket.ico": "8d6a5e6477450c7c406f09b96a03ea09"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
