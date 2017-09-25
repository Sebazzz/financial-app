import { default as ApiBase } from 'AppFramework/ServerApi/ApiBase';
import { IRecurringSheetEntry } from './RecurringSheetEntry';
import { ISheetEntry } from './SheetEntry';

export type DateTime = Date;
export type Decimal = number;
export { IRecurringSheetEntry };

export interface ISheetListing {
    month: number;
    year: number;
    name: string|null;

    updateTimestamp: DateTime;
    createTimestamp: DateTime; 

    totals: {
        savingAccount: Decimal | null;
        bankAccount: Decimal | null;
    };
}

export interface ISheet {
    id: number;

    subject: DateTime;
    name: string | null;

    updateTimestamp: DateTime; 
    createTimestamp: DateTime;

    entries: ISheetEntry[];
    applicableTemplates: IRecurringSheetEntry[];

    offset: {
        savingsAccountOffset: Decimal|null;
        bankAccountOffset: Decimal|null;
    }
}

export interface ISheetGlobalStatistics {
    totalExpenses: Decimal;
    totalSavings: Decimal;
    totalIncome: Decimal;
    sheetSubject: DateTime;
    categoryStatistics: ISheetCategoryStatistics[];
}

export interface ISheetCategoryStatistics {
    categoryName: string;
    delta: Decimal;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/sheet';
    }

    public list() {
        return this.execGet<Array<ISheetListing>>();
    }

    public get(number: number) {
        return this.execGet<ISheet>(number);
    }

    public getBySubject(year: number, month: number) {
        return this.execGet<ISheet>(`${year}-${month}`);
    }

    public getAllStatistics() {
        return this.execGet<Array<ISheetGlobalStatistics>>();
    }
}