import browserPlugin from 'router5/plugins/browser';
import { createRouter, loggerPlugin, Route, Router as RouterImpl } from 'router5';
import * as $ from 'jquery';

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

        this.initListener();
    }

    private initListener() {
        $(document.body).on('click', 'a', (ev) => {
            const anchor = ev.target,
                href = (anchor as HTMLAnchorElement).href,
                origin = document.location.origin,
                hrefWithoutOrigin = href.indexOf(origin) === 0 ? href.substr(origin.length) : href;

            if (!hrefWithoutOrigin) {
                return;
            }

            const state = this.router.matchPath(hrefWithoutOrigin);
            if (!state) {
                return;
            }

            ev.preventDefault();
            this.router.navigate(state.name, state.params);
        });
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