import ApiBase from '../AppFramework/ServerApi/ApiBase';

export interface ISheetGlobalStatistics {
    totalExpenses:number;
    totalSavings: number;
    totalIncome: number;
    sheetSubject: Date;
    categoryStatistics: ISheetCategoryStatistics[];
}

export interface ISheetCategoryStatistics {
    categoryName:string;
    delta: number;
}

export class Api extends ApiBase {
    public setContext(year: number, month: number) {
        this.baseUrl = `/api/sheet/${year}-${month}`;
    }

    public get() {
        return this.execGet<ISheetGlobalStatistics>('statistics');
    }
}