import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import * as tag from 'App/ServerApi/Tag';
import { styleHtmlElement as styleTagHtmlElement } from 'App/Utils/TagColor';

import * as tagReport from 'App/ServerApi/TagReport';
import * as sheet from 'App/ServerApi/Sheet';
import * as sheetEntry from 'App/ServerApi/SheetEntry';

import * as modal from 'AppFramework/Components/Modal';
import * as popover from 'AppFramework/Components/Popover';

import * as calculator from 'App/Services/Calculator';
import * as ko from 'knockout';

class TagsPage extends Page {
    private tagApi = new tag.Api();
    private reportApi = new tagReport.Api();

    public remarksDisplayModal = new modal.ModalController<RemarksModel>('Opmerkingen bekijken', null, 'Sluiten');
    public tagViewerPopover = new popover.PopoverController<sheetEntry.ISheetEntry>('Tags bekijken');

    private calculator = new calculator.SheetTotalCalculationService();

    public totals = ko.pureComputed(() => {
        const sheet: sheet.ISheet = {
            entries: this.entries(),
            applicableTemplates: [],
            createTimestamp: new Date(),
            updateTimestamp: new Date(),
            subject: new Date(),
            id: 0,
            name: '',
            offset: {
                bankAccountOffset: 0,
                savingsAccountOffset: 0
            }
        };

        return {
            bankAccount: this.calculator.calculateTotal(sheet, sheetEntry.AccountType.BankAccount),
            savingsAccount: this.calculator.calculateTotal(sheet, sheetEntry.AccountType.SavingsAccount)
        };
    });

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Rapportage - per label');

        this.setSelectedTagListener();

        // bind "this"
        this.showRemarksOfEntry = this.showRemarksOfEntry.bind(this);
    }

    // ReSharper disable InconsistentNaming
    public AccountType = sheetEntry.AccountType;
    // ReSharper restore InconsistentNaming

    public tags = ko.observableArray<tag.ITag>();
    public selectedTag = ko.observable<tag.ITag>();

    public entries = ko.observableArray<tagReport.ITagReportSheetEntry>();

    protected async onActivate(args?: any): Promise<void> {
        this.tags(await this.tagApi.list());
    }

    public tagSelectionRendered(option: HTMLOptionElement, item: tag.ITag) {
        if (item && item.hexColorCode) {
            styleTagHtmlElement(option, item);
        }
    }

    private setSelectedTagListener(): void {
        ko.computed(() => {
            const selectedTag = this.selectedTag();
            if (!selectedTag) {
                return;
            }

            this.refresh(selectedTag.id).catch(reason => console.error(reason));
        });
    }

    private async refresh(tagId: number) {
        this.entries.removeAll();

        const entries = await this.reportApi.entries(tagId);
        for (const entry of entries) {
            const obj = { AccountType: sheetEntry.AccountType };
            $.extend(entry, obj);
        }

        this.entries(entries);
    }

    public async showRemarksOfEntry(sheetEntry: tagReport.ITagReportSheetEntry, event: Event) {
        event.preventDefault();

        this.remarksDisplayModal.showDialog(new RemarksModel(sheetEntry));
    }
}

export class RemarksModel {
    public content = ko.observable<string | null>();

    constructor(sheetEntry: tagReport.ITagReportSheetEntry) {
        this.content(sheetEntry.remark);
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/report/tags.html'),
    createPage: appContext => new TagsPage(appContext)
} as PageModule;
