/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../DTOEnum.generated.ts"/>
/// <reference path="../../typings/linq/linq.d.ts"/>

module FinancialApp.Services {
    export class CalculationService {
        constructor() {
            
        }

        public calculateTotal(sheet: DTO.ISheet, accountType: DTO.AccountType) {
            var sum = Enumerable.from(sheet.entries)
                             .where((e : DTO.ISheetEntry) => e.account === accountType)
                             .sum((e: DTO.ISheetEntry) => e.delta);

            if (accountType == DTO.AccountType.BankAccount) {
                sum += sheet.offset.bankAccountOffset;
            }

            if (accountType == DTO.AccountType.SavingsAccount) {
                sum += sheet.offset.savingsAccountOffset;
            }

            return sum || 0.00;
        }
    }    
}