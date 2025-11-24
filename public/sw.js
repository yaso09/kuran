function verses() {
  let result = [];
  for (const x of Array(115).keys()) {
    result.push(x);
  }

  return result;
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('your-cache-name').then(function(cache) {
      let cacheArray = [
        "index.html",
        "kuran.html",
        "embed.html",
        "print.min.js",
        // Fontlar
        "assets/fonts/alshohadaa.ttf",
        "assets/fonts/Aqeeq-Bold.ttf",
        "assets/fonts/Kitab-Bold.ttf",
        "assets/fonts/StackSansNotch-Bold.ttf",
        // CSS'ler
        "assets/css/btn.css",
        "assets/css/continue.css",
        "assets/css/goToAyah.css",
        "assets/css/loadScreen.css",
        // Mealler
        "data/mealler/diyanet-vakfi.json",
        "data/mealler/hayrat-nesriyat.json",
        "data/mealler/omer-nasuhi-bilmen.json"
      ]
      cacheArray.push(verses());
      return cache.addAll(cacheArray);
    })
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
      .then(res => res || caches.match("/offline.html"))
  )
});