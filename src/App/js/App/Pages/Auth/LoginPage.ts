import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';
import { IAuthenticationInfo } from 'AppFramework/ServerApi/Authentication';

class AuthLoginPage extends Page {
    public userName = ko.observable<string | null>(null);
    public password = ko.observable<string | null>(null);
    public persist = ko.observable<boolean>(true);
    public rememberMachine = ko.observable<boolean>(false);

    public success = ko.observable<boolean>(false);

    public isBusy = ko.observable<boolean>(false);
    public errorMessage = ko.observable<string | null>(null);

    public returnUrl = ko.observable<string | null>(null);
    public returnUrlIsDefaultPage = ko.pureComputed(
        () => this.appContext.router.buildPath('default', {}) === this.returnUrl()
    );
    public needsLoginAfterRedirect = ko.pureComputed(
        () => !!this.returnUrl() && !this.returnUrlIsDefaultPage() && !this.errorMessage() && !this.success()
    );

    public requireTwoFactorAuthentication = ko.observable<boolean>(false);
    public twoFactorVerificationCode = ko.observable<string | null>(null);
    public isEnteringRecoveryCode = ko.observable<boolean>(false);

    public disableForm = ko.pureComputed(() => this.isBusy() || this.success());

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Inloggen');

        this.login = this.login.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        if (await this.appContext.authentication.checkAuthentication()) {
            console.info('LoginPage: We are logged in. Redirecting to home.');

            this.appContext.router.navigateToDefault();
        }

        this.returnUrl(args && args.returnUrl ? args.returnUrl : null);
    }

    public async login() {
        this.isBusy(true);
        this.errorMessage(null);

        try {
            const result = await this.appContext.authentication.authenticate(
                this.userName.peek()!,
                this.password.peek()!,
                this.persist.peek()
            );

            if (result.isTwoFactorAuthenticationRequired) {
                this.requireTwoFactorAuthentication(true);
                return;
            }

            this.errorMessage(
                result.isAuthenticated ? null : 'Sorry, we konden je gebruikersnaam of wachtwoord niet bevestigen.'
            );

            this.handleAuthenticationResult(result);
        } catch (e) {
            this.errorMessage('Sorry, we konden je gebruikersnaam of wachtwoord niet bevestigen.');
        } finally {
            this.isBusy(false);
        }
    }

    public async loginTwoFactorAuthentication() {
        this.isBusy(true);

        try {
            const verificationCode = this.twoFactorVerificationCode.peek()!;

            let result: IAuthenticationInfo;
            if (this.isEnteringRecoveryCode.peek()) {
                result = await this.appContext.authentication.authenticateTwoFactorRecover(verificationCode);
            } else {
                result = await this.appContext.authentication.authenticateTwoFactor(
                    verificationCode,
                    this.persist.peek(),
                    this.rememberMachine.peek()
                );
            }

            if (!result.isAuthenticated) {
                this.errorMessage('Deze verificatiecode is niet correct. Probeer het opnieuw.');
                return;
            }

            this.handleAuthenticationResult(result);
        } catch (e) {
            this.twoFactorVerificationCode(null);
            this.errorMessage('Voer een verificatiecode in uit je app');
        } finally {
            this.isBusy(false);
        }
    }

    public enableEnterRecoveryCode() {
        this.isEnteringRecoveryCode(true);
    }

    public cancelTwoFactorAuthentication() {
        this.requireTwoFactorAuthentication(false);
        this.errorMessage(null);
    }

    private handleAuthenticationResult(result: IAuthenticationInfo) {
        if (result.isLockedOut) {
            this.errorMessage(
                'Je bent tijdelijk uitgesloten van het systeem. Probeer over 15 minuten opnieuw in te loggen.'
            );
        }

        if (result.isAuthenticated) {
            this.errorMessage(null);
            this.success(true);

            setTimeout(() => {
                const router = this.appContext.router,
                    returnUrl = this.returnUrl();

                if (returnUrl) {
                    const state = router.matchPath(returnUrl);
                    if (state) {
                        router.navigate(state.name, state.params);
                        return;
                    }
                }

                router.navigateToDefault();
            }, 1000);
        }
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/auth/login.html'),
    createPage: appContext => new AuthLoginPage(appContext)
} as PageModule;
