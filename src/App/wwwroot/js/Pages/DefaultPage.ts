import {Page} from '../AppFramework/Page'
import AppContext from '../AppFramework/AppContext'
import * as ko from 'knockout';

export default class DefaultPage extends Page {

    public currentUserName = ko.pureComputed(() => this.appContext.authentication.currentAuthentication().userName);

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Welkom');
        this.templateName = 'Default';
        this.routes = { name: 'default', path: '/' };
    }

    protected onActivate(args?: any): Promise<void> {
        return Promise.resolve();
    }
} 