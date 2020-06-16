const [STATIC, DYNAMIC, INMUTABLE] = ['cache_static_v0.1', 'cache_dynamic_v0.1', 'cache_inmutable_v0.1'];

self.addEventListener('install', e => {
    const promStatic = caches.open(STATIC)
    .then(cache => {
        return cache.addAll([
           '/',
           '/js/app.js',
           '/socket.io/socket.io.js',
           '/js/socket_app.js',
           '/js/login.js'
        ]);
    });

    const promInmutable = caches.open(INMUTABLE)
    .then(cache => {
        return cache.addAll([
            '/css/estilos.css',
            '/css/movil.css'
        ]);
    });

    e.waitUntil(Promise.all([promStatic, promInmutable]));
});

self.addEventListener('fetch', e => {
    const resp = caches.match(e.request)
    .then(res => {
        if(res) return res;

        if(e.request.url.includes('/socket.io/?EIO') || e.request.url.includes('/usuario')){
            return fetch(e.request).then(newRes=>{return newRes});
        }

        return fetch(e.request).then(newRes => {
            caches.open(DYNAMIC).then(cache => {
                try{
                    console.log(e.request);
                    cache.put(e.request, newRes);
                }catch(ex){
                    console.error(ex);
                }
            });
            return newRes.clone();
        })
    });
    e.respondWith(resp);
});  