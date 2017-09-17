import {Page, IPageRegistration} from '../../AppFramework/Page'
import AppContext from '../../AppFramework/AppContext'
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
        } finally {
            this.isBusy(false);
            this.appContext.router.navigateToDefault();
        }
    }
}

export default {
    name: 'AuthLogoff',
    templateName: 'auth/logoff',
    routingTable:{ name: 'auth.logoff', path: '/logoff' },
    createPage: (appContext) => new AuthLogOffPage(appContext)
} as IPageRegistration;