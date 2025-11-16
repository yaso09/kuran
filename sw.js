self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('your-cache-name').then(function(cache) {
      return cache.addAll([
        "index.html",
        "kuran.html",
        "embed.html",
        "print.min.js",
        "assets/fonts/alshohadaa.ttf",
        "assets/fonts/Aqeeq-Bold.ttf",
        "assets/fonts/Kitab-Bold.ttf",
        "assets/fonts/StackSansNotch-Bold.ttf"
      ])
    })
  );
});
self.addEventListener('fetch', event => {}); // şimdilik bir şey yapmaya gerek yok