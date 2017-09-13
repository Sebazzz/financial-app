﻿import AppContext from '../../../AppFramework/AppContext';
import FormPage from '../../../AppFramework/Forms/FormPage';
import * as category from '../../../ServerApi/Category';
import * as entryTemplate from '../../../ServerApi/RecurringSheetEntry';
import * as validate from '../../../AppFramework/Forms/ValidateableViewModel';
import * as mapper from '../../../AppFramework/ServerApi/Mapper';
import * as ko from 'knockout';

export default class EditPage extends FormPage {
    private categoryApi = new category.Api();
    private api = new entryTemplate.Api();

    public id = ko.observable<number>(0);

    public entryTemplate = ko.observable<EditViewModel>(new EditViewModel());
    public availableCategories = ko.observableArray<category.ICategoryListing>();

// ReSharper disable InconsistentNaming
    public AccountType = entryTemplate.AccountType;
// ReSharper restore InconsistentNaming

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Regeltemplate bewerken');
        this.templateName = 'manage/entry-template/edit';
        this.routes = [
                { name: 'manage.entry-template.edit', path: '/edit/:id' },
                { name: 'manage.entry-template.add', path: '/add'}
            ];

        this.save = this.save.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        this.availableCategories(await this.categoryApi.list());

        if (args && args.id) {
            this.id(+args.id);

            this.title('Regeltemplate bewerken');
            this.set(await this.api.get(this.id.peek()));
            this.title(`Regeltemplate "${this.entryTemplate().source()}" bewerken`);
        } else {
            this.id(0);
            this.entryTemplate(new EditViewModel());
            this.title('Regeltemplate aanmaken');
        }
    }

    public async save(): Promise<void> {
        const entryTemplate = this.entryTemplate.peek();

        try {
            const serialized = ko.toJS(entryTemplate) as entryTemplate.IRecurringSheetEntry,
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

    private set(data: entryTemplate.IRecurringSheetEntry): any {
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
    public account = ko.observable<entryTemplate.AccountType>();

    public showRemarksEditor = ko.observable<boolean>(false);
    public toggleRemarksEditor() {
        this.showRemarksEditor(!this.showRemarksEditor());
    }
}