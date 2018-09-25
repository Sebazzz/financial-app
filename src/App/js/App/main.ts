import * as framework from 'AppFramework/AppFactory';
import { App } from './App';
import { initialize as initializeServiceWorker } from 'App/Services/ServiceWorkerManager';
import '../../wwwroot/css/app.scss';

function init() {
    const app = new App();
    app.context.culture = 'nl';

    framework.createApp(app);
}

init();

if (!DEBUG) {
    // Only actively install service worker in PROD, because during testing it will usually be in the way
    initializeServiceWorker();
}
