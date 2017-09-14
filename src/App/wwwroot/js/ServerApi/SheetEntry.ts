export interface ISheetEntry {
    id: number;
    categoryId: number;
    templateId: number | null;

    delta: number;

    source: string;
    remark:string;

    sortOrder : number;

    updateTimestamp: string; /* DateTime */
    createTimestamp: string; /* DateTime */

    account: AccountType;
}

export enum AccountType {
    Invalid = 0,

    BankAccount = 1,

    SavingsAccount = 2
}