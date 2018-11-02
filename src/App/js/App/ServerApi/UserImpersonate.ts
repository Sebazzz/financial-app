import ApiBase from 'AppFramework/ServerApi/ApiBase';
import { IAuthenticationInfo } from 'AppFramework/ServerApi/Authentication';
import * as dto from './User';

export type DateTime = Date;

export interface IAppImpersonateUserListing extends dto.IAppUserListing {
    activeSince: DateTime;
    groupId: number;
}

export interface IAppSecurityTokenModel {
    securityToken: string;
}

export interface IAppOutstandingImpersonation extends IAppSecurityTokenModel {
    creationDate: DateTime;
}

export interface IAppAllowedImpersonation extends IAppSecurityTokenModel, IAppImpersonateUserListing {}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/user/impersonate';
    }

    public getListing(): Promise<IAppImpersonateUserListing[]> {
        return this.execGet();
    }

    public getAllowedImpersonations(): Promise<IAppAllowedImpersonation[]> {
        return this.execGet('allowed-impersonation');
    }

    public deleteAllowedImpersonation(securityToken: string): Promise<void> {
        return this.execDelete('allowed-impersonation', { securityToken });
    }

    public getOutstandingImpersonations(): Promise<IAppOutstandingImpersonation[]> {
        return this.execGet('outstanding');
    }

    public deleteOutstandingImpersonation(securityToken: string): Promise<void> {
        return this.execDelete('outstanding', { securityToken });
    }

    public impersonate(id: number): Promise<IAuthenticationInfo> {
        return this.execPost(`${id}`);
    }

    public createImpersonationInvite(): Promise<IAppOutstandingImpersonation> {
        return this.execPost('create-invitation');
    }

    public completeImpersonationInvite(securityToken: string | null): Promise<IAppImpersonateUserListing> {
        return this.execPost('complete-invitation', { securityToken });
    }
}
