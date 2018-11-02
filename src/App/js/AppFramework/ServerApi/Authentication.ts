import ApiBase from './ApiBase';

export interface IAuthenticationInfo {
    userId: number;
    userName: string | null;
    currentGroupName: string | null;
    previousActiveOwnedGroupId: number | null;
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
    rememberClient: boolean;
}

export interface IForgotPasswordModel {
    user: string;
}

export interface ITokenModel {
    key: string;
    token: string;
}

export interface IResetPasswordModel extends ITokenModel {
    newPassword: string;
    newPasswordConfirm: string;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/authentication';
    }

    public check(): Promise<IAuthenticationInfo> {
        return this.execGet<IAuthenticationInfo>('check');
    }

    public login(loginInfo: ILoginModel): Promise<IAuthenticationInfo> {
        return this.execPost<IAuthenticationInfo>('login', loginInfo);
    }

    public impersonate(id: number): Promise<IAuthenticationInfo> {
        return this.httpClient.post(`/api/user/impersonate/${id}`);
    }

    public changeActiveGroup(groupId: number): Promise<IAuthenticationInfo> {
        return this.execPost('change-active-group', { groupId });
    }

    public logoff(): Promise<IAuthenticationInfo> {
        return this.execPost<IAuthenticationInfo>('logoff');
    }

    public loginTwoFactorAuthentication(parameters: ILoginTwoFactorAuthenticationModel) {
        return this.execPost<IAuthenticationInfo>('login-two-factor-authentication', parameters);
    }

    public confirmEmail(parameters: ITokenModel) {
        return this.execPost('email-confirm', parameters);
    }

    public forgotPassword(parameters: IForgotPasswordModel) {
        return this.execPost('forgot-password', parameters);
    }

    public resetTokenValidate(parameters: ITokenModel) {
        return this.execPost('reset-password-validate', parameters);
    }

    public resetPassword(parameters: IResetPasswordModel) {
        return this.execPost('reset-password', parameters);
    }
}
