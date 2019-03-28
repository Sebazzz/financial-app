import browserPlugin from 'router5-plugin-browser';
import loggerPlugin from 'router5-plugin-logger';
import { createRouter, Route as RouteImpl, Router as RouterImpl } from 'router5';
import * as $ from 'jquery';
import { telemetryPlugin } from 'AppFramework/Services/Telemetry';

export type Route = RouteImpl;
export type Routes = Route[];
export type RoutingTable = Routes | Route;

export interface IRouteProvider {
    routes: RoutingTable;
}

export class Router {
    private router: RouterImpl = createRouter([], {
        defaultRoute: 'default',
        queryParamsMode: 'loose'
    });

    private pendingRoutes: Routes = [];

    constructor() {
        this.router.usePlugin(loggerPlugin);
        this.router.usePlugin(browserPlugin({}));
        this.router.usePlugin(telemetryPlugin);
    }

    /**
     * Appends one or more routes to the buffer, to be flushed later in @{flush}
     * @param routes Route or routes to add
     */
    public add(routes: RoutingTable | Route) {
        if (Array.isArray(routes)) {
            this.pendingRoutes.push(...routes);
        } else {
            this.pendingRoutes.push(routes);
        }
    }

    /**
     * Flush all pending routes added in @{add}
     */
    public flush() {
        // Add all routes at once, and sort them to prevent issues where the parent route is not yet recognized
        // IMHO this is a limitation in router5, where at some point before the first routing the actual compilation
        // of the routes should be done, but it is how it is.

        this.pendingRoutes.sort((a, b) => (a.name > b.name ? 1 : -1));

        console.info('Router: flushing %d routes', this.pendingRoutes.length);

        this.router.add(this.pendingRoutes);
        this.pendingRoutes.length = 0;
    }

    public start() {
        this.router.start();

        this.initListener();
    }

    private initListener() {
        function findAnchor(element: HTMLElement): HTMLAnchorElement | null {
            let current: HTMLElement | null = element,
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
            const anchor = findAnchor(ev.target as any);
            if (!anchor) {
                return;
            }

            const href = (anchor as HTMLAnchorElement).href,
                origin = document.location!.origin,
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

    public getInternalInstance(): RouterImpl {
        return this.router;
    }

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
