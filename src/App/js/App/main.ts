import * as framework from 'AppFramework/AppFactory';
import { App } from './App';
import '../../wwwroot/css/app.scss';

export namespace app {
    export function init() {
        const app = new App();
        app.context.culture = 'nl-NL';

        framework.createApp(app);
    }
}

app.init();
