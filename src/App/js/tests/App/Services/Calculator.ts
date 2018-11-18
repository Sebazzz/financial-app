/* tslint:disable */
import { ISheet } from 'App/ServerApi/Sheet';
import { IRecurringSheetEntry } from 'App/ServerApi/RecurringSheetEntry';
import { AccountType, ISheetEntry } from 'App/ServerApi/SheetEntry';
import * as calculators from 'App/Services/Calculator';
import { expect } from 'chai';

let id = 0,
    sortOrder = 0;
function createEntry(delta: number, type: AccountType): ISheetEntry {
    return {
        source: 'fake',
        categoryId: 0,
        sortOrder: 0,
        createTimestamp: new Date().toString(),
        updateTimestamp: new Date().toString(),
        account: type,
        delta,
        id: ++id,
        templateId: null,
        remark: null,
        tags: [],
        isNewSinceLastVisit: false
    };
}

function createEntryTemplate(delta: number, type: AccountType, sort?: number): IRecurringSheetEntry {
    return {
        source: 'fake',
        categoryId: 0,
        sortOrder: sort || ++sortOrder,
        account: type,
        delta,
        id: ++id,
        remark: null
    };
}

// ReSharper disable WrongExpressionStatement
describe('SheetTotalCalculationService calculates totals of sheet', () => {
    const calculator = new calculators.SheetTotalCalculationService();

    describe('empty sheet', () => {
        it('returns zero result', () => {
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: null },
                entries: [],
                applicableTemplates: []
            };

            const result = calculator.calculateTotal(sheet, AccountType.BankAccount);

            expect(result).to.be.eq(0, 'Empty sheet should calculate to zero');
        });

        it('returns result corrected with offset from previous month', () => {
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: 1600, bankAccountOffset: 323 },
                entries: [],
                applicableTemplates: []
            };

            const result = calculator.calculateTotal(sheet, AccountType.SavingsAccount);

            expect(result).to.be.eq(1600, 'Empty sheet should calculate to zero');
        });
    });

    describe('filled sheet', () => {
        it('returns result for selected type', () => {
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: null },
                entries: [createEntry(100, AccountType.SavingsAccount), createEntry(500, AccountType.BankAccount)],
                applicableTemplates: []
            };

            const result = calculator.calculateTotal(sheet, AccountType.BankAccount);

            expect(result).to.be.eq(500, 'Empty sheet should calculate to zero');
        });

        it('returns result corrected with offset from previous month', () => {
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: 1600, bankAccountOffset: null },
                entries: [createEntry(100, AccountType.SavingsAccount), createEntry(500, AccountType.BankAccount)],
                applicableTemplates: []
            };

            const result = calculator.calculateTotal(sheet, AccountType.SavingsAccount);

            expect(result).to.be.eq(1700, 'Empty sheet should calculate to zero');
        });
    });
});

