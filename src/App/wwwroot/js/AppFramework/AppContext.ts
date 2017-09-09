import * as r from 'router5';
import { App } from './AppFactory';
import AuthenticationService from './AuthenticationService';

export default class AppContext {
    public router: r.Router;
    public title: string = 'Application';
    public app: App = null;
    public authentication: AuthenticationService = new AuthenticationService();

    public versionStamp =  document.documentElement.getAttribute('data-app-version');

    constructor(app:App) {
        this.app = app;
    }
}