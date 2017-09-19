import { Page, IPageRegistration }  from '../../AppFramework/Page';
import AppContext from '../../AppFramework/AppContext';

import * as ko from 'knockout';

import * as sheetStatistics from '../../ServerApi/SheetStatistics';

class SheetStatisticsPage extends Page {
    private api = new sheetStatistics.Api();

    public currentValidationErrors = ko.observableArray<string>();
    public date = ko.observable<Date>();

    public stats = ko.observable<sheetStatistics.ISheetGlobalStatistics>();

    public currentSheetRoute = ko.pureComputed(() => {
        const date = this.date(),
              routeArgs = { month: date.getMonth() + 1, year: date.getFullYear() };

        return this.appContext.app.router.getRoute('archive.sheet', routeArgs);
    });

    public previousDate = ko.pureComputed(() => {
        const date = new Date(this.date());
        date.setMonth(date.getMonth() - 1);

        return date;
    });

    public previousSheetStatisticsRoute = ko.pureComputed(() => {
        const date = this.previousDate(),
              routeArgs = { month: date.getMonth() + 1, year: date.getFullYear() };

        return this.appContext.app.router.getRoute('archive.sheet.statistics', routeArgs);
    });

    public nextDate = ko.pureComputed(() => {
        const date = new Date(this.date());
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
              routeArgs = { month: date.getMonth() + 1, year: date.getFullYear() };

        return this.appContext.app.router.getRoute('archive.sheet.statistics', routeArgs);
    });

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Statistieken');
    }

    protected async onActivate(args?: any): Promise<void> {
        // Validate parameters
        if (!args) {
            throw new Error('Invalid argument');
        }

        const month = +args.month, year = +args.year, date = new Date(year, month - 1);
        if (date.getMonth() !== (month - 1) || date.getFullYear() !== year) {
            throw new Error('Unable to validate parameters: Not a valid month/year');
        }

        this.date(date);
        this.title(`Statistieken financiën ${kendo.toString(date, 'MMMM yyyy')}`);

        this.api.setContext(year, month);
        this.stats(await this.api.get());
    }
}

export default {
    id: module.id,
    templateName: 'archive/sheet-stats',
    routingTable: [
        { name: 'archive.sheet.statistics', path: '/statistics' },
        {
            name: 'sheet.stats',
            path: '/stats',
            forwardTo: 'archive.sheet.statistics'
        }
    ],
    createPage: (appContext) => new SheetStatisticsPage(appContext)
} as IPageRegistration;