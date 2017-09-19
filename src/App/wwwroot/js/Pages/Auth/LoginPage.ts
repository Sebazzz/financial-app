import {Page, IPageRegistration} from '../../AppFramework/Page'
import AppContext from '../../AppFramework/AppContext'
import * as ko from 'knockout';

class AuthLoginPage extends Page {
    public userName = ko.observable<string>();
    public password = ko.observable<string>();
    public persist = ko.observable<boolean>(true);

    public isBusy = ko.observable<boolean>(false);
    public errorMessage = ko.observable<string>(null);

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Inloggen');

        this.login = this.login.bind(this);
    }

    protected onActivate(args?: any): Promise<void> {
        if (this.appContext.authentication.isAuthenticated()) {
            this.appContext.router.navigateToDefault();
        }

        return Promise.resolve();
    }

    public async login() {
        this.isBusy(true);

        try {
            const result = await this.appContext.authentication.authenticate(
                    this.userName.peek(),
                    this.password.peek(),
                    this.persist.peek()
                );

            this.errorMessage(result.isAuthenticated? null: 'Sorry, we konden je gebruikersnaam of wachtwoord niet bevestigen.');

            if (result.isAuthenticated) {
                this.appContext.router.navigateToDefault();
            }
        } catch (e) {
            this.errorMessage('Sorry, we konden je gebruikersnaam of wachtwoord niet bevestigen.');
        }finally {
            this.isBusy(false);
        }
    }
}

export default {
    id: module.id,
    templateName: 'auth/login',
    routingTable: [
        { name: 'auth', path: '/auth', forwardTo: '/auth/login' },
        { name: 'auth.login', path: '/login' }
    ],
    createPage: (appContext) => new AuthLoginPage(appContext)
} as IPageRegistration;