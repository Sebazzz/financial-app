import ApiBase from 'AppFramework/ServerApi/ApiBase';
import { IAuthenticationInfo } from 'AppFramework/ServerApi/Authentication';
import * as dto from './User';

export type DateTime = Date;

export interface IAppImpersonateUserListing extends dto.IAppUserListing {
    activeSince: DateTime;
}

export interface IAppSecurityTokenModel {
    securityToken: string;
}

export interface IAppOutstandingImpersonation extends IAppSecurityTokenModel {
    creationDate: DateTime;
}

export class Api extends ApiBase {
    public getListing(): Promise<IAppImpersonateUserListing[]> {
        return this.httpClient.get('/api/user/impersonate');
    }

    public getOutstandingImpersonations(): Promise<IAppOutstandingImpersonation[]> {
        return this.httpClient.get('/api/user/impersonate/outstanding');
    }

    public deleteOutstandingImpersonation(securityToken: string): Promise<void> {
        return this.httpClient.delete('/api/user/impersonate/outstanding', { securityToken });
    }

    public impersonate(id: number): Promise<IAuthenticationInfo> {
        return this.httpClient.post(`/api/user/impersonate/${id}`);
    }

    public createImpersonationInvite(): Promise<IAppOutstandingImpersonation> {
        return this.httpClient.post('/api/user/impersonate/create-invitation');
    }

    public completeImpersonationInvite(securityToken: string | null): Promise<IAppImpersonateUserListing> {
        return this.httpClient.post('/api/user/impersonate/complete-invitation', { securityToken });
    }
}
