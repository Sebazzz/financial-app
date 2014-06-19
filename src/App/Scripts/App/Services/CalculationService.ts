/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../DTOEnum.generated.ts"/>
/// <reference path="../../typings/linq/linq.d.ts"/>

module FinancialApp.Services {
    export class CalculationService {
        constructor() {
            
        }

        public calculateTotal(sheet: DTO.ISheet, accountType: DTO.AccountType) {
            return Enumerable.From(sheet.entries)
                             .Where((e : DTO.ISheetEntry) => e.account === accountType)
                             .Sum((e : DTO.ISheetEntry) => e.delta);
        }
    }    
}