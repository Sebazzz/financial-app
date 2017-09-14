import * as af from './AppFramework/AppFactory'
import { App } from './App'

export module app {
    export function init() {
        kendo.culture('nl-NL');

        const app = new App();
        af.createApp(app);
    }
}

app.init();