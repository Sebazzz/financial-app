import {Page, IPageRegistration} from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';

class AuthLogOffPage extends Page {
    public isBusy = ko.observable(false);

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Uitloggen');

        this.logOff = this.logOff.bind(this);
    }

    protected onActivate(args?: any): Promise<void> {
        return Promise.resolve();
    }

    public async logOff() {
        this.isBusy(true);

        try {
            await this.appContext.authentication.unauthenticate();
            await this.appContext.authentication.checkAuthentication();
        } finally {
            this.isBusy(false);
            this.appContext.router.navigate('auth.login');
        }
    }
}

export default {
    id: module.id,
    templateName: 'auth/logoff',
    routingTable: { name: 'auth.logoff', path: '/logoff' },
    createPage:appContext => new AuthLogOffPage(appContext)
} as IPageRegistration;
