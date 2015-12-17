interface HubConnection {
    createHubProxy(hubName: 'sheetHub'): FinancialApp.SheetHub;
}

declare module FinancialApp {
    interface SheetHub extends HubProxy {
        /**
         * pushSheetEntry
         */
        on(eventName: string, callback: (data: IRealtimeSheetEntryInfo) => void): SheetHub;
        off(eventName: string, callback: (data: IRealtimeSheetEntryInfo) => void): SheetHub;

        /**
         * finalizeRealtimeSheetEntry
         */
        on(eventName: string, callback: (data: IFinalizeRealtimeSheetEntry) => void): SheetHub;
        off(eventName: string, callback: (data: IFinalizeRealtimeSheetEntry) => void): SheetHub;

        /**
           addOrUpdatePendingSheetEntry - returns an id which needs to be assigned to subsequent requests
        */
        invoke(method: string, data: IRealtimeSheetEntryInfo): JQueryDeferred<number>;

        /**
         * finalizeSheetEntry
         **/
        invoke(method: string, data: IFinalizeRealtimeSheetEntry): JQueryDeferred<void>;

    }

    interface IRealtimeSheetEntryInfo extends DTO.ISheetEntry {
        realtimeId?: number;
    }

    interface IFinalizeRealtimeSheetEntry extends DTO.ISheetEntry {
        realtimeId?: number;
        committed: boolean;
    }
}