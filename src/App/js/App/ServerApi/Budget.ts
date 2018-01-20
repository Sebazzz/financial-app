import { default as ApiBase } from 'AppFramework/ServerApi/ApiBase';

export interface IBudget {
    rows: ICategoryBudgetRow[];
    totals: IBudgetRow;
}

export interface IBudgetRow {
    currentMonth: number;
    lastMonth: number;
    averageSixMonths: number;
    totalSixMonths: number;
    averageYear: number;
    totalYear: number;
}

export interface ICategoryBudgetRow extends IBudgetRow {
    categoryId: number;
    categoryName: string;

    monthlyBudget: number;
    isOverBudget: boolean;
}

export interface ITotalBudgetRow extends IBudgetRow {
    budgetTotal: number;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/budget';
    }

    public get(year: number, month: number) {
        return this.execGet<IBudget>(`anchor/${year}-${month}`);
    }
}
