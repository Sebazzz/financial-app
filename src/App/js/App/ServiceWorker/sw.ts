const global = self as ServiceWorkerGlobalScope;

const assets = [...serviceWorkerOption.assets, '/', '/favicon.ico'].map(x =>
    new URL(x, location.toString()).toString()
);

const CACHE_NAME = 'fa-app-' + serviceWorkerOption.versionTimestamp;

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
    const hasCleanedUp = await cleanUpCache();

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
            console.log(
                '[Service Worker] [Fetch] Not matching request %s in cache. Returning bootstrapper HTML.',
                request.url
            );

            return (await caches.match('/')) || (await fetch(request));
        }

        console.warn('[Service Worker] [Fetch] Not matching request %s in cache - requesting', request.url);
        return await fetch(request);
    } catch (e) {
        if (request.mode === 'navigate') {
            console.log(
                '[Service Worker] [Fetch] Not matching request %s in cache. Returning bootstrapper HTML.',
                request.url
            );

            return (await caches.match('/')) || (await fetch(request));
        }

        console.error('[Service Worker] [Fetch] Not matching request %s in cache - fail', request.url);
        return fetch(request);
    }
}

class ServiceWorkerMethods {
    public static versionQuery() {
        return Promise.resolve(serviceWorkerOption.versionTimestamp);
    }

    public static buildTypeQuery() {
        return Promise.resolve(serviceWorkerOption.buildTarget);
    }
}

function invokeServiceWorkerMethod(message: any): Promise<any> {
    if (!message || !message.method) {
        console.error('[Service Worker] [Messaging] Unknown service worker message');
        console.error(message);
        return Promise.reject('unknown message');
    }

    const data = message.data,
        method: (arg?: any) => Promise<any> = (ServiceWorkerMethods as any)[message.method];

    if (!method) {
        console.error('[Service Worker] [Messaging] Unknown service worker method: %s', message.method);
        console.error(message);
        return Promise.reject('unknown error');
    }

    console.info('[Service Worker] [Messaging] Invoke %s', message.method);
    return method(data);
}

self.addEventListener('install', (event: ExtendableEvent) => {
    console.info('[Service Worker] Install');

    global.skipWaiting();

    event.waitUntil(initCacheAndActivate());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
    console.info('[Service Worker] Activate');

    event.waitUntil(cleanUpCacheAndSignal());
});

self.addEventListener('message', async (event: MessageEvent) => {
    console.log('[Service Worker] [Messaging] Message: %s', event.data);

    const data = event.data;
    let returnValue: any | { error: any } = null;

    try {
        returnValue = await invokeServiceWorkerMethod(data);
    } catch (e) {
        console.error('[Service Worker] [Messaging] Error %s', e);

        returnValue = { error: e };
    }

    if (event.ports && event.ports[0]) {
        console.log('[Service Worker] [Messaging] Sending response %s', returnValue);

        event.ports[0].postMessage(returnValue);
    } else {
        const clients = await global.clients.matchAll();

        for (const client of clients) {
            console.log('[Service Worker] ... Messaging client %s [%s]', client.id, client.url);

            client.postMessage({
                id: data && data.message,
                response: returnValue
            });
        }
    }
});

self.addEventListener('fetch', (event: FetchEvent) => {
    let request = event.request;

    /**
     * Pass-through the request. Though not required by [Firefox, Chrome and Edge], Safari will complain
     * if the service worker does not return the response itself.
     */
    function passThrough() {
        event.respondWith(fetch(request));
    }

    if (request.method !== 'GET') {
        console.log('[Service Worker] [Fetch] Ignore non-GET request %s %s', request.method, request.url);

        passThrough();
        return;
    }

    const requestUrl = new URL(request.url);

    if (requestUrl.pathname.startsWith('/api/')) {
        console.log('[Service Worker] [Fetch] Ignore API request %s %s', request.method, request.url);

        passThrough();
        return;
    }

    const excludedPaths = [
        '/js/' /*eventsource polyfill*/,
        '/images/' /*tiles and icons*/,
        '/_internal/' /*diagnostics*/,
        '/manifest.webmanifest' /*app manifest*/
    ];
    if (excludedPaths.find(val => requestUrl.pathname.startsWith(val)) !== undefined) {
        console.log('[Service Worker] [Fetch] Ignore excluded request %s %s', request.method, request.url);

        passThrough();
        return;
    }

    if (requestUrl.origin !== location.origin) {
        console.log('[Service Worker] [Fetch] Ignore mismatch in origin of request %s %s', request.method, request.url);

        passThrough();
        return;
    }

    if (requestUrl.search && requestUrl.search.indexOf('v=') !== -1 /*ASP.NET Core version string*/) {
        console.log('[Service Worker] [Fetch] Rewriting request to version string %s', requestUrl.toString());

        // Rebuild request without the query string
        requestUrl.search = '';
        request = new Request(requestUrl.toString(), {
            headers: request.headers,
            cache: request.cache,
            credentials: request.credentials,
            integrity: request.integrity,
            method: request.method,
            redirect: request.redirect,
            mode: request.mode,
            referrer: request.referrer,
            referrerPolicy: request.referrerPolicy
        });
    }

    event.respondWith(returnPossibleCachedResponse(request));
});
