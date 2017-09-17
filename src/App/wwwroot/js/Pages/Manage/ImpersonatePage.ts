import {Page, IPageRegistration} from '../../AppFramework/Page'
import AppContext from '../../AppFramework/AppContext'
import * as user from '../../ServerApi/User';
import * as userImpersonate from '../../ServerApi/UserImpersonate';
import * as ko from 'knockout';

class ImpersonatePage extends Page {
    private api = new userImpersonate.Api();

    public users = ko.observableArray<user.IAppUserListing>();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Account wisselen');

        this.impersonate = this.impersonate.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        this.users(await this.api.getListing());
    }

    public async impersonate(userInfo: user.IAppUserListing) {
        const info = await this.api.impersonate(userInfo.id);
        this.appContext.authentication.currentAuthentication(info);
        this.appContext.router.navigateToDefault();
    }
}

export default {
    name: 'ManageImpersonate',
    templateName: 'manage/impersonate',
    routingTable: { name: 'manage.impersonate', path: '/impersonate' },
    createPage: (appContext) => new ImpersonatePage(appContext)
} as IPageRegistration;