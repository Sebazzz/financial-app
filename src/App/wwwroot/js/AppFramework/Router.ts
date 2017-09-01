import browserPlugin from 'router5/plugins/browser';
import { createRouter, constants, errorCodes, loggerPlugin, transitionPath, Route, Router as RouterImpl } from 'router5'

export type RoutingTable = Array<Route>;

export interface IRouteProvider {
    routes: RoutingTable;
}

export class Router {
    private router: RouterImpl = null;

    constructor() {
        this.router = createRouter(null, {defaultRoute: 'default'});
        this.router.usePlugin(loggerPlugin);
        this.router.usePlugin(browserPlugin({}));
    }

    public addPage(page: IRouteProvider) {
        this.router.add(page.routes);
    }

    public start() {
        this.router.start();
    }

    public getInternalInstance(): RouterImpl { return this.router; }

    public matchPage(routeName : string, page: IRouteProvider): boolean {
        for (const route of page.routes) {
            if (route.name === routeName) {
                return true;
            }
        }

        return false;
    }
}