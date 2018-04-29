import { default as ApiBase, ICreatedResult } from 'AppFramework/ServerApi/ApiBase';
import { AccountType } from './SheetEntry';

export interface IRecurringSheetEntryListing {
    id: number;
    categoryId: number;
    categoryName: string;
    sortOrder: number;
    source: string;
    account: AccountType;
}

export interface IRecurringSheetEntry {
    id: number;
    categoryId: number;
    delta: number;
    sortOrder: number;
    source: string;
    remark: string | null;
    account: AccountType;
}

export enum SortOrderMutationType {
    Decrease = -1,
    Increase = 1
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/sheetentry-recurring';
    }

    public list() {
        return this.execGet<IRecurringSheetEntryListing[]>();
    }

    public delete(id: number) {
        return this.execDelete<void>(id);
    }

    public get(id: number) {
        return this.execGet<IRecurringSheetEntry>(id);
    }

    public create(entity: IRecurringSheetEntry) {
        return this.execPost<ICreatedResult<IRecurringSheetEntry>>(null, entity);
    }

    public update(id: number, entity: IRecurringSheetEntry) {
        return this.execPut<void>(id, entity);
    }

    public mutateOrder(id: number, mutation: SortOrderMutationType) {
        const mutationString = SortOrderMutationType[mutation].toLowerCase(),
            url = `${id}/order/${mutationString}`;

        return this.execPost<void>(url);
    }
}
