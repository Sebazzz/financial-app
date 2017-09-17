﻿import FormPage from '../../AppFramework/Forms/FormPage';
import AppContext from '../../AppFramework/AppContext';
import NowRouteProvider from '../../Services/NowRoute';

import * as ko from 'knockout';
import * as mapper from '../../AppFramework/ServerApi/Mapper';

import * as sheet from '../../ServerApi/Sheet';
import * as entryTemplate from '../../ServerApi/RecurringSheetEntry';
import * as sheetEntry from '../../ServerApi/SheetEntry';
import * as category from '../../ServerApi/Category';

import * as calculator from '../../Services/Calculator';
import * as validate from '../../AppFramework/Forms/ValidateableViewModel';

import * as modal from '../../AppFramework/Components/Modal';

import confirmAsync from '../../AppFramework/Forms/Confirmation';

export default class SheetPage extends FormPage {
    private categoryApi = new category.Api();
    private api = new sheet.Api();
    private sheetEntryApi = new sheetEntry.Api();
    private totalCalculator = new calculator.SheetTotalCalculationService();
    private expenseTrajectoryCalculator = new calculator.SheetExpensesCalculationService();

    public currentValidationErrors = ko.observableArray<string>();
    public date = ko.observable<Date>();

    public availableCategories = ko.observableArray<category.ICategoryListing>();
    public sheet = ko.observable<Sheet>();

    public remarksEditModal = new modal.ModalController<RemarksModel>('Opmerkingen bewerken');
    public remarksDisplayModal = new modal.ModalController<RemarksModel>('Opmerkingen bekijken', null, 'Sluiten');

    public expenseTrajectory = ko.pureComputed(() => {
        const sheet = this.sheet(),
              dataObject = ko.toJS(sheet) as sheet.ISheet;

        return this.expenseTrajectoryCalculator.calculateExpenseTrajectory(dataObject);
    }).extend({ rateLimit: 250 });

    public previousDate = ko.pureComputed(() => {
        const date = new Date(this.date());
        date.setMonth(date.getMonth() - 1);

        return date;
    });

    public previousSheetRoute = ko.pureComputed(() => {
        const date = this.previousDate(),
            routeArgs = { month: date.getMonth() + 1, year: date.getFullYear() };

        return this.appContext.app.router.getRoute('archive.sheet', routeArgs);
    });

    public totals = ko.pureComputed(() => {
        const sheet = this.sheet(),
            dataObject = ko.toJS(sheet) as sheet.ISheet;

        return {
            bankAccount: this.totalCalculator.calculateTotal(dataObject, sheetEntry.AccountType.BankAccount),
            savingsAccount: this.totalCalculator.calculateTotal(dataObject, sheetEntry.AccountType.BankAccount)
        }
    });

    constructor(appContext: AppContext) {
        super(appContext);
        
        this.title('Financiën');
        this.templateName = 'archive/sheet';
        this.routes = [
            { name: 'archive.sheet', path: '/sheet/:year<\\d{4}>/:month<\\d{1,2}>' },
            {
                name: 'sheet',
                path: '/sheet/:year<\\d{4}>/:month<\\d{1,2}>',
                forwardTo: 'archive.sheet'
            },
            {
                name: 'now',
                path: '/now',
                canActivate: (router) => {
                    return () => {
                        const nowRoute = new NowRouteProvider();

                        router.cancel();
                        router.navigate('archive.sheet', nowRoute.getParams());
                        return false;
                    }
                }
            }
        ];

        // bind "this"
        this.addEntry = this.addEntry.bind(this);
        this.addEntryTemplate = this.addEntryTemplate.bind(this);
        this.deleteEntry = this.deleteEntry.bind(this);
        this.saveEntry = this.saveEntry.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.mutateSortOrderHandler = this.mutateSortOrderHandler.bind(this);
        this.editRemarksOfEntry = this.editRemarksOfEntry.bind(this);
        this.showRemarksOfEntry = this.showRemarksOfEntry.bind(this);
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
        this.title(`Financiën ${kendo.toString(date, 'MMMM yyyy')}`);

        this.sheetEntryApi.setContext(year, month);

        const [category, sheet] = await Promise.all([
            this.categoryApi.list(),
            this.api.getBySubject(year, month)
            ]);

        this.availableCategories(category);
        this.loadSheet(sheet);
    }

    public displayName(sheet: sheet.ISheetListing) {
        const dateString = kendo.toString(new Date(sheet.year, sheet.month), 'MMMM yyyy');
        const nameSuffix = sheet.name ? ` (${sheet.name})` : '';

        return dateString + nameSuffix;
    }

