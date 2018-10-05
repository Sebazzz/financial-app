import { default as ApiBase, ICreatedResult } from 'AppFramework/ServerApi/ApiBase';

export interface ICategoryListing {
    id: number;
    name: string;
    description: string;
    canBeDeleted: boolean;
}

export interface ICategory {
    id: number;
    name: string;
    description: string | null;
    monthlyBudget: number | null;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/category';
    }

    public list() {
        return this.execGet<ICategoryListing[]>();
    }

    public delete(id: number) {
        return this.execDelete<void>(id);
    }

    public get(num: number) {
        return this.execGet<ICategory>(num);
    }

    public create(entity: ICategory) {
        return this.execPost<ICreatedResult<ICategory>>(null, entity);
    }

    public update(id: number, entity: ICategory) {
        return this.execPut<void>(id, entity);
    }
}
