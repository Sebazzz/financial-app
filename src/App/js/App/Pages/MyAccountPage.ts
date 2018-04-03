import {Page, IPageRegistration} from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';
import * as account from 'AppFramework/ServerApi/Account';
import * as ko from 'knockout';
import confirmAsync from 'AppFramework/Forms/Confirmation';

class MyAccountPage extends Page {
    private api = new account.Api();
    private isRefreshing = false;

    public authInfo = ko.observable<account.IAccountInfo>();
    public twoFactorAuthentication: TwoFactorAuthenticationController;

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Mijn account');

        this.refresh = this.refresh.bind(this);
        this.twoFactorAuthentication = new TwoFactorAuthenticationController(this.refresh);
    }

    protected async onActivate(args?: any): Promise<void> {
        await this.refresh();
    }

    private async refresh() {
        if (this.isRefreshing) {
            return;
        }

        try {
            this.isRefreshing = true;

            this.authInfo(await this.api.getInfo());
            this.twoFactorAuthentication.twoFactorInfo(this.authInfo.peek().twoFactorAuthentication);

            ko.tasks.runEarly();
        } finally {
           this.isRefreshing = false;
        }
    }
}

class TwoFactorAuthenticationController {
    private api = new account.Api();

    public twoFactorInfo = ko.observable<account.IAccountTwoFactorInfo>();
    public isEnabling = ko.observable<boolean>(false);
    public isEnabled = ko.pureComputed(() => this.twoFactorInfo() && this.twoFactorInfo().isEnabled);
    public isBusy = ko.observable<boolean>(false);

    public preEnableInfo = ko.observable<account.ITwoFactorPreEnableInfo>();
    public twoFactorVerificationCode = ko.observable<string>();
    public errorMessage = ko.observable<string>();

    public recoveryCodes = ko.observable<string[]>();

    constructor(private refreshCallback: () => Promise<void>) {
        this.preEnable = this.preEnable.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.confirmEnable = this.confirmEnable.bind(this);
    }

    public preEnable(): void {
        this.isBusy(true);
        this.errorMessage(null);

        (async () => {
            try {
                this.preEnableInfo(await this.api.preEnable());

                this.isEnabling(true);
            } catch (e) {
                this.errorMessage('Dat is niet gelukt. Probeer het later opnieuw.');
            } finally {
                this.isBusy(false);
            }
        })();
    }

    public enable(): void {
        this.isBusy(true);
        this.errorMessage(null);

        (async () => {
            try {
                const response = await this.api.enable({verificationCode: this.twoFactorVerificationCode.peek() });

                this.recoveryCodes(response.recoveryCodes);

                await this.refreshCallback();
                this.isEnabling(false);
            } catch (e) {
                console.log(e);

                this.errorMessage('Dit lijkt niet de correcte code te zijn. Controleer de tijd van je mobiele telefoon en probeer het opnieuw.');
            } finally {
                this.isBusy(false);
            }
        })();
    }

    public disable(): void {
        this.isBusy(true);

        (async () => {
            try {
                if (await confirmAsync('Weet je zeker dat je verificatie in twee stappen wilt uitschakelen? Hierdoor wordt je account onveiliger.', 'Verificatie in twee stappen uitschakelen', true, 'Ja', 'Annuleren')) {
                    await this.api.disable();

                    await this.refreshCallback();
                }
            } catch (e) {
                this.errorMessage('Het is niet gelukt om verificatie in twee stappen uit te schakelen. Probeer het later opnieuw.');
            } finally {
                this.isBusy(false);
            }
        })();
    }

    public confirmEnable(): void {
        this.recoveryCodes(null);
    }
}

export default {
    id: module.id,
    templateName: 'my-account',
    routingTable: { name: 'my-account', path: '/my-account' },
    createPage: appContext => new MyAccountPage(appContext)
} as IPageRegistration;
