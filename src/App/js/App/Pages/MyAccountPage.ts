import {Page, IPageRegistration} from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';
import * as account from 'AppFramework/ServerApi/Account';
import * as ko from 'knockout';

class MyAccountPage extends Page {
    private api = new account.Api();

    public authInfo = ko.observable<account.IAccountInfo>();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Mijn account');
    }

    protected async onActivate(args?: any): Promise<void> {
        this.authInfo(await this.api.getInfo());
    }
}

export default {
    id: module.id,
    templateName: 'my-account',
    routingTable: { name: 'my-account', path: '/my-account' },
    createPage: appContext => new MyAccountPage(appContext)
} as IPageRegistration;
