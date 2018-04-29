import { Page, IPageRegistration } from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';
import * as user from '../../../ServerApi/User';
import * as ko from 'knockout';
import confirmAsync from 'AppFramework/Forms/Confirmation';
class DefaultPage extends Page {
    private api = new user.Api();

    public users = ko.observableArray<user.IAppUserListing>();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Gebruikers');

        this.deleteUser = this.deleteUser.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        this.users(await this.api.list());
    }

    public async deleteUser(user: user.IAppUserListing) {
        if (
            await confirmAsync(`Weet je zeker dat je ${user.userName} wilt verwijderen?`, 'Gebruiker verwijderen', true)
        ) {
            await this.api.delete(user.id);
            this.users.remove(user);
        }
    }
}

export default {
    id: module.id,
    templateName: 'manage/user/default',
    routingTable: { name: 'manage.user', path: '/user' },
    createPage: appContext => new DefaultPage(appContext)
} as IPageRegistration;
