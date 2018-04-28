import {Page, IPageRegistration} from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';
import * as account from 'AppFramework/ServerApi/Account';
import * as modal from 'AppFramework/Components/Modal';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';
import {IFormPage} from 'AppFramework/Forms/FormPage';
import confirmAsync from 'AppFramework/Forms/Confirmation';

import {IPreferencesModel} from 'App/ServerApi/Account';
import * as ko from 'knockout';

class MyAccountPage extends Page {
    private api = new account.Api();
    private isRefreshing = false;

    public authInfo = ko.observable<account.IAccountInfo>();
    public twoFactorAuthentication: TwoFactorAuthenticationController;

    public changePasswordModal = new modal.ModalController<ChangePasswordModel>('Wachtwoord wijzigen');

    public preferences = new PreferencesModel();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Mijn account');

        this.refresh = this.refresh.bind(this);
        this.invokePasswordChange = this.invokePasswordChange.bind(this);

        this.twoFactorAuthentication = new TwoFactorAuthenticationController(this.refresh);
    }

    protected async onActivate(args?: any): Promise<void> {
        await Promise.all([
            this.refresh(),
            this.preferences.load()
        ]);
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

    public invokePasswordChange() {
        this.changePasswordModal.showDialog(new ChangePasswordModel(this.changePasswordModal));
    }
}

class PreferencesModel extends validate.ValidateableViewModel implements IFormPage {
    private api = new account.Api();

    public isBusy = ko.observable<boolean>();
    public saveSuccess = ko.observable<boolean>();
    public errorMessage = ko.observable<string>();

    public enableMonthlyDigest = ko.observable<boolean>();

    public async save(): Promise<void> {
        try {
            this.saveSuccess(false);

            const data: IPreferencesModel = {
                enableMonthlyDigest: this.enableMonthlyDigest.peek()
            };

            await this.api.setPreferences(data);

            this.saveSuccess(true);
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, this)) {
                throw e;
            }
        }
    }

    public async load() {
        const data = await this.api.getPreferences<IPreferencesModel>();

        this.enableMonthlyDigest(data.enableMonthlyDigest);
    }

    constructor() {
        super();

        this.save = this.save.bind(this);
    }
}

class ChangePasswordModel extends validate.ValidateableViewModel implements IFormPage {
    private api = new account.Api();

    public currentPassword = ko.observable<string>();
    public newPassword = ko.observable<string>();
    public newPasswordConfirm = ko.observable<string>();
    public errorMessage = ko.observable<string>();

    public isBusy = ko.observable<boolean>();

    constructor(private controller: modal.ModalController<ChangePasswordModel>) {
        super();

        this.save = this.save.bind(this);
    }

    public async save(): Promise<void> {
        try {
            await this.api.changePassword({currentPassword: this.currentPassword.peek(), newPassword: this.newPassword.peek(), newPasswordConfirm: this.newPasswordConfirm.peek()});

            this.controller.closeDialog();
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, this)) {
                throw e;
            }
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
    public justEnabledTwoFactorAuthentication = ko.observable<boolean>(false);

    public recoveryKeysDisplayModal = new modal.ModalController<RecoveryKeysModel>('Nieuwe herstelsleutels', 'Sluiten', null);

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
                this.justEnabledTwoFactorAuthentication(true);

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
        this.justEnabledTwoFactorAuthentication(false);
    }

    public generateNewRecoveryKeys() {
        this.isBusy(true);

        (async () => {
            try {
                if (await confirmAsync('Weet je zeker dat je nieuwe herstelsleutels wilt genereren? Je bestaande herstelsleutels worden dan ongeldig.', 'Nieuwe herstelsleutels maken', true, 'Ja', 'Nee')) {
                    const model = new RecoveryKeysModel();

                    const resultAwaitable = this.api.resetRecoveryKeys(),
                          modalDialog = this.recoveryKeysDisplayModal.showDialog(model);

                    model.recoveryKeys((await resultAwaitable).recoveryCodes);

                    await Promise.all([modalDialog, this.refreshCallback()]);
                }
            } catch (e) {
                console.error(e);
                this.errorMessage('Het is niet gelukt om nieuwe herstelsleutels te genereren. Probeer het later opnieuw.');
            } finally {
                this.isBusy(false);
            }
        })();
    }
}

export class RecoveryKeysModel {
    public recoveryKeys = ko.observable<string[]>();
}

export default {
    id: module.id,
    templateName: 'my-account',
    routingTable: { name: 'my-account', path: '/my-account' },
    createPage: appContext => new MyAccountPage(appContext)
} as IPageRegistration;
