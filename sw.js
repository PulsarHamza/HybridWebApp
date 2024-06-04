self.addEventListener('install', e => {
    e.waitUntil(
      caches.open('web-app-offline').then(function(cache) {
        return cache.addAll([
            '/web-app/',
            '/web-app/index.html',
            '/web-app/index.js',
            '/web-app/sw.js',
            '/web-app/css/element.css',
            '/web-app/css/font-awesome.min.css',
            '/web-app/css/jquery-impromptu.css',
            '/web-app/css/jura.css',
            '/web-app/css/normalize.min.css',
            '/web-app/css/skel-noscript.css',
            '/web-app/css/slider.css',
            '/web-app/css/style.css',
            '/web-app/css/style-desktop.css',
            '/web-app/css/style-lr.css',
            '/web-app/fonts/fontawesome-webfont.eot',
            '/web-app/fonts/fontawesome-webfont.svg',
            '/web-app/fonts/fontawesome-webfont.ttf',
            '/web-app/fonts/fontawesome-webfont.woff',
            '/web-app/fonts/fontawesome-webfont.woff2',
            '/web-app/fonts/segoeui.ttf',
            '/web-app/fonts/segoeui.woff',
            '/web-app/fonts/segoeui.woff2',
            '/web-app/fonts/segoeuibold.ttf',
            '/web-app/fonts/segoeuibold.woff',
            '/web-app/fonts/segoeuibold.woff2',
            '/web-app/fonts/segoeuisemibold.ttf',
            '/web-app/fonts/segoeuisemibold.woff',
            '/web-app/fonts/segoeuisemibold.woff2',
            '/web-app/js/bootstrap.min.js',
            '/web-app/js/chart.js',
            '/web-app/js/chartjs-plugin-zoom.min.js',
            '/web-app/js/ekko-lightbox.js',
            '/web-app/js/hammer.min.js',
            '/web-app/js/jquery-2.1.1.min.js',
            '/web-app/js/jquery-impromptu.js',
			'/web-app/js/lang.js',
            '/web-app/js/script-lr2.js',
            '/web-app/js/slider.js',
            '/web-app/img/pulsaricon-rgb64_2.png',
            '/web-app/img/pulsarlogo.svg',
            '/web-app/img/tank1.png'
        ]);
      })
    );
   });
   
   self.addEventListener('fetch', e => {
     console.log(e.request.url);
     e.respondWith(
       caches.match(e.request).then(response => response || fetch(e.request))
     );
   });
