import * as framework from '../AppFramework/Panel';
import {State, PluginFactory as RouterPluginFactory} from 'router5';
import AppContext from '../AppFramework/AppContext';
import * as ko from 'knockout';

class TopMenu extends framework.Panel {
    private path = ko.observable<string>('/');

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
                }
            }
        };

        menuPlugin.pluginName = 'top-menu-plugin';
        appContext.router.usePlugin(menuPlugin);
    }

    public hasPath(searchPath: string|KnockoutObservable<string>) {
        return ko.pureComputed(() => {
            const path = this.path(),
                  subPath = ko.unwrap(searchPath),
                  isHomePath = searchPath === '/',
                  hasPath = isHomePath ? path === '/' : path && path.indexOf(subPath) !== -1;

            return hasPath ? 'active' : '';
        });
    }
}

export function register(appContext : AppContext) {
    framework.createPanelComponent('top-menu', () => new TopMenu(appContext));
}