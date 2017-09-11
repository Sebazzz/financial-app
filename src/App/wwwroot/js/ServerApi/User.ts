import { default as ApiBase, ICreatedResult} from '../AppFramework/ServerApi/ApiBase';

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
        return this.httpClient.delete<void>(`/api/user/${id}`);
    }

    public get(number: number): Promise<IAppUserListing> {
        return this.httpClient.get(`/api/user/${number}`);
    }

    public create(user: IAppUserMutate): Promise<ICreatedResult<IAppUserListing>> {
        return this.httpClient.post('/api/user', user);
    }

    public update(id: number, user: IAppUserMutate) : Promise<void> {
        return this.httpClient.put(`/api/user/${id}`, user);
    }
}