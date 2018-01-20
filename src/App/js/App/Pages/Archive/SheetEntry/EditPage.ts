import FormPage from 'AppFramework/Forms/FormPage';
import {IPageRegistration} from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';
import NowRouteProvider from '../../../Services/NowRoute';
import { AccountType } from '../../../ServerApi/SheetEntry';

import * as ko from 'knockout';
import * as mapper from 'AppFramework/ServerApi/Mapper';

import * as entryTemplate from '../../../ServerApi/RecurringSheetEntry';
import * as sheetEntry from '../../../ServerApi/SheetEntry';
import * as tag from 'App/ServerApi/Tag';
import * as category from '../../../ServerApi/Category';

import * as validate from 'AppFramework/Forms/ValidateableViewModel';

import {State} from 'router5';

class EditPage extends FormPage {
    private categoryApi = new category.Api();
    private templateApi = new entryTemplate.Api();
    private tagApi = new tag.Api();
    private api = new sheetEntry.Api();

    public id = ko.observable<number>(0);

    public entry = ko.observable<EditViewModel>(new EditViewModel());
    public availableCategories = ko.observableArray<category.ICategoryListing>();
    public availableTags = ko.observableArray<tag.ITag>();

    public date = ko.observable<Date>();

    public sheetRouteParams = ko.pureComputed(() => {
        const date = this.date();
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

        const month = +args.month, year = +args.year, date = new Date(year, month - 1);
        if (date.getMonth() !== (month - 1) || date.getFullYear() !== year) {
            throw new Error('Unable to validate parameters: Not a valid month/year');
        }

        this.date(date);
        this.api.setContext(year, month);

        const baseTitle = `Financiën ${kendo.toString(date, 'MMMM yyyy')}`;

        const loadCategories = this.categoryApi.list(),
              loadTags = this.tagApi.list();

        if (args && args.id) {
            this.id(+args.id);

            this.title(`Regel bewerken - ${baseTitle}`);

            const [entity, tags, categories] = await Promise.all([
                this.api.get(this.id.peek()),
                loadTags,
                loadCategories]);
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

            const [tags, categories] = await Promise.all([
                loadTags,
                loadCategories]);
            this.availableTags(tags);
            this.availableCategories(categories);
        }
    }

    public async save(): Promise<void> {
        const entryTemplate = this.entry.peek();

        try {
            const serialized = ko.toJS<any>(entryTemplate) as sheetEntry.ISheetEntry,
                  id = this.id.peek(),
                  isNew = id === 0;

            if (isNew) {
                await this.api.create(serialized);
            } else {
                await this.api.update(id, serialized);
            }

            this.appContext.router.navigate('archive.sheet', this.sheetRouteParams());
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
                  lightness = (0.299 * r + 0.587 * g + 0.114 * b);

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
    public remark = ko.observable<string>();
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
    templateName: 'archive/sheetentry-edit',
    routingTable: [
        { name: 'sheet.entry.add', path: '/add', forwardTo: 'archive.sheet.entry.add' },
        { name: 'sheet.entry.edit', path: '/edit/:id', forwardTo: 'archive.sheet.entry.edit' },

        { name: 'archive.sheet.entry.edit', path: '/edit/:id' },
        { name: 'archive.sheet.entry.add', path: '/add' },
        {
            name: 'now.add',
            path: '/add',
            canActivate:router => {
                return (toState: State) => {
                    if (toState.name !== 'now.add') {
                        // Derived route - always OK
                        return true;
                    }

                    const nowRoute = new NowRouteProvider();

                    router.cancel();
                    router.navigate('archive.sheet.entry.add', nowRoute.getParams());
                    return false;
                };
            }
        }
    ],
    createPage:appContext => new EditPage(appContext)
} as IPageRegistration;
