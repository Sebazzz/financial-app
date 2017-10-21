import {ISheet} from 'App/ServerApi/Sheet';
import {AccountType} from 'App/ServerApi/SheetEntry';
import * as calculators from 'App/Services/Calculator';
import { expect } from 'chai';

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
    });
});