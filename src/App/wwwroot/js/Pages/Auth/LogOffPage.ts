import { Page } from '../../AppFramework/Page'
import AppContext from '../../AppFramework/AppContext'
import * as ko from 'knockout';

export default class AuthLogOffPage extends Page {
    public isBusy = ko.observable(false);

    constructor(appContext: AppContext) {
        super(appContext);

        this.templateName = 'AuthLogOff';
        this.routes = [
            { name: 'auth.logoff', path: '/logoff' }
        ];

        this.confirm = this.confirm.bind(this);
    }

    protected onActivate(args?: any): Promise<void> {
        return Promise.resolve();
    }

    public async confirm() {
        this.isBusy(true);

        try {
            await this.appContext.authentication.unauthenticate();
        } finally {
            this.isBusy(false);
            this.appContext.router.navigateToDefault();
        }
    }
} 