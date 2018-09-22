import { PageModule } from 'AppFramework/Navigation/Page';
import FormPage from 'AppFramework/Forms/FormPage';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';
import { Api as AuthApi } from 'AppFramework/ServerApi/Authentication';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';

class ConfirmEmailModel extends validate.ValidateableViewModel {
    public key = ko.observable<string>(null);
    public token = '';
}

class AuthConfirmEmailModelPage extends FormPage {
    private api = new AuthApi();

    public model = new ConfirmEmailModel();

    public success = ko.observable<boolean>(false);

    public errorMessage = ko.observable<string>(null);

    public disableForm = ko.pureComputed(() => this.isBusy() || this.success());

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('E-mail adres bevestigen');
    }

    protected async onActivate(args?: any): Promise<void> {
        if (await this.appContext.authentication.checkAuthentication()) {
            console.info('AuthConfirmEmailModelPage: We are logged in. Redirecting to home.');

            this.appContext.router.navigateToDefault();
        }

        this.model.key((args && args.key) || null);
        this.model.token = (args && args.token) || null;
    }

    public async save(viewModel: validate.ValidateableViewModel) {
        try {
            await this.api.confirmEmail({
                key: this.model.key()!,
                token: this.model.token
            });

            this.success(true);
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, viewModel)) {
                throw e;
            }
        }
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/auth/confirm-email.html'),
    createPage: appContext => new AuthConfirmEmailModelPage(appContext)
} as PageModule;
