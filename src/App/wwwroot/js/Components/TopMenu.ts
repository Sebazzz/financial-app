import * as framework from '../AppFramework/Panel';
import {State, PluginFactory as RouterPluginFactory} from 'router5';
import AppContext from '../AppFramework/AppContext';
import * as ko from 'knockout';
import NowRouteProvider from '../Services/NowRoute';
import * as SignalR from '@aspnet/signalr-client';

class TopMenu extends framework.Panel {
    private activityService = new UserActivityService();

    private path = ko.observable<string>('/');
    private routeNode = ko.observable<string>('default');

    public nowPath = ko.pureComputed<string>(() => {
        return new NowRouteProvider().getRoute(this.appContext.app.router);
    });

    public currentUserName = ko.pureComputed(() => this.appContext.authentication.currentAuthentication().userName);

    public activeClientCount = this.activityService.activeClientCount;
    public isConnected = this.activityService.isConnected;
    public showActiveClientTooltip = ko.observable<boolean>(false);
    public activeClientTooltip = ko.pureComputed(() => 'Ingelogde gebruikers: ' + this.activityService.activeClients().join(','));

    public deactivate(): void {
        this.activityService.stop();
    }

    protected onActivate(): Promise<void> {
        const authenticationInfo = this.appContext.authentication.currentAuthentication;
        this.handleAuthenticationChange(authenticationInfo.peek().isAuthenticated);
        authenticationInfo.subscribe(value => {
            this.handleAuthenticationChange(value.isAuthenticated);
        });

        return Promise.resolve();
    }

    private handleAuthenticationChange(isAuthenticated : boolean) {
        if (!isAuthenticated) {
            console.info('TopMenu: Stopping activity service.');
            this.activityService.stop();
        } else {
            console.info('TopMenu: Starting activity service.');
            this.activityService.start();
        }
    }

    constructor(appContext: AppContext) {
        super(appContext);

        const menuPlugin: RouterPluginFactory = () => {
            return {
                onTransitionSuccess: (toState: State) => {
                    toState && this.path(toState.path);
                    toState && this.routeNode(toState.name);
                }
            }
        };

        menuPlugin.pluginName = 'top-menu-plugin';
        appContext.router.usePlugin(menuPlugin);

        this.activeClientCount.subscribe(x => {
            if (x <= 1) {
                this.showActiveClientTooltip(false);
                return;
            }

            this.showActiveClientTooltip(true);
            window.setTimeout(() => this.showActiveClientTooltip(false), 2000);
        });
    }

    public hasLocation(paramRaw: string|KnockoutObservable<string>) {
        return ko.pureComputed(() => {
            const param = ko.unwrap(paramRaw),
                  matchRouteNode = param.indexOf('/') === -1;

            let isMatch : boolean;
            if (!matchRouteNode) {
                const path = this.path(),
                      hasPath = path && path.indexOf(param) !== -1;

                isMatch = !!hasPath;
            } else {
                const routeNode = this.routeNode(),
                      isInNode = routeNode && routeNode.indexOf(param) === 0;

                isMatch = !!isInNode;
            }

            return isMatch ? 'active' : '';
        });
    }

}

class UserActivityService {
    private connection = new SignalR.HubConnection('/extern/connect/app-owner');

    public activeClients = ko.observableArray<string>();
    public activeClientCount = ko.pureComputed(() => this.activeClients().length);
    public isConnected = ko.observable<boolean>();

    constructor() {
        this.connection.on('pushClient', (name: string) => this.onPushClient(name));
        this.connection.on('popClient', (name: string) => this.onPopClient(name));
        this.connection.on('setInitialClientList', (names: string[]) => this.onSetInitialClientList(names));

        this.connection.onClosed = (e) => {
            console.error('UserActivityService: Connection failed.');
            console.error(e);

            this.isConnected(false);
        };
    }

    public start() {
        return this.connection.start().then(() => this.isConnected(true));
    }

    public stop() {
        this.connection.stop();
    }

    private onPushClient(name: string): void {
        this.activeClients.remove(name);
        this.activeClients.push(name);
    }

    private onPopClient(name: string): void {
        this.activeClients.remove(name);
    }

    private onSetInitialClientList(names: string[]): void {
        this.activeClients(names);
    }
}

export function register(appContext : AppContext) {
    framework.createPanelComponent('top-menu', () => new TopMenu(appContext));
}