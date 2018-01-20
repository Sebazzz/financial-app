import {Page, IPageRegistration} from 'AppFramework/Page';
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
    templateName: 'default',
    routingTable: { name: 'manage', path: '/manage', forwardTo: 'default' },
    createPage:appContext => new DefaultPage(appContext)
} as IPageRegistration;
