import ApiBase from 'AppFramework/ServerApi/ApiBase';

export interface ISheetGlobalStatistics {
    totalExpenses: number;
    totalSavings: number;
    totalIncome: number;
    sheetSubject: Date;
    categoryStatistics: ISheetCategoryStatistics[];
}

export interface ISheetCategoryStatistics {
    categoryName: string;
    delta: number;
}

export interface IReport {
    income: IReportDigest;
    expenses: IReportDigest;
}

export interface IReportDigest {
    labels: string[];
    dataSets: IReportDataSet[];
}

export interface IReportDataSet {
    label: string;
    data: number[];
}

export class Api extends ApiBase {
    public setContext(year: number, month: number) {
        this.baseUrl = `/api/sheet/${year}-${month}`;
    }

    public get() {
        return this.execGet<ISheetGlobalStatistics>('statistics');
    }

    public getChart() {
        return this.execGet<IReport>('statistics/chart');
    }

    public getGlobalStatistics() {
        return this.httpClient.get<IReport>('/api/sheet/statistics');
    }
}