    public loadSheet(data: sheet.ISheet): any {
        const vm = mapper.MapUtils.deserialize<Sheet>(Sheet, data);
        if (!vm) {
            throw new Error('Unable to deserialize server response: null');
        }

        vm.sortEntries();

        this.sheet(vm);
    }

    public categoryNameById(id: number): string|null {
        for (const category of this.availableCategories()) {
            if (category.id === id) {
                return category.name;
            }
        }

        return null;
    }

    public async editRemarksOfEntry(sheetEntry: SheetEntry, event : Event) {
        event.preventDefault();

        const controller = new RemarksModel(sheetEntry),
              dialogResult = await this.remarksEditModal.showDialog(controller);

        if (dialogResult === modal.DialogResult.PrimaryButton) {
            controller.applyChanges();
        }
    }

    public async showRemarksOfEntry(sheetEntry: SheetEntry, event: Event) {
        event.preventDefault();

        this.remarksDisplayModal.showDialog(new RemarksModel(sheetEntry));
    }

    public mutateSortOrderHandler(currentItem: SheetEntry, mutation: sheetEntry.SortOrderMutationType) {
        return async () => {
            const sheet = this.sheet(),
                  currentIndex = sheet.entries.indexOf(currentItem),
                  sortOrderOffset = mutation === sheetEntry.SortOrderMutationType.Increase ? 1 : -1,
                  swapIndex = currentIndex + sortOrderOffset,
                  swapItem = sheet.entries()[swapIndex],
                  currentSortOrder = currentItem.sortOrder(),
                  swapSortOrder = swapItem.sortOrder();

            if (!swapItem) {
                // This happens when we try to increase sort order at the end,
                // or decrease sort order at the beginnen of the list
                console.error('Unable to find item to swap with');
                return;
            }

            swapItem.sortOrder(currentSortOrder);
            currentItem.sortOrder(swapSortOrder);

            currentItem.isBusy(true);
            swapItem.isBusy(true);

            try {
                this.cleanErrorState();
                await this.sheetEntryApi.mutateOrder(currentItem.id(), mutation);

                sheet.sortEntries();
            } catch (e) {
                swapItem.sortOrder(swapSortOrder);
                currentItem.sortOrder(currentSortOrder);

                console.error('Unable to mutate sort order of entry %s', currentItem.id());
                console.error(e);

                this.errorMessage('Kon de sorteervolgorde niet veranderen. Probeer het opnieuw.');
            } finally {
                currentItem.isBusy(false);
                swapItem.isBusy(false);
            }
        };
    }

    public addEntry() {
        const basis = {
            id: 0,
            sortOrder: this.sheet().getNextSortOrder(),
            account: sheetEntry.AccountType.BankAccount,
            categoryId: null,
            createTimestamp: new Date(),
            delta: 0,
            remark: null,
            source: null,
            updateTimestamp: new Date(),
            templateId: null
        },
            model = mapper.MapUtils.deserialize<SheetEntry>(SheetEntry, basis);

        if (!model) {
            return;
        }

        model.editMode(true);
        this.sheet().entries.push(model);
    }

    public addEntryTemplate(template: entryTemplate.IRecurringSheetEntry) {
        const basis = {
            id: 0,
            sortOrder: this.sheet().getNextSortOrder(),
            account: template.account,
            categoryId: template.categoryId,
            createTimestamp: new Date(),
            delta: template.delta,
            remark: template.remark,
            source: template.source,
            updateTimestamp: new Date(),
            templateId: template.id
        },
            model = mapper.MapUtils.deserialize<SheetEntry>(SheetEntry, basis);

        if (!model) {
            return;
        }

        model.editMode(true);
        this.sheet().entries.push(model);
    }

    public async deleteEntry(entry: SheetEntry, event: Event) {
        event.preventDefault();

        if (!(await confirmAsync('Weet je zeker dat je deze regel wilt verwijderen?', undefined, true))) {
            return;
        }

        this.cleanErrorState();

        const sheet = this.sheet();

        entry.isBusy(true);

        try {
            if (entry.id() !== 0) {
                await this.sheetEntryApi.delete(entry.id());
            }

            sheet.entries.remove(entry);
        } catch (e) {
            console.error('Unable to delete sheet entry %d', entry.id());
            console.error(e);

            this.errorMessage('Sorry, het verwijderen is niet gelukt. Probeer het opnieuw.');
        } finally {
            entry.isBusy(false);
        }
    }

