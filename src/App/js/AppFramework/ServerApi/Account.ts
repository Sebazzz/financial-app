import ApiBase from './ApiBase';

export interface IAvailableGroup {
    id: number;
    name: string;
}

export interface IAccountInfo {
    userName: string;
    email: string;

    currentGroupId: number;
    currentGroupName: string;
    availableGroups: IAvailableGroup[];

    twoFactorAuthentication: IAccountTwoFactorInfo;
    lastLoginEvents: ILoginEvent[];
}

export interface ILoginEvent {
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}

export interface IAccountTwoFactorInfo {
    isEnabled: boolean;
    isAuthenticatorAppEnabled: boolean;
    recoveryCodeCount: number;
}

export interface ITwoFactorPreEnableInfo {
    qrCode: string;
    secretKey: string;
}

export interface ITwoFactorEnableInput {
    verificationCode: string;
}

export interface ITwoFactorRecoveryCodes {
    recoveryCodes: string[];
}

export interface IChangePasswordModel {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
}

// tslint:disable-next-line:no-empty-interface
export interface IPreferencesModel {
    // Extended elsewhere
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/account';
    }

    public getInfo() {
        return this.execGet<IAccountInfo>('my-info');
    }

    public preEnable() {
        return this.execPost<ITwoFactorPreEnableInfo>('two-factor-authentication/pre-enable');
    }

    public enable(input: ITwoFactorEnableInput) {
        return this.execPost<ITwoFactorRecoveryCodes>('two-factor-authentication', input);
    }

    public resetRecoveryKeys() {
        return this.execPost<ITwoFactorRecoveryCodes>('two-factor-authentication/reset-recovery-keys');
    }

    public disable() {
        return this.execDelete('two-factor-authentication');
    }

    public changePassword(input: IChangePasswordModel) {
        return this.execPost('change-password', input);
    }

    public getPreferences<T extends IPreferencesModel>() {
        return this.execGet<T>('preferences');
    }

    public setPreferences<T extends IPreferencesModel>(preferences: T) {
        return this.execPut<T>('preferences', preferences);
    }
}
