import { PageModule } from 'AppFramework/Navigation/Page';
import FormPage from 'AppFramework/Forms/FormPage';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';
import { Api as AuthApi } from 'AppFramework/ServerApi/Authentication';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';

class ResetPasswordModel extends validate.ValidateableViewModel {
    public newPassword = ko.observable<string | null>(null);
    public newPasswordConfirm = ko.observable<string | null>(null);

    public key: string = '';
    public token: string = '';
}

class AuthResetPasswordPage extends FormPage {
    private api = new AuthApi();

    public model = new ResetPasswordModel();

    public success = ko.observable<boolean>(false);
    public isTokenValid = ko.observable<boolean>(false);

    public errorMessage = ko.observable<string | null>(null);

    public disableForm = ko.pureComputed(() => this.isBusy() || this.success());

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Wachtwoord vergeten');
    }

    protected async onActivate(args?: any): Promise<void> {
        if (await this.appContext.authentication.checkAuthentication()) {
            console.info('AuthResetPasswordPage: We are logged in. Redirecting to home.');

            this.appContext.router.navigateToDefault();
        }

        this.model.key = args && args.key;
        this.model.token = args && args.token;

        try {
            await this.api.resetTokenValidate({
                key: this.model.key,
                token: this.model.token
            });

            this.isTokenValid(true);
        } catch (e) {
            console.error(e);

            this.isTokenValid(false);
        }
    }

    public async save(viewModel: validate.ValidateableViewModel) {
        try {
            await this.api.resetPassword({
                key: this.model.key,
                token: this.model.token,
                newPassword: this.model.newPassword()!,
                newPasswordConfirm: this.model.newPasswordConfirm()!
            });

            this.success(true);

            window.setTimeout(() => this.appContext.router.navigateToDefault(), 1500);
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
    template: import(/*webpackMode: "eager"*/ 'Template/auth/reset-password.html'),
    createPage: appContext => new AuthResetPasswordPage(appContext)
} as PageModule;
