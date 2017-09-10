import ApiBase from '../AppFramework/ServerApi/ApiBase';
import {IAuthenticationInfo} from '../AppFramework/ServerApi/Authentication';
import * as dto from './User'

export class Api extends ApiBase {
    public getListing(): Promise<Array<dto.IAppUserListing>> {
        return this.httpClient.get('/api/user/impersonate');
    }

    public impersonate(id: number): Promise<IAuthenticationInfo> {
        return this.httpClient.post(`/api/user/impersonate/${id}`);
    }
}