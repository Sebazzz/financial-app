import * as framework from 'AppFramework/Panel';
import { Plugin, PluginFactory, State } from 'router5';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';
import NowRouteProvider from 'App/Services/NowRoute';
import * as SignalR from '@aspnet/signalr';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/dropdown';

class TopMenu extends framework.Panel {
    private activityService = new UserActivityService();

    private path = ko.observable<string>('/');
    private routeNode = ko.observable<string>('default');

    public nowPath = ko.pureComputed<string>(() => {
        return new NowRouteProvider().getRoute(this.appContext.app.router);
    });

    public currentUserName = ko.pureComputed(() => this.appContext.authentication.currentAuthentication().userName);
    public currentGroupName = ko.pureComputed(
        () => this.appContext.authentication.currentAuthentication().currentGroupName
    );

    public roles = ko.pureComputed(() => this.appContext.authentication.currentAuthentication().roles.join(', '));

    public activeClientCount = this.activityService.activeClientCount;
    public isConnected = this.activityService.isConnected;
    public showActiveClientTooltip = ko.observable<boolean>(false);
    public activeClientTooltip = ko.pureComputed(
        () => 'Ingelogde gebruikers: ' + this.activityService.activeClients().join(', ')
    );

    public currentLoginTooltip = ko.computed(() => `Huidige context: ${this.currentGroupName() || 'Unknown'}`);

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

    private handleAuthenticationChange(isAuthenticated: boolean) {
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

        const menuPlugin = ((() => {
            return {
                onTransitionStart: () => {
                    // collapse menu
                    TopMenu.collapse();
                },
                onTransitionSuccess: (toState: State) => {
                    // tslint:disable-next-line:no-unused-expression
                    toState && this.path(toState.path);

                    // tslint:disable-next-line:no-unused-expression
                    toState && this.routeNode(toState.name);
                }
            } as Plugin;
        }) as any) as PluginFactory;

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

    public static collapse() {
        const $navbarToggler = $('.navbar-toggler'),
            $topMenu = $('#top-menu-content');

        if ($topMenu.hasClass('show') && !$topMenu.hasClass('collapsing')) {
            $navbarToggler.click();
        }
    }

    public hasLocation(paramRaw: string | ko.Observable<string>) {
        const isMatch = (param: string) => {
            const matchRouteNode = param.indexOf('/') === -1;
            let isMatch: boolean;
            if (!matchRouteNode) {
                const path = this.path(),
                    hasPath = path && path.indexOf(param) !== -1;

                isMatch = !!hasPath;
            } else {
                const routeNode = this.routeNode(),
                    isInNode = routeNode && routeNode.indexOf(param) === 0;

                isMatch = !!isInNode;
            }

            return isMatch;
        };

        return ko.pureComputed(() => {
            const nowPath = ko.unwrap(this.nowPath),
                requestingNowPath = paramRaw === nowPath,
                param = ko.unwrap(paramRaw);

            let matchingParam = isMatch(param);

            // if we are matching the "now path" - we can't match anything else
            if (matchingParam && !requestingNowPath && isMatch(this.nowPath())) {
                matchingParam = false;
            }

            return matchingParam ? 'active' : '';
        });
    }
}

async function buildSignalRConnection() {
    const signalR = await import('@aspnet/signalr');

    return new signalR.HubConnectionBuilder()
        .withUrl('/extern/connect/app-owner')
        .configureLogging(DEBUG ? signalR.LogLevel.Information : signalR.LogLevel.Error)
        .build();
}

class UserActivityService {
    private connection: SignalR.HubConnection | null = null;

    public activeClients = ko.observableArray<string>();
    public activeClientCount = ko.pureComputed(() => this.activeClients().length);
    public isConnected = ko.observable<boolean>();
    public isConnecting = ko.observable<boolean>();

    private async initialize() {
        if (this.connection) {
            return;
        }

        this.connection = await buildSignalRConnection();

        this.connection.on('pushClient', (name: string) => this.onPushClient(name));
        this.connection.on('popClient', (name: string) => this.onPopClient(name));
        this.connection.on('setInitialClientList', (names: string[]) => this.onSetInitialClientList(names));

        this.connection.onclose(() => {
            console.warn('UserActivityService: Connection failed or closed');

            this.isConnected(false);
        });
    }

    public async start() {
        if (!this.connection) {
            await this.initialize();
        }

        if (this.isConnecting()) {
            console.log(
                'UserActivityService: start request ignored - either the connection is started or the connection is starting'
            );
            return;
        }

        if (this.isConnected()) {
            console.log('UserActivityService: start request - while the connection is started - restarting connection');

            if (this.connection) {
                await this.connection.stop();

                while (this.isConnected()) {
                    await new Promise(resolve => window.setTimeout(() => resolve(), 10));
                }
            }
        }

        console.log('UserActivityService: starting connection');
        try {
            this.isConnecting(true);
            this.isConnected(false);

            await this.connection!.start();
            console.log('UserActivityService: started connection');

            this.isConnected(true);
        } finally {
            this.isConnecting(false);
        }
    }

    public stop() {
        if (!this.connection) {
            return;
        }

        console.log('UserActivityService: stopping connection');
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

export function register(appContext: AppContext) {
    framework.createPanelComponent(
        'top-menu',
        require('~/ko-templates/widgets/top-menu.html'),
        () => new TopMenu(appContext)
    );
}
