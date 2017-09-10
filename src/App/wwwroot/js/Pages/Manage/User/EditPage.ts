import { Page } from '../../../AppFramework/Page'
import AppContext from '../../../AppFramework/AppContext'

export default class EditPage extends Page {
    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Gebruiker bewerken');
        this.templateName = 'UserEdit';
        this.routes = [
                { name: 'manage.user.edit', path: '/edit/:id' },
                { name: 'manage.user.add', path: '/add'}
            ];
    }

    protected async onActivate(args?: any): Promise<void> {
    }
} 