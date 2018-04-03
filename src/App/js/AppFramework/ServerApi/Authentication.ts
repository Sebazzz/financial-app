import ApiBase from './ApiBase';

export interface IAuthenticationInfo {
    userId: number;
    userName: string | null;
    isAuthenticated: boolean;
    isLockedOut: boolean;
    isTwoFactorAuthenticationRequired: boolean;
    roles: string[];
}

export interface ILoginModel {
    userName: string;
    password: string;
    persistent: boolean;
}

export interface ILoginTwoFactorAuthenticationModel {
    persistent: boolean;
    isRecoveryCode: boolean;
    verificationCode: string;
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

    public loginTwoFactorAuthentication(parameters: ILoginTwoFactorAuthenticationModel) {
        return this.httpClient.post<IAuthenticationInfo>('/api/authentication/login-two-factor-authentication', parameters);
    }
}
