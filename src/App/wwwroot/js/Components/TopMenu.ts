import * as framework from '../AppFramework/Panel';
import {State, Plugin as RouterPlugin, PluginFactory as RouterPluginFactory} from 'router5';
import AppContext from '../AppFramework/AppContext';
import * as ko from 'knockout';

class TopMenu extends framework.Panel {
    private path = ko.observable<string>();

    public nowPath = ko.observable<string>('now'); // TODO

    public deactivate(): void {
    }
    protected onActivate(): Promise<void> {
        return Promise.resolve();
    }

    constructor(appContext: AppContext) {
        super(appContext);

        const self = this;
        const menuPlugin: RouterPluginFactory = () => {
            return {
                    onTransitionSuccess(toState: State, fromState: State) {
                        toState && self.path(toState.path);
                    }
                }
        };

        menuPlugin.pluginName = 'top-menu-plugin';
        appContext.router.usePlugin(menuPlugin);
    }

    public hasPath(path: string) {
        return ko.pureComputed(() => {
            const path = this.path();

            return path && path.indexOf(path) !== -1;
        });
    }
}

export function register(appContext : AppContext) {
    framework.createPanelComponent('top-menu', () => new TopMenu(appContext));
}