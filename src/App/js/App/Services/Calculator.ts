import * as sheet from '../ServerApi/Sheet';
import * as sheetEntry from '../ServerApi/SheetEntry';
import * as recurring from '../ServerApi/RecurringSheetEntry';

export class SheetTotalCalculationService {
    public calculateTotal(sheet: sheet.ISheet, accountType: sheetEntry.AccountType) {
        let total = 0;
        sheet.entries.forEach(item => (total += item.account === accountType ? item.delta : 0));

        if (accountType === sheetEntry.AccountType.BankAccount) {
            total += sheet.offset.bankAccountOffset || 0;
        }

        if (accountType === sheetEntry.AccountType.SavingsAccount) {
            total += sheet.offset.savingsAccountOffset || 0;
        }

        return total || 0.0;
    }
}

export class SheetExpensesCalculationService {
    private sheetTotalCalculation = new SheetTotalCalculationService();

    public calculateExpenseTrajectory(sheet: sheet.ISheet): ISheetExpenseTrajectory {
        // based on the current total, add the expected expenses
        // until the first income
        const sheetTotal = this.sheetTotalCalculation.calculateTotal(sheet, sheetEntry.AccountType.BankAccount),
            existingRecurringExpenses = sheet.entries.filter(x => x.templateId !== null).map(x => x.templateId),
            orderedExpectedExpenses = sheet.applicableTemplates
                .filter(x => existingRecurringExpenses.indexOf(x.id) === -1)
                .sort((x, y) => x.sortOrder - y.sortOrder),
            unpayableExpenses: recurring.IRecurringSheetEntry[] = [];

        let nextIncome: recurring.IRecurringSheetEntry | null = null,
            predictedSheetTotal = sheetTotal;

        for (let i = 0, len = orderedExpectedExpenses.length, current: recurring.IRecurringSheetEntry; i < len; i++) {
            current = orderedExpectedExpenses[i];

            if (current.account !== sheetEntry.AccountType.BankAccount) {
                continue;
            }

            const isIncome = current.delta > 0;
            predictedSheetTotal += current.delta;

            if (isIncome) {
                nextIncome = current;
            }

            if (predictedSheetTotal < 0 && nextIncome === null) {
                unpayableExpenses.push(current);
            }
        }

        return {
            nextIncome,
            unpayableExpenses,
            totalBankWithExpense: predictedSheetTotal
        };
    }
}

export interface ISheetExpenseTrajectory {
    totalBankWithExpense: number;

    nextIncome: recurring.IRecurringSheetEntry | null;
    unpayableExpenses: recurring.IRecurringSheetEntry[];
}
