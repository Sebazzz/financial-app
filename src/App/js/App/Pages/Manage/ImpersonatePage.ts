import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import confirmAsync from 'AppFramework/Forms/Confirmation';
import * as modal from 'AppFramework/Components/Modal';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';
import { IFormPage } from 'AppFramework/Forms/FormPage';
import { AsyncDataSource } from 'AppFramework/Utils/AsyncDataSource';

import * as userImpersonate from 'App/ServerApi/UserImpersonate';
import * as ko from 'knockout';

class ImpersonatePage extends Page {
    private api = new userImpersonate.Api();

    public isImpersonated = ko.pureComputed(
        () => !!this.appContext.authentication.currentAuthentication().previousActiveOwnedGroupId
    );

    public users = ko.observableArray<userImpersonate.IAppImpersonateUserListing>();
    public outstandingImpersonations = new AsyncDataSource(() => this.api.getOutstandingImpersonations());
    public allowedImpersonations = new AsyncDataSource(() => this.api.getAllowedImpersonations());

    public createdSecurityTokenModal = new modal.ModalController<userImpersonate.IAppOutstandingImpersonation>(
        'Aangemaakte uitnodigingscode',
        null,
        'Sluiten'
    );
    public completeImpersonationInviteModal = new modal.ModalController<CompleteImpersonationModel>(
        'Uitnodigingscode invoeren'
    );

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Account wisselen');

        this.impersonate = this.impersonate.bind(this);
        this.deleteOutstandingImpersonation = this.deleteOutstandingImpersonation.bind(this);
        this.deleteAllowedImpersonation = this.deleteAllowedImpersonation.bind(this);
        this.createImpersonationInvite = this.createImpersonationInvite.bind(this);
        this.invokeCompleteImpersonationInvite = this.invokeCompleteImpersonationInvite.bind(this);
    }

    protected async onActivate(): Promise<void> {
        await this.refreshUserListing();
    }

    private async refreshOutstandingImpersonations() {
        this.outstandingImpersonations.reload();
    }

    private async refreshUserListing() {
        this.users(await this.api.getListing());
    }

    private refreshAllowedImpersonations() {
        this.allowedImpersonations.reload();
    }

    public async impersonate(userInfo: userImpersonate.IAppImpersonateUserListing) {
        await this.appContext.authentication.impersonate(userInfo.id);
        this.appContext.router.navigateToDefault();
    }

    public async deleteOutstandingImpersonation(item: userImpersonate.IAppOutstandingImpersonation) {
        if (
            await confirmAsync(
                'Weet je zeker dat je deze uitnodiging wilt verwijderen?',
                'Uitnodiging verwijderen',
                true
            )
        ) {
            await this.api.deleteOutstandingImpersonation(item.securityToken);

            this.refreshOutstandingImpersonations();
        }
    }

    public async deleteAllowedImpersonation(item: userImpersonate.IAppAllowedImpersonation) {
        if (
            await confirmAsync('Weet je zeker dat je deze toestemming wilt intrekken?', 'Toestemming intrekken', true)
        ) {
            await this.api.deleteAllowedImpersonation(item.securityToken);

            this.refreshAllowedImpersonations();
        }
    }

    public async createImpersonationInvite() {
        if (!(await confirmAsync('Hiermee kan je een andere gebruiker toegang geven tot je account. Doorgaan?'))) {
            return;
        }

        const model = await this.api.createImpersonationInvite();
        this.refreshOutstandingImpersonations();

        await this.createdSecurityTokenModal.showDialog(model);
    }

    public async invokeCompleteImpersonationInvite() {
        await this.completeImpersonationInviteModal.showDialog(
            new CompleteImpersonationModel(this.completeImpersonationInviteModal)
        );
        await this.refreshUserListing();
    }
}

class CompleteImpersonationModel extends validate.ValidateableViewModel implements IFormPage {
    private api = new userImpersonate.Api();

    public securityToken = ko.observable<string | null>(null);

    public errorMessage = ko.observable<string | null>(null);
    public isBusy = ko.observable<boolean>(false);

    constructor(private controller: modal.ModalController<CompleteImpersonationModel>) {
        super();

        this.save = this.save.bind(this);
    }

    public async save(): Promise<void> {
        try {
            await this.api.completeImpersonationInvite(this.securityToken.peek());

            this.controller.closeDialog();
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, this)) {
                throw e;
            }
        }
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/manage/impersonate.html'),
    createPage: appContext => new ImpersonatePage(appContext)
} as PageModule;
