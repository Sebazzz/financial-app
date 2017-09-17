import * as framework from './AppFramework/AppFactory';
import { App } from './App';
import '../css/app.scss';

export module app {
    export function init() {
        const app = new App();
        app.context.culture = 'nl-NL';

        framework.createApp(app);
    }
}

app.init();