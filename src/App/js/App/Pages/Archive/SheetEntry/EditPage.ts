import FormPage from 'AppFramework/Forms/FormPage';
import { PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import { AccountType } from 'App/ServerApi/SheetEntry';
import { Format as DateFormat } from 'AppFramework/Internationalization/Date';

import * as ko from 'knockout';
import * as mapper from 'AppFramework/ServerApi/Mapper';

import * as entryTemplate from 'App/ServerApi/RecurringSheetEntry';
import * as sheet from 'App/ServerApi/Sheet';
import * as sheetEntry from 'App/ServerApi/SheetEntry';
import * as tag from 'App/ServerApi/Tag';
import * as category from 'App/ServerApi/Category';

import * as validate from 'AppFramework/Forms/ValidateableViewModel';

class EditPage extends FormPage {
    private categoryApi = new category.Api();
    private templateApi = new entryTemplate.Api();
    private tagApi = new tag.Api();
    private sheetApi = new sheet.Api();
    private api = new sheetEntry.Api();

    public id = ko.observable<number>(0);

    public entry = ko.observable<EditViewModel>(new EditViewModel());
    public availableCategories = ko.observableArray<category.ICategoryListing>();
    public availableTags = ko.observableArray<tag.ITag>();

    public sourceAutocompletionData = ko.observableArray<string>();

    public date = ko.observable<Date>();

    public sheetRouteParams = ko.pureComputed(() => {
        const date = this.date()!;
        return { month: date.getMonth() + 1, year: date.getFullYear() };
    });

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Regeltemplate bewerken');

        this.save = this.save.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        // Validate parameters
        if (!args) {
            throw new Error('Invalid argument');
        }

        const month = +args.month,
            year = +args.year,
            date = new Date(year, month - 1);
        if (date.getMonth() !== month - 1 || date.getFullYear() !== year) {
            throw new Error('Unable to validate parameters: Not a valid month/year');
        }

        this.date(date);
        this.api.setContext(year, month);

        // We can pull in autocompletion data concurrently, but we won't wait
        // for it because it is not essential to the functionality of this page
        this.sheetApi
            .getSourceAutocompletionData(year, month)
            .then(data => this.sourceAutocompletionData(data), err => console.error(err));

        const baseTitle = `Financiën ${DateFormat.monthYear(date)}`;

        const loadCategories = this.categoryApi.list(),
            loadTags = this.tagApi.list();

        if (args && args.id) {
            this.id(+args.id);

            this.title(`Regel bewerken - ${baseTitle}`);

            const [entity, tags, categories] = await Promise.all([
                this.api.get(this.id.peek()),
                loadTags,
                loadCategories
            ]);
            this.set(entity);
            this.availableCategories(categories);
            this.availableTags(tags);

            this.title(`Regel "${this.entry().source()}" bewerken - ${baseTitle}`);
        } else {
            const templateId = +(args && args.templateId),
                model = new EditViewModel();

            if (!isNaN(templateId) && templateId !== 0) {
                try {
                    const template = await this.templateApi.get(templateId);

                    model.templateId(template.id);
                    model.source(template.source);
                    model.account(template.account);
                    model.remark(template.remark);
                    model.delta(template.delta);
                    model.categoryId(template.categoryId);
                } catch (e) {
                    this.errorMessage('Sorry, we konden de regeltemplate niet laden.');
                }
            }

            this.id(0);
            this.entry(model);
            this.title(`Regel aanmaken - ${baseTitle}`);

            const [tags, categories] = await Promise.all([loadTags, loadCategories]);
            this.availableTags(tags);
            this.availableCategories(categories);
        }
    }

    public async save(_: never, submissionName: string | null): Promise<void> {
        const entryTemplate = this.entry.peek();

        try {
            const serialized = ko.toJS(entryTemplate) as sheetEntry.ISheetEntry,
                id = this.id.peek(),
                isNew = id === 0;

            if (isNew) {
                await this.api.create(serialized);
            } else {
                await this.api.update(id, serialized);
            }

            switch (submissionName) {
                case 'save-and-continue':
                    this.entry(new EditViewModel());
                    break;

                default:
                    this.appContext.router.navigate('archive.sheet', this.sheetRouteParams());
                    break;
            }
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, entryTemplate)) {
                throw e;
            }
        }
    }

    private set(data: entryTemplate.IRecurringSheetEntry): any {
        const vm = mapper.MapUtils.deserialize<EditViewModel>(EditViewModel, data);
        if (!vm) {
            throw new Error('Unable to deserialize server response: null');
        }

        this.entry(vm);
    }

    public tagSelectionRendered(option: HTMLOptionElement, item: tag.ITag) {
        if (item && item.hexColorCode) {
            option.style.backgroundColor = '#' + item.hexColorCode;

            const r = parseInt(item.hexColorCode.substr(0, 2), 16),
                g = parseInt(item.hexColorCode.substr(2, 2), 16),
                b = parseInt(item.hexColorCode.substr(4, 2), 16),
                // ref: https://stackoverflow.com/a/596243/646215
                lightness = 0.299 * r + 0.587 * g + 0.114 * b;

            if (lightness < 90) {
                option.style.color = '#FFF';
            }
        }
    }
}

export class EditViewModel extends validate.ValidateableViewModel {
    public id = 0;
    public categoryId = ko.observable<number>();
    public delta = ko.observable<number>();
    public source = ko.observable<string>();
    public sortOrder = ko.observable<number>(0);
    public remark = ko.observable<string | null>(null);
    public account = ko.observable<AccountType>();
    public templateId = ko.observable<number>();
    public tags = ko.observableArray<number>();

    public showRemarksEditor = ko.observable<boolean>(false);
    public toggleRemarksEditor() {
        this.showRemarksEditor(!this.showRemarksEditor());
    }

    // ReSharper disable InconsistentNaming
    public AccountType = sheetEntry.AccountType;
    // ReSharper restore InconsistentNaming
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/archive/sheetentry-edit.html'),
    createPage: appContext => new EditPage(appContext)
} as PageModule;
