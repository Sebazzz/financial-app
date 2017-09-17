import {Page} from '../../../AppFramework/Page'
import AppContext from '../../../AppFramework/AppContext'
import * as entry from '../../../ServerApi/RecurringSheetEntry';
import {AccountType} from '../../../ServerApi/SheetEntry';
import * as ko from 'knockout';
import confirmAsync from '../../../AppFramework/Forms/Confirmation';

export default class DefaultPage extends Page {
    private api = new entry.Api();

    public entryTemplates = ko.observableArray<entry.IRecurringSheetEntryListing>();

    // Pass the types below to the view
// ReSharper disable InconsistentNaming
    public SortOrderMutation = entry.SortOrderMutationType;
    public AccountType = AccountType;
// ReSharper restore InconsistentNaming

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Regeltemplates');
        this.templateName = 'manage/entry-template/default';
        this.routes = { name: 'manage.entry-template', path: '/entry-template' };

        this.deleteEntryTemplate = this.deleteEntryTemplate.bind(this);
        this.mutateSortOrderHandler = this.mutateSortOrderHandler.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        await this.reload();
    }

    protected async reload() {
        this.entryTemplates(await this.api.list());
    }

    public async deleteEntryTemplate(entryTemplate: entry.IRecurringSheetEntryListing) {
        if (await confirmAsync(`Weet je zeker dat je ${entryTemplate.source} wilt verwijderen?`, 'Regeltemplate verwijderen', true)) {
            this.entryTemplates.remove(entryTemplate);
            await this.api.delete(entryTemplate.id);
        }
    }

    public mutateSortOrderHandler(entry : entry.IRecurringSheetEntryListing, mutation : entry.SortOrderMutationType) {
        return async () => {
            try {
                await this.api.mutateOrder(entry.id, mutation);
                await this.reload();
            } catch (e) {
                console.error('Unable to mutate sort order of entry %s', entry.id);
                console.error(e);
            }
        };
    }
} 