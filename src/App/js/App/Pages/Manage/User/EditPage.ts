import AppContext from 'AppFramework/AppContext';
import { PageModule } from 'AppFramework/Navigation/Page';
import FormPage from 'AppFramework/Forms/FormPage';
import * as user from 'App/ServerApi/User';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';
import * as mapper from 'AppFramework/ServerApi/Mapper';
import * as ko from 'knockout';

class EditPage extends FormPage {
    private api = new user.Api();

    public id = ko.observable<number>(0);
    public user = ko.observable<EditViewModel>(new EditViewModel());

    public isCurrentUser = ko.pureComputed(() => {
        const id = this.id(),
            currentUser = this.appContext.authentication.currentAuthentication();

        return id === currentUser.userId;
    });

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Gebruiker bewerken');

        this.save = this.save.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        if (args && args.id) {
            this.id(+args.id);

            this.title('Gebruiker bewerken');
            this.set(await this.api.get(this.id.peek()));
            this.title(`Gebruiker "${this.user().userName()}" bewerken`);
        } else {
            this.id(0);
            this.user(new EditViewModel());
            this.title('Gebruiker aanmaken');
        }
    }

    public async save(): Promise<void> {
        const user = this.user.peek();

        try {
            const serialized = ko.toJS(user) as user.IAppUserMutate,
                id = this.id.peek(),
                isNew = id === 0;

            if (isNew) {
                await this.api.create(serialized);
            } else {
                await this.api.update(id, serialized);
            }

            this.appContext.router.navigate('manage.user');
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, user)) {
                throw e;
            }
        }
    }

    private set(data: user.IAppUserListing): any {
        const vm = mapper.MapUtils.deserialize<EditViewModel>(EditViewModel, data);
        if (!vm) {
            throw new Error('Unable to deserialize server response: null');
        }

        this.user(vm);
    }
}

export class EditViewModel extends validate.ValidateableViewModel {
    public userName = ko.observable<string>();
    public email = ko.observable<string>();
    public currentPassword = ko.observable<string>();
    public newPassword = ko.observable<string>();
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/manage/user/edit.html'),
    createPage: appContext => new EditPage(appContext)
} as PageModule;
