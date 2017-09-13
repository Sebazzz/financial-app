import {Page} from '../../AppFramework/Page'
import AppContext from '../../AppFramework/AppContext'

export default class DefaultPage extends Page {
    constructor(appContext: AppContext) {
        super(appContext);

        this.templateName = 'Default';
        this.routes = { name: 'manage', path: '/manage', forwardTo: 'default' };
    }

    protected onActivate(args?: any): Promise<void> {
        return Promise.resolve();
    }
} 