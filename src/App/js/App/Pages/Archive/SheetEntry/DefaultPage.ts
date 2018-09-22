import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';

class DefaultPage extends Page {
    constructor(appContext: AppContext) {
        super(appContext);
    }

    protected async onActivate(args?: any): Promise<void> {}
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/default.html'),
    createPage: appContext => new DefaultPage(appContext)
} as PageModule;
