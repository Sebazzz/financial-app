interface HubConnection {
    createHubProxy(hubName: 'appOwnerHub'): FinancialApp.AppOwnerHub;
}

declare module FinancialApp {
    interface AppOwnerHub extends HubProxy {
        /**
         * pushClient / popClient
         */
        on(eventName: string, callback: (name: string) => void): AppOwnerHub;
        off(eventName: string, callback: (name: string) => void): AppOwnerHub;

        /**
         * setInitialClientList
         */
        on(eventName: string, callback: (name: string[]) => void): AppOwnerHub;
        off(eventName: string, callback: (name: string[]) => void): AppOwnerHub;
    }
}