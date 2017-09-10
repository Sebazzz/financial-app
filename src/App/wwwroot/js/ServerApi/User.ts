import ApiBase from '../AppFramework/ServerApi/ApiBase';

export interface IAppUserListing {
    email : string;
    userName: string;
    id : number;
}

export interface IAppUserMutate extends IAppUserListing {
    currentPassword:string;
    newPassword: string;
}

export class Api extends ApiBase {
    public list(): Promise<Array<IAppUserListing>> {
        return this.httpClient.get('/api/user');
    }

    public delete(id: number) : Promise<void> {
        return this.httpClient.delete(`/api/user/${id}`);
    }
}