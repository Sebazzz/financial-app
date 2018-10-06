import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';

class DefaultPage extends Page {
    public currentUserName = ko.pureComputed(() => this.appContext.authentication.currentAuthentication().userName);
    public currentGroupName = ko.pureComputed(
        () => this.appContext.authentication.currentAuthentication().currentGroupName
    );

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Welkom');
    }

    protected onActivate(): Promise<void> {
        return Promise.resolve();
    }
}

export default {
    id: module.id,
    template: {
        default: import(/*webpackMode: "eager"*/ 'Template/default.html'),
        mobile: import(/*webpackMode: "eager"*/ 'Template/default.mobile.html')
    },
    createPage: appContext => new DefaultPage(appContext)
} as PageModule;
