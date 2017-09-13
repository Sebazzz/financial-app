import {Page} from '../../../AppFramework/Page'
import AppContext from '../../../AppFramework/AppContext'
import * as entryTemplate from '../../../ServerApi/RecurringSheetEntry';
import * as ko from 'knockout';
import confirmAsync from '../../../AppFramework/Forms/Confirmation';

export default class DefaultPage extends Page {
    private api = new entryTemplate.Api();

    public entryTemplates = ko.observableArray<entryTemplate.IRecurringSheetEntryListing>();

    // Pass the types below to the view
// ReSharper disable InconsistentNaming
    public SortOrderMutation = entryTemplate.SortOrderMutationType;
    public AccountType = entryTemplate.AccountType;
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

    public async deleteEntryTemplate(entryTemplate: entryTemplate.IRecurringSheetEntryListing) {
        if (await confirmAsync(`Weet je zeker dat je ${entryTemplate.source} wilt verwijderen?`, 'Regeltemplate verwijderen', true)) {
            this.entryTemplates.remove(entryTemplate);
            await this.api.delete(entryTemplate.id);
        }
    }

    public mutateSortOrderHandler(entry : entryTemplate.IRecurringSheetEntryListing, mutation : entryTemplate.SortOrderMutationType) {
        return async () => {
            await this.api.mutateOrder(entry.id, mutation);
            await this.reload();
        };
    }
} 