interface HubConnection {
    createHubProxy(hubName: 'appOwnerHub'): AppOwnerHub;
}

interface AppOwnerHub extends HubProxy {
    on(eventName: string, callback: (name: string) => void): AppOwnerHub;
    off(eventName: string, callback: (name: string) => void): AppOwnerHub;
}