import confirmAsync from 'AppFramework/Forms/Confirmation';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        console.info('Registering service worker...');

        await runtime.register();
    } else {
        console.warn('Skipping service worker registration, window.navigator does not contain "serviceWorker"');
    }
}

async function onUpdateAvailable() {
    if (await confirmAsync('We hebben een update. Wil je de applicatie herladen?', 'Update gevonden')) {
        document.location!.reload(true);
    }
}

async function enableServiceWorkerMessageHandler() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    navigator.serviceWorker.onmessage = ev => {
        console.info('Message from service worker: %s', ev.data);

        if (ev.data === 'sw-upgrade') {
            onUpdateAvailable();
        }
    };

    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
        reg.addEventListener('updatefound', ev => {
            console.info('Registration of service worker: update found');
            onUpdateAvailable();
        });
    }
}

export async function initialize() {
    await registerServiceWorker();
    await enableServiceWorkerMessageHandler();
}
