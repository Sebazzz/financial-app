import { default as ApiBase, ICreatedResult } from 'AppFramework/ServerApi/ApiBase';
import { SortOrderMutationType } from './RecurringSheetEntry';

export type DateTime = string;
export { SortOrderMutationType };

export interface ISheetEntry {
    id: number;
    categoryId: number;
    templateId: number | null;

    delta: number;

    source: string;
    remark: string | null;

    sortOrder: number;

    updateTimestamp: DateTime;
    createTimestamp: DateTime;

    isNewSinceLastVisit: boolean;

    account: AccountType;

    tags: number[];
}

export enum AccountType {
    Invalid = 0,

    BankAccount = 1,

    SavingsAccount = 2
}

export class Api extends ApiBase {
    public setContext(year: number, month: number) {
        this.baseUrl = `/api/sheet/${year}-${month}/entries`;
    }

    public delete(id: number) {
        return this.execDelete<void>(id);
    }

    public get(number: number) {
        return this.execGet<ISheetEntry>(number);
    }

    public create(entity: ISheetEntry) {
        return this.execPost<ICreatedResult<ISheetEntry>>(null, entity);
    }

    public update(id: number, entity: ISheetEntry) {
        return this.execPut<void>(id, entity);
    }

    public mutateOrder(id: number, mutation: SortOrderMutationType) {
        const mutationString = SortOrderMutationType[mutation].toLowerCase(),
            url = `${id}/order/${mutationString}`;

        return this.execPost<void>(url);
    }
}
