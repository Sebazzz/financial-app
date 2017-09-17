import {Page, IPageRegistration} from '../../AppFramework/Page'
import AppContext from '../../AppFramework/AppContext';
import * as sheet from '../../ServerApi/Sheet';
import * as ko from 'knockout';
class DefaultPage extends Page {
    private api = new sheet.Api();

    public sheets = ko.observableArray<sheet.ISheetListing>();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Archief');
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

export default {
    name: 'ArchiveDefaultPage',
    templateName: 'archive/default',
    routingTable: { name: 'archive', path: '/archive' },
    createPage: (appContext) => new DefaultPage(appContext)
} as IPageRegistration;