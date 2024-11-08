var version = 'v19102022';
var CACHENAME = "cachestore-" + version;

var FILES = [
  "https://imv.natdat.mx/pantalla.html",
  "https://imv.natdat.mx/controladores/pantalla.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://pro.fontawesome.com/releases/v5.10.0/css/all.css",
  "https://unpkg.com/vue@3.1.1/dist/vue.global.prod.js",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
  "https://unpkg.com/qrious@4.0.2/dist/qrious.js",
  "https://code.jquery.com/jquery-3.3.1.js",
  "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js"


];



self.addEventListener("install", function (event) {

  event.waitUntil(
    caches.open(CACHENAME).then(function (cache) {
      return cache.addAll(FILES);
    })
  );

});


self.addEventListener('activate', function (event) {

  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .map(c => c.split('-'))
            .filter(c => c[0] === 'cachestore')
            .filter(c => c[1] !== version)
            .map(c => caches.delete(c.join('-')))
        )

      )
  );
});


self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});