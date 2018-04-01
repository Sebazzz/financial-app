import ApiBase from './ApiBase';

export interface IAccountInfo {
    userName: string;
    email: string;
    groupName: string;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/account';
    }

    public getInfo() {
        return this.execGet<IAccountInfo>('my-info');
    }
}
