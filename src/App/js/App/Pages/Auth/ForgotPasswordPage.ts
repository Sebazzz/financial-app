import { PageModule } from 'AppFramework/Navigation/Page';
import FormPage from 'AppFramework/Forms/FormPage';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';
import { Api as AuthApi } from 'AppFramework/ServerApi/Authentication';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';

class ForgotPasswordModel extends validate.ValidateableViewModel {
    public user = ko.observable<string>();
}

class AuthForgotPasswordPage extends FormPage {
    private api = new AuthApi();

    public model = new ForgotPasswordModel();

    public success = ko.observable<boolean>(false);

    public errorMessage = ko.observable<string | null>(null);

    public disableForm = ko.pureComputed(() => this.isBusy() || this.success());

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Wachtwoord vergeten');
    }

    protected async onActivate(args?: any): Promise<void> {
        if (await this.appContext.authentication.checkAuthentication()) {
            console.info('AuthForgotPasswordPage: We are logged in. Redirecting to home.');

            this.appContext.router.navigateToDefault();
        }

        this.model.user((args && args.user) || null);
    }

    public async save(viewModel: validate.ValidateableViewModel) {
        try {
            await this.api.forgotPassword({ user: this.model.user()! });

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
    template: import(/*webpackMode: "eager"*/ 'Template/auth/forgot-password.html'),
    createPage: appContext => new AuthForgotPasswordPage(appContext)
} as PageModule;
