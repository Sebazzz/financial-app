import * as framework from 'AppFramework/AppFactory';
import { App } from './App';
import '../../wwwroot/css/app.scss';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

function init() {
    const app = new App();
    app.context.culture = 'nl-NL';

    framework.createApp(app);
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        console.info('Registering service worker...');
        runtime.register();
    } else {
        console.warn('Skipping service worker registration, window.navigator does not contain "serviceWorker"');
    }
}

function enableServiceWorkerMessageHandler() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    navigator.serviceWorker.onmessage = ev => {
        if (ev.data === 'sw-upgrade') {
            if (confirm('We hebben een update. Wil je de applicatie herladen?')) {
                document.location.reload(true);
            }
        }
    };
}

init();
enableServiceWorkerMessageHandler();
registerServiceWorker();
