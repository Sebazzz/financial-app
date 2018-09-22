import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import * as user from 'App/ServerApi/User';
import * as userImpersonate from 'App/ServerApi/UserImpersonate';
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
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/manage/impersonate.html'),
    createPage: appContext => new ImpersonatePage(appContext)
} as PageModule;
