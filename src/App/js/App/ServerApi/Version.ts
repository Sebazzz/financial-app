import ApiBase from 'AppFramework/ServerApi/ApiBase';

export interface IVersionInfo {
    appVersionId: string;
    appVersion: string;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/version';
    }

    public get() {
        return this.execGet<IVersionInfo>();
    }
}
