import ApiBase from './ApiBase';

export interface IAuthenticationInfo {
    userId: number;
    userName: string | null;
    isAuthenticated: boolean;
    isLockedOut: boolean;
    roles: string[];
}

export interface ILoginModel {
    userName: string;
    password: string;
    persistent: boolean;
}

export class Api extends ApiBase {
    public check(): Promise<IAuthenticationInfo> {
        return this.httpClient.get<IAuthenticationInfo>('/api/authentication/check');
    }

    public login(loginInfo: ILoginModel): Promise<IAuthenticationInfo> {
        return this.httpClient.post<IAuthenticationInfo>('/api/authentication/login', loginInfo);
    }

    public logoff(): Promise<IAuthenticationInfo> {
        return this.httpClient.post<IAuthenticationInfo>('/api/authentication/logoff');
    }
}
