// ReSharper disable once InconsistentNaming
module FinancialApp.DTO {
    
    export interface ISheetListing {
        month: number;
        year: number;
        name: string;
    }

    export interface ICategoryListing {
        id: number;
        canBeDeleted: boolean;
        name: string;
        description: string;
    }
}