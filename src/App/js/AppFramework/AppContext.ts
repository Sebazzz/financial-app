import * as r from 'router5';
import { App } from './AppFactory';
import AuthenticationService from './Services/AuthenticationService';

export default class AppContext {
    public router!: r.Router;
    public title: string = 'Application';
    public app: App;
    public authentication: AuthenticationService = new AuthenticationService();

    public versionStamp = document.documentElement!.getAttribute('data-app-version') || 'v0_0';

    public culture = 'en-US';

    constructor(app: App) {
        this.app = app;
    }
}
