﻿import { default as ApiBase, ICreatedResult } from '../AppFramework/ServerApi/ApiBase';

export interface IRecurringSheetEntryListing {
    id : number;
    categoryId : number;
    categoryName: string;
    sortOrder : number;
    source : string;
    account: AccountType;
}

export interface IRecurringSheetEntry {
    id : number;
    categoryId : number;
    delta: number;
    sortOrder : number;
    source : string;
    remark : string;
    account: AccountType;
}

export enum AccountType {
    Invalid = 0,

    BankAccount = 1,

    SavingsAccount = 2
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
        return this.execGet<Array<IRecurringSheetEntryListing>>();
    }

    public delete(id: number) {
        return this.execDelete<void>(id);
    }

    public get(number: number) {
        return this.execGet<IRecurringSheetEntry>(number);
    }

    public create(entity: IRecurringSheetEntry) {
        return this.execPost<ICreatedResult<IRecurringSheetEntry>>(null, entity);
    }

    public update(id: number, entity: IRecurringSheetEntry) {
        return this.execPut<void>(id, entity);
    }

    public mutateOrder(id: number, mutation: SortOrderMutationType) {
        const mutationString = SortOrderMutationType[mutation],
              url = `order/${mutationString}/${id}`;

        return this.execPost<void>(url);
    }
}