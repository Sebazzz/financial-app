/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>

module FinancialApp.Services {

    export class SheetExpensesCalculationService {
        public static $inject = ['sheetTotalCalculation'];

        constructor(private sheetTotalCalculation: SheetTotalCalculationService) {
        }

        public calculateExpenseTrajectory(sheet: DTO.ISheet): ISheetExpenseTrajectory {
            // based on the current total, add the expected expenses
            // until the first income
            var sheetTotal = this.sheetTotalCalculation.calculateTotal(sheet, DTO.AccountType.BankAccount),
                existingRecurringExpenses = Enumerable.from(sheet.entries).where(x => x.templateId !== null).select(x => x.templateId).toArray(),
                predictedSheetTotal = sheetTotal,
                orderedExpectedExpenses = Enumerable.from(sheet.applicableTemplates).where(x => existingRecurringExpenses.indexOf(x.id) === -1).orderBy(x => x.sortOrder).toArray(),
                unpayableExpenses: DTO.IRecurringSheetEntry[] = [],
                nextIncome : DTO.IRecurringSheetEntry = null;

            for (var i = 0, len = orderedExpectedExpenses.length, current : DTO.IRecurringSheetEntry; i < len; i++) {
                current = orderedExpectedExpenses[i];

                if (current.account !== DTO.AccountType.BankAccount) {
                    continue;
                }

                var isIncome = current.delta > 0;
                if (isIncome) {
                    nextIncome = current;
                    break;
                }

                if (predictedSheetTotal < 0) {
                    unpayableExpenses.push(current);
                }

                predictedSheetTotal += current.delta;
            }

            return {
                nextIncome: nextIncome,
                unpayableExpenses: unpayableExpenses,
                totalBankWithExpense: predictedSheetTotal
            };
        }
    }

    export interface ISheetExpenseTrajectory {
        totalBankWithExpense: number;

        nextIncome: DTO.IRecurringSheetEntry;
        unpayableExpenses: DTO.IRecurringSheetEntry[];
    }
}