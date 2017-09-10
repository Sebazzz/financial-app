import { Page } from '../../../AppFramework/Page'
import AppContext from '../../../AppFramework/AppContext'

export default class EditPage extends Page {
    constructor(appContext: AppContext) {
        super(appContext);

        this.templateName = 'UserEdit';
        this.routes = [
                { name: 'manage.user.edit', path: '/edit/:id' },
                { name: 'manage.user.create', path: '/create'}
            ];
    }

    protected async onActivate(args?: any): Promise<void> {
    }
} 