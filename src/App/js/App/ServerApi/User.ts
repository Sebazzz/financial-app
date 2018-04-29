import { default as ApiBase, ICreatedResult } from 'AppFramework/ServerApi/ApiBase';

export interface IAppUserListing {
    email: string;
    userName: string;
    id: number;
}

export interface IAppUserMutate extends IAppUserListing {
    currentPassword: string;
    newPassword: string;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/user';
    }

    public list() {
        return this.execGet<IAppUserListing[]>();
    }

    public delete(id: number) {
        return this.execDelete<void>(id);
    }

    public get(number: number) {
        return this.execGet<IAppUserListing>(number);
    }

    public create(entity: IAppUserMutate) {
        return this.execPost<ICreatedResult<IAppUserListing>>(null, entity);
    }

    public update(id: number, entity: IAppUserMutate) {
        return this.execPut<void>(id, entity);
    }
}
