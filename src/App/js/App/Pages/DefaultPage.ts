import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';

class DefaultPage extends Page {
    public currentUserName = ko.pureComputed(() => this.appContext.authentication.currentAuthentication().userName);
    public isImpersonated = ko.pureComputed(
        () => !!this.appContext.authentication.currentAuthentication().previousActiveOwnedGroupId
    );
    public currentGroupName = ko.pureComputed(
        () => this.appContext.authentication.currentAuthentication().currentGroupName
    );

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Welkom');

        this.exitImpersonation = this.exitImpersonation.bind(this);
    }

    protected onActivate(): Promise<void> {
        return Promise.resolve();
    }

    public async exitImpersonation() {
        const previousActiveOwnedGroupId = this.appContext.authentication.currentAuthentication()
            .previousActiveOwnedGroupId;
        if (previousActiveOwnedGroupId) {
            await this.appContext.authentication.changeActiveGroup(previousActiveOwnedGroupId);
        }
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/default.html'),
    createPage: appContext => new DefaultPage(appContext)
} as PageModule;
