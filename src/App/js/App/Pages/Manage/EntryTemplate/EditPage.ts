import AppContext from 'AppFramework/AppContext';
import { PageModule } from 'AppFramework/Navigation/Page';
import FormPage from 'AppFramework/Forms/FormPage';
import * as category from 'App/ServerApi/Category';
import * as entry from 'App/ServerApi/RecurringSheetEntry';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';
import * as mapper from 'AppFramework/ServerApi/Mapper';
import * as ko from 'knockout';
import { AccountType } from 'App/ServerApi/SheetEntry';

class EditPage extends FormPage {
    private categoryApi = new category.Api();
    private api = new entry.Api();

    public id = ko.observable<number>(0);

    public entryTemplate = ko.observable<EditViewModel>(new EditViewModel());
    public availableCategories = ko.observableArray<category.ICategoryListing>();

    // ReSharper disable InconsistentNaming
    public AccountType = AccountType;
    // ReSharper restore InconsistentNaming

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Regeltemplate bewerken');

        this.save = this.save.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        const loadCategories = this.categoryApi.list();

        if (args && args.id) {
            this.id(+args.id);

            this.title('Regeltemplate bewerken');

            const [entity, categories] = await Promise.all([this.api.get(this.id.peek()), loadCategories]);

            this.set(entity);
            this.availableCategories(categories);

            this.title(`Regeltemplate "${this.entryTemplate().source()}" bewerken`);
        } else {
            this.id(0);
            this.entryTemplate(new EditViewModel());
            this.title('Regeltemplate aanmaken');

            this.availableCategories(await loadCategories);
        }
    }

    public async save(): Promise<void> {
        const entryTemplate = this.entryTemplate.peek();

        try {
            const serialized = ko.toJS(entryTemplate) as entry.IRecurringSheetEntry,
                id = this.id.peek(),
                isNew = id === 0;

            if (isNew) {
                await this.api.create(serialized);
            } else {
                await this.api.update(id, serialized);
            }

            this.appContext.router.navigate('manage.entry-template');
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, entryTemplate)) {
                throw e;
            }
        }
    }

    private set(data: entry.IRecurringSheetEntry): any {
        const vm = mapper.MapUtils.deserialize<EditViewModel>(EditViewModel, data);
        if (!vm) {
            throw new Error('Unable to deserialize server response: null');
        }

        this.entryTemplate(vm);
    }
}

export class EditViewModel extends validate.ValidateableViewModel {
    public id = 0;
    public categoryId = ko.observable<number>();
    public delta = ko.observable<number>();
    public source = ko.observable<string>();
    public sortOrder = ko.observable<number>(0);
    public remark = ko.observable<string>();
    public account = ko.observable<AccountType>();

    public showRemarksEditor = ko.observable<boolean>(false);
    public toggleRemarksEditor() {
        this.showRemarksEditor(!this.showRemarksEditor());
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/manage/entry-template/edit.html'),
    createPage: appContext => new EditPage(appContext)
} as PageModule;
