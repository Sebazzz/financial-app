import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';

class DefaultPage extends Page {
    constructor(appContext: AppContext) {
        super(appContext);
    }

    protected onActivate(args?: any): Promise<void> {
        return Promise.resolve();
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/default.html'),
    createPage: appContext => new DefaultPage(appContext)
} as PageModule;
