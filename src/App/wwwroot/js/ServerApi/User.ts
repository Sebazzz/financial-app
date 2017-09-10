export interface IAppUserListing {
    email : string;
    userName: string;
    id : number;
}

export interface IAppUserMutate extends IAppUserListing {
    currentPassword:string;
    newPassword: string;
}