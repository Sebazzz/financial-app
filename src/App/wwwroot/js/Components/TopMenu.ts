import * as framework from '../AppFramework/Panel';
import {State, PluginFactory as RouterPluginFactory} from 'router5';
import AppContext from '../AppFramework/AppContext';
import * as ko from 'knockout';

class TopMenu extends framework.Panel {
    private path = ko.observable<string>('/');
    private routeNode = ko.observable<string>('default');

    public nowPath = ko.observable<string>('now'); // TODO
    public currentUserName = ko.pureComputed(() => this.appContext.authentication.currentAuthentication().userName);

    public deactivate(): void {
    }
    protected onActivate(): Promise<void> {
        return Promise.resolve();
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

export function register(appContext : AppContext) {
    framework.createPanelComponent('top-menu', () => new TopMenu(appContext));
}