import {Page} from '../../AppFramework/Page';
import AppContext from '../../AppFramework/AppContext';
import * as sheet from '../../ServerApi/Sheet';
import * as ko from 'knockout';

export default class DefaultPage extends Page {
    private api = new sheet.Api();

    public sheets = ko.observableArray<sheet.ISheetListing>();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Archief');
        this.templateName = 'archive/default';
        this.routes = { name: 'archive', path: '/archive' };
    }

    protected async onActivate(args?: any): Promise<void> {
        this.sheets(await this.api.list());
    }

    public displayName(sheet: sheet.ISheetListing) {
        const dateString = kendo.toString(new Date(sheet.year, sheet.month), 'MMMM yyyy');
        const nameSuffix = sheet.name ? ` (${sheet.name})` : '';

        return dateString + nameSuffix;
    }
} 