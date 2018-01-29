import browserPlugin from 'router5/plugins/browser';
import { createRouter, loggerPlugin, Route as RouteImpl, Router as RouterImpl } from 'router5';
import * as $ from 'jquery';
import { telemetryPlugin } from './Services/Telemetry';

export type Route = RouteImpl;
export type Routes = Route[];
export type RoutingTable = Routes | Route;

export interface IRouteProvider {
    routes: RoutingTable;
}

export class Router {
    private router: RouterImpl = createRouter.call(window, undefined, { defaultRoute: 'default' });

    constructor() {
        this.router.usePlugin(loggerPlugin);
        this.router.usePlugin(browserPlugin({}));
        this.router.usePlugin(telemetryPlugin);
    }

    public add(routes: RoutingTable | Route) {
        if (Array.isArray(routes)) {
            this.router.add(routes);
        } else {
            this.router.add([routes]);
        }
    }

    public start() {
        this.router.start();

        this.initListener();
    }

    private initListener() {
        function findAnchor(element: HTMLElement): HTMLAnchorElement|null {
            let current: HTMLElement|null = element,
                depth = 4;

            while (current) {
                if (current.tagName === 'A' || current.tagName === 'a') {
                    return current as HTMLAnchorElement;
                }

                current = current.parentElement;
                depth--;

                if (depth < 0) {
                    break;
                }
            }

            return null;
        }

        $(document).on('click', 'a, a *', ev => {
            const anchor = findAnchor(ev.target);
            if (!anchor) {
                return;
            }

            const href = (anchor as HTMLAnchorElement).href,
                origin = document.location.origin,
                hrefWithoutOrigin = href && href.indexOf(origin) === 0 ? href.substr(origin.length) : href;

            if (!hrefWithoutOrigin || hrefWithoutOrigin.indexOf('#') === 0) {
                return;
            }

            const state = this.router.matchPath(hrefWithoutOrigin);
            if (!state) {
                return;
            }

            ev.preventDefault();
            ev.stopPropagation();

            this.router.navigate(state.name, state.params);
        });
    }

    public getInternalInstance(): RouterImpl { return this.router; }

    public matchRoutingTable(routeName: string, routes: RoutingTable): boolean {
        if (!Array.isArray(routes)) {
            return routes.name === routeName;
        }

        for (const route of routes) {
            if (route.name === routeName) {
                return true;
            }
        }

        return false;
    }

    public getRoute(route: string, params?: any): string {
        const state = this.router.buildPath(route, params || {});

        if (state === null) {
            console.warn('Router: Unable to find route named "%s"', route);
            return '';
        }

        return state;
    }
}
