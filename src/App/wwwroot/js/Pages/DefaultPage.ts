import {Page, IPageRegistration} from '../AppFramework/Page'
import AppContext from '../AppFramework/AppContext'
import * as ko from 'knockout';

class DefaultPage extends Page {
    public currentUserName = ko.pureComputed(() => this.appContext.authentication.currentAuthentication().userName);

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Welkom');
    }

    protected onActivate(args?: any): Promise<void> {
        return Promise.resolve();
    }
}

export default {
    name: 'DefaultPage',
    templateName: 'default',
    routingTable: { name: 'default', path: '/' },
    createPage: (appContext) => new DefaultPage(appContext)
} as IPageRegistration;