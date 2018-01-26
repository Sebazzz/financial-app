const global = self as ServiceWorkerGlobalScope;

const assets = [...serviceWorkerOption.assets, '/', '/favicon.ico'].map(x => new URL(x, location.toString()).toString());

const CACHE_NAME = 'fa-app-' + Date.now();

async function initCache(): Promise<void> {
    try {
        const cache = await caches.open(CACHE_NAME);

        console.info('Caching %d assets', assets.length);
        console.log(assets);
        await cache.addAll(assets);
    } catch (e) {
        console.error('Unable to cache to region %s', CACHE_NAME);
        console.error(e);

        throw e;
    }
}

async function initCacheAndActivate(): Promise<void> {
    await initCache();

    global.skipWaiting();
}

async function cleanUpCache(): Promise<boolean> {
    let didCleanUp = false;

    const keys = await caches.keys();
    const tasks: Array<Promise<any>> = keys.map(cacheName => {
        if (cacheName === CACHE_NAME) {
            return Promise.resolve();
        }

        didCleanUp = true;
        return caches.delete(cacheName);
    });

    await Promise.all(tasks);

    return didCleanUp;
}

async function cleanUpCacheAndSignal(): Promise<void> {
    const hasCleanedUp = await initCache();

    await global.clients.claim();

    if (hasCleanedUp) {
        console.info('[Service Worker] Messaging upgrade signal to page');

        const clients = await global.clients.matchAll();

        for (const client of clients) {
            console.log('[Service Worker] ... Messaging client %s [%s]', client.id, client.url);

            client.postMessage('sw-upgrade');
        }
    }
}

async function returnPossibleCachedResponse(request: Request): Promise<Response> {
    try {
        const response = await caches.match(request);

        if (response) {
            console.log('[Service Worker] [Fetch] Matching %s', request.url);
            return response;
        }

        if (request.mode === 'navigate') {
            console.log('[Service Worker] [Fetch] Not matching request %s in cache. Returning bootstrapper HTML.', request.url);

            return caches.match('/');
        }

        console.warn('[Service Worker] [Fetch] Not matching request %s in cache - requesting', request.url);
        return await fetch(request);
    } catch (e) {
        if (request.mode === 'navigate') {
            console.log('[Service Worker] [Fetch] Not matching request %s in cache. Returning bootstrapper HTML.', request.url);

            return caches.match('/');
        }

        console.error('[Service Worker] [Fetch] Not matching request %s in cache - fail', request.url);
        return fetch(request);
    }
}

self.addEventListener('install', (event: ExtendableEvent) => {
    console.info('[Service Worker] Install');

    event.waitUntil(initCacheAndActivate());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
    console.info('[Service Worker] Activate');

    event.waitUntil(cleanUpCacheAndSignal());
});

self.addEventListener('message', (event: MessageEvent) => {
    console.log('[Service Worker] Message: %s', event.data);
});

self.addEventListener('fetch', (event: FetchEvent) => {
    let request = event.request;

    if (request.method !== 'GET') {
        console.log('[Service Worker] [Fetch] Ignore non-GET request %s %s', request.method, request.url);
        return;
    }

    const requestUrl = new URL(request.url);

    if (requestUrl.pathname.startsWith('/api/')) {
        console.log('[Service Worker] [Fetch] Ignore API request %s %s', request.method, request.url);
        return;
    }

    const excludedPaths = ['/js/' /*eventsource polyfill*/, '/images/' /*tiles and icons*/];
    if (excludedPaths.find(val => requestUrl.pathname.startsWith(val)) !== undefined) {
        console.log('[Service Worker] [Fetch] Ignore API request %s %s', request.method, request.url);
        return;
    }

    if (requestUrl.origin !== location.origin) {
        console.log('[Service Worker] [Fetch] Ignore mismatch in origin of request %s %s', request.method, request.url);
        return;
    }

    if (requestUrl.search && requestUrl.search.indexOf('v=') !== -1 /*ASP.NET Core version string*/) {
        console.log('[Service Worker] [Fetch] Rewriting request to version string %s', requestUrl.toString());

        requestUrl.search = '';
        request = new Request(
            requestUrl.toString(),
            {
                headers: request.headers,
                cache: request.cache,
                credentials: request.credentials,
                integrity: request.integrity,
                method: request.method,
                redirect: request.redirect,
                mode: request.mode,
                referrer: request.referrer,
                referrerPolicy: request.referrerPolicy
            }
        );
    }

    event.respondWith(returnPossibleCachedResponse(request));
});