    public async saveEntry(entry: SheetEntry) {
        const id = entry.id.peek(),
              dto = ko.toJS(entry) as sheetEntry.ISheetEntry;

        this.cleanErrorState();

        try {
            if (id !== 0) {
                await this.sheetEntryApi.update(id, dto);
            } else {
                const result = await this.sheetEntryApi.create(dto);
                entry.id(result.id);
            }

            entry.editMode(false);
        } catch (e) {
            if (validate.tryExtractValidationError(e, entry)) {
                this.setValidationErrors(entry.modelState());
                return;
            }
        }
    }

    public save(): Promise<void> {
        // Saving is handled via saveSheetEntry - the Form binding handler should not call this method.
        console.error('Not supported: SheetPage.Save');

        return Promise.reject('Not Supported');
    }

    private cleanErrorState() {
        this.errorMessage(null);
        this.currentValidationErrors.removeAll();
    }

    private setValidationErrors(modelState: validate.IModelState) {
        for (const property in modelState) {
            if (modelState.hasOwnProperty(property)) {
                for (const errorMessage of modelState[property]) {
                    this.currentValidationErrors.push(errorMessage);
                }
            }
        }

        this.errorMessage('Het opslaan is niet gelukt. Corrigeer de fouten en probeer het opnieuw.');
    }
}

export class SheetEntry extends validate.ValidateableViewModel {
    public id = ko.observable<number>(0);

    public categoryId = ko.observable<number>();
    public templateId = ko.observable<number>();

    public delta = ko.observable<number>();

    public source = ko.observable<string>();
    public remark = ko.observable<string>();

    public sortOrder = ko.observable<number>();

    public updateTimestamp = ko.observable<sheetEntry.DateTime>();
    public createTimestamp = ko.observable<sheetEntry.DateTime>();

    public account = ko.observable<sheetEntry.AccountType>();

    public editMode = ko.observable<boolean>(false);

    public isBusy = ko.observable<boolean>(false);
    public isTransient = ko.observable<boolean>(false); // TODO: SignalR / realtime
    public userName = ko.observable<string | null>(null);

    public tooltip = ko.pureComputed(() => {
        const isTransient = this.isTransient(),
              userName = this.userName();

        return isTransient && userName ? `Wordt nu bewerkt door ${userName}` : null;
    });

    public showRemark = ko.observable<boolean>(false);

    // ReSharper disable InconsistentNaming
    public AccountType = sheetEntry.AccountType;
    public SortOrderMutation = sheetEntry.SortOrderMutationType;
    // ReSharper restore InconsistentNaming

    public toggleAccount() {
        switch (this.account.peek()) {
            case this.AccountType.BankAccount:
                this.account(this.AccountType.SavingsAccount);
                break;

            case this.AccountType.SavingsAccount:
            default:
                this.account(this.AccountType.BankAccount);
        }
    }

    public toggleEdit() {
        this.editMode(!this.editMode());
    }

    public toggleRemark() {
        this.showRemark(!this.showRemark());
    }
}

export class Sheet {
    public subject = ko.observable<Date>();
    public name = ko.observable<string>();

    public createTimestamp = ko.observable<Date>();
    public updateTimestamp = ko.observable<Date>();

    @mapper.JsonProperty({ clazz: SheetEntry })
    public entries = ko.observableArray<SheetEntry>();

    public applicableTemplates = ko.observableArray<sheet.IRecurringSheetEntry>();

    public unusedTemplates = ko.pureComputed(() => {
        const templates = this.applicableTemplates(),
              entries = this.entries(),
              usedTemplateIds = entries.filter(x => x.templateId() !== null).map(x => x.templateId()),
              unusedTemplates = templates.filter(x => usedTemplateIds.indexOf(x.id) === -1);

        return unusedTemplates;
    });

    public offset: {
        savingsAccountOffset: sheet.Decimal | null;
        bankAccountOffset: sheet.Decimal | null;
    } = { savingsAccountOffset: null, bankAccountOffset : null};

    public getNextSortOrder() {
        let maxSortOrder = 0;

        for (const item of this.entries()) {
            maxSortOrder = Math.max(item.sortOrder(), maxSortOrder);
        }

        return maxSortOrder + 1;
    }

    public sortEntries(): void {
        this.entries.sort((x, y) => x.sortOrder() - y.sortOrder());
    }
}

export class RemarksModel {
    public content = ko.observable<string|null>();
    public editMode: KnockoutObservable<boolean>;

    constructor(private sheetEntry: SheetEntry) {
        this.content(sheetEntry.remark());
        this.editMode = sheetEntry.editMode;
    }

    public applyChanges() {
        this.sheetEntry.remark(this.content());
    }
}