describe('SheetExpensesCalculationService calculates expense trajectory', () => {
    const calculator = new calculators.SheetExpensesCalculationService();

    it('empty sheet returns total month sum', () => {
        const sheet: ISheet = {
            id: 0,
            subject: new Date(),
            name: null,
            updateTimestamp: new Date(),
            createTimestamp: new Date(),

            // The properties that reaully matter
            offset: { savingsAccountOffset: 1000, bankAccountOffset: 500 },
            entries: [],
            applicableTemplates: []
        };

        const result = calculator.calculateExpenseTrajectory(sheet);

        expect(result.nextIncome).to.be.null;
        expect(result.unpayableExpenses).to.be.empty;
        expect(result.totalBankWithExpense).to.be.eq(500);
    });

    describe('single expense', () => {
        it('enough money available: return corrected amount of expected money', () => {
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: 500 },
                entries: [createEntry(250, AccountType.BankAccount)],
                applicableTemplates: [createEntryTemplate(-350, AccountType.BankAccount)]
            };

            const result = calculator.calculateExpenseTrajectory(sheet);

            expect(result.nextIncome).to.be.null;
            expect(result.unpayableExpenses).to.be.empty;
            expect(result.totalBankWithExpense).to.be.eq(400);
        });

        it('not enough money available: return corrected amount of expected money', () => {
            const expense = createEntryTemplate(-750, AccountType.BankAccount);

            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: 500 },
                entries: [],
                applicableTemplates: [expense]
            };

            const result = calculator.calculateExpenseTrajectory(sheet);

            expect(result.nextIncome).to.be.null;
            expect(result.unpayableExpenses).to.deep.equal([expense]);
            expect(result.totalBankWithExpense).to.be.eq(-250);
        });
    });

    describe('single income', () => {
        it('return corrected amount of expected money', () => {
            const income = createEntryTemplate(350, AccountType.BankAccount);
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: 500 },
                entries: [createEntry(250, AccountType.BankAccount)],
                applicableTemplates: [income]
            };

            const result = calculator.calculateExpenseTrajectory(sheet);

            expect(result.nextIncome).to.be.deep.eq(income);
            expect(result.unpayableExpenses).to.be.empty;
            expect(result.totalBankWithExpense).to.be.eq(500 + 250 + 350);
        });

        it('not enough money available: return corrected amount of expected money and empty unpayable expenses', () => {
            const income = createEntryTemplate(50, AccountType.BankAccount);
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: 500 },
                entries: [createEntry(-750, AccountType.BankAccount)],
                applicableTemplates: [income]
            };

            const result = calculator.calculateExpenseTrajectory(sheet);

            expect(result.nextIncome).to.be.deep.eq(income);
            expect(result.unpayableExpenses).to.be.empty;
            expect(result.totalBankWithExpense).to.be.eq(500 - 750 + 50);
        });
    });

    describe('two templates', () => {
        it('upcoming salary before expense: no expense warnings', () => {
            const income = createEntryTemplate(2000, AccountType.BankAccount, 1);
            const expense = createEntryTemplate(-1000, AccountType.BankAccount, 2);

            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: 500 },
                entries: [createEntry(-50, AccountType.BankAccount)],
                applicableTemplates: [income, expense]
            };

            const result = calculator.calculateExpenseTrajectory(sheet);

            expect(result.nextIncome).to.be.deep.eq(income);
            expect(result.unpayableExpenses).to.be.empty;
            expect(result.totalBankWithExpense).to.be.eq(500 - 50 + 2000 - 1000);
        });

        it('upcoming salary after expense: one expense warning', () => {
            const expense = createEntryTemplate(-1000, AccountType.BankAccount, 1);
            const income = createEntryTemplate(2000, AccountType.BankAccount, 2);

            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: 500 },
                entries: [createEntry(-50, AccountType.BankAccount)],
                applicableTemplates: [income, expense]
            };

            const result = calculator.calculateExpenseTrajectory(sheet);

            expect(result.nextIncome).to.be.deep.eq(income);
            expect(result.unpayableExpenses).to.deep.equal([expense]);
            expect(result.totalBankWithExpense).to.be.eq(500 - 50 + 2000 - 1000);
        });
    });

    describe('multiple expenses', () => {
        const templates = [
            createEntryTemplate(-500, AccountType.BankAccount, 1),
            createEntryTemplate(-1000, AccountType.BankAccount, 2),
            createEntryTemplate(1500, AccountType.BankAccount, 3),
            createEntryTemplate(-500, AccountType.BankAccount, 4),
            createEntryTemplate(-250, AccountType.BankAccount, 5)
        ];

        const [firstExpense, secondExpense, income] = templates;

        it('one expense payable: unpayable expenses are returned until first income', () => {
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: 500 },
                entries: [],
                applicableTemplates: templates
            };

            const result = calculator.calculateExpenseTrajectory(sheet);

            expect(result.nextIncome).to.be.deep.eq(income);
            expect(result.totalBankWithExpense).to.be.eq(500 - 500 - 1000 + 1500 - 500 - 250);
            expect(result.unpayableExpenses).to.deep.equal([secondExpense]);
        });

        it('none expense payable: unpayable expenses are returned until first income', () => {
            const sheet: ISheet = {
                id: 0,
                subject: new Date(),
                name: null,
                updateTimestamp: new Date(),
                createTimestamp: new Date(),

                // The properties that reaully matter
                offset: { savingsAccountOffset: null, bankAccountOffset: 400 },
                entries: [],
                applicableTemplates: templates
            };

            const result = calculator.calculateExpenseTrajectory(sheet);

            expect(result.nextIncome).to.be.deep.eq(income);
            expect(result.totalBankWithExpense).to.be.eq(400 - 500 - 1000 + 1500 - 500 - 250);
            expect(result.unpayableExpenses).to.deep.equal([firstExpense, secondExpense]);
        });
    });
});
