import ApiBase from './ApiBase';

export interface IAccountInfo {
    userName: string;
    email: string;
    groupName: string;

    twoFactorAuthentication: IAccountTwoFactorInfo;
}

export interface IAccountTwoFactorInfo {
    isEnabled: boolean;
    isAuthenticatorAppEnabled: boolean;
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

    public disable() {
        return this.execDelete('two-factor-authentication');
    }
}
