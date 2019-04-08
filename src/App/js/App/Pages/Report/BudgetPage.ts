import AppContext from 'AppFramework/AppContext';
import { Page, PageModule } from 'AppFramework/Navigation/Page';
import { Format as DateFormat } from 'AppFramework/Internationalization/Date';

import * as sheet from 'App/ServerApi/Sheet';
import * as budget from 'App/ServerApi/Budget';
import * as ko from 'knockout';

class BudgetReportPage extends Page {
    private sheetApi = new sheet.Api();
    private budgetApi = new budget.Api();

    public preselectedDate: Date | null = null;
    public hasPreselectedDate = ko.pureComputed(() => this.preselectedDate !== null);

    public sheets = ko.observableArray<sheet.ISheetListing>();
    public budget = ko.observable<budget.IBudget | null>(null);

    public selectedSheet = ko.observable<sheet.ISheetListing>();
    public selectedDate = ko.pureComputed(() => {
        if (this.preselectedDate) {
            return this.preselectedDate;
        }

        const selectedSheet = this.selectedSheet();
        if (selectedSheet) {
            return new Date(selectedSheet.year, selectedSheet.month);
        }

        return null;
    });

    public currentSheetRoute = ko.pureComputed(() => {
        const date = this.preselectedDate as any,
            routeArgs = {
                month: date.getMonth() + 1,
                year: date.getFullYear()
            };

        return this.appContext.app.router.getRoute('archive.sheet', routeArgs);
    });

    public previousDate = ko.pureComputed(() => {
        // TODO: workaround TS bug https://github.com/Microsoft/TypeScript/issues/20215
        const date = new Date(this.preselectedDate as any);
        date.setMonth(date.getMonth() - 1);

        return date;
    });

    public previousSheetStatisticsRoute = ko.pureComputed(() => {
        const date = this.previousDate(),
            routeArgs = {
                month: date.getMonth() + 1,
                year: date.getFullYear()
            };

        return this.appContext.app.router.getRoute('archive.sheet.budget', routeArgs);
    });

    public nextDate = ko.pureComputed(() => {
        // TODO: workaround TS bug https://github.com/Microsoft/TypeScript/issues/20215
        const date = new Date(this.preselectedDate as any);
        date.setMonth(date.getMonth() + 1);

        return date;
    });

    public hasNextMonth = ko.pureComputed(() => {
        const now = new Date(),
            date = this.nextDate();

        return now > date;
    });

    public nextSheetStatisticsRoute = ko.pureComputed(() => {
        const date = this.nextDate(),
            routeArgs = {
                month: date.getMonth() + 1,
                year: date.getFullYear()
            };

        return this.appContext.app.router.getRoute('archive.sheet.budget', routeArgs);
    });

    public isBudgetLoading = ko.observable<boolean>(true);
    public isBudgetLoadError = ko.pureComputed(() => this.isBudgetLoading() === false && !this.budget());

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Rapportage - begroting');
        this.selectedSheet.subscribe(sheet => this.handleSelectedSheetChanged(sheet!));
    }

    protected async onActivate(args?: any): Promise<void> {
        const year = args && +args.year,
            month = args && +args.month;
        if (year && month) {
            const date = (this.preselectedDate = new Date(year, month - 1));

            if (date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                throw new Error(
                    `Unable to validate parameters: Not a valid month/year ${month}/${year} vs ${date.getMonth()}/${date.getFullYear()}`
                );
            }

            this.title(`Rapportage - begroting - ${DateFormat.monthYear(date)}`);
            await this.loadBudget(year, month);
        } else {
            this.sheets(await this.sheetApi.list());

            // Preselect current date
            const date = new Date();
            const sheets: sheet.ISheetListing[] = this.sheets.peek();
            for (const sheet of sheets) {
                if (sheet.month === date.getMonth() + 1 && sheet.year === date.getFullYear()) {
                    this.selectedSheet(sheet);
                }
            }
        }
    }

    private async loadBudget(year: number, month: number) {
        this.budget(null);
        this.isBudgetLoading(true);

        try {
            this.budget(await this.budgetApi.get(year, month));
        } finally {
            this.isBudgetLoading(false);
        }
    }

    public displayName(sheet: sheet.ISheetListing) {
        const dateString = DateFormat.monthYear(new Date(sheet.year, sheet.month));
        const nameSuffix = sheet.name ? ` (${sheet.name})` : '';

        return dateString + nameSuffix;
    }

    private handleSelectedSheetChanged(sheet: sheet.ISheetListing) {
        this.loadBudget(sheet.year, sheet.month);
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/report/budget.html'),
    createPage: appContext => new BudgetReportPage(appContext)
} as PageModule;
