/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../DTOEnum.generated.ts"/>
/// <reference path="../../typings/linq/linq.d.ts"/>

module FinancialApp.Services {
    export class SheetEntryFactory {
        constructor() {

        }

        public createEmpty(sheet: DTO.ISheet, template?: DTO.IRecurringSheetEntry) {
            return template ? this.createEmptySheetEntryBasedOnTemplate(sheet, template) : this.createEmptyInternal(sheet);
        }

        private createEmptyInternal(sheet: DTO.ISheet) {
            return {
                id: 0,
                account: DTO.AccountType.BankAccount,
                categoryId: null,
                createTimestamp: moment(),
                delta: 0,
                remark: null,
                source: null,
                editMode: true,
                updateTimestamp: moment(),
                isBusy: false,
                sortOrder: SheetEntryFactory.pickSortOrder(sheet),
                templateId: null
            };
        }

        private createEmptySheetEntryBasedOnTemplate(sheet: DTO.ISheet, template: DTO.IRecurringSheetEntry): DTO.ISheetEntry {
            return {
                id: 0,
                account: template.account,
                categoryId: template.categoryId,
                createTimestamp: moment(),
                delta: template.delta,
                remark: template.remark,
                source: template.source,
                editMode: true,
                updateTimestamp: moment(),
                isBusy: false,
                sortOrder: SheetEntryFactory.pickSortOrder(sheet),
                templateId: template.id
            };
        }

        private static pickSortOrder(sheet: DTO.ISheet) {
            return Enumerable.from(sheet.entries).defaultIfEmpty(<any>{ sortOrder: 0 }).max(x => x.sortOrder) + 1;
        }
    }
}