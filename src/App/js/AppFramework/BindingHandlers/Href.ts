import * as ko from 'knockout';
import { App } from '../AppFactory';

interface IRouteOptions {
    route: string;
    params?: any;
}

function isRouteOptions(item: string | IRouteOptions): item is IRouteOptions {
    return typeof item !== 'string';
}

type HrefOptions = ko.Observable<string> | string | ko.Observable<IRouteOptions> | IRouteOptions;

ko.bindingHandlers.href = {
    init(
        element: HTMLAnchorElement,
        valueAccessor: () => HrefOptions,
        ignored1: any,
        ignored2: any,
        bindingContext: ko.BindingContext
    ) {
        ko.computed(
            () => {
                const options = ko.unwrap<IRouteOptions | string>(valueAccessor());
                if (!isRouteOptions(options)) {
                    element.href = options;
                    return;
                }

                const $app = bindingContext.$root as App,
                    href = $app.router.getRoute(options.route, ko.toJS(options.params));

                element.href = href;
            },
            null,
            {
                disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */
            }
        );
    }
};

ko.bindingHandlers.route = {
    init(
        element: HTMLAnchorElement,
        valueAccessor: () => HrefOptions,
        ignored1: any,
        ignored2: any,
        bindingContext: ko.BindingContext
    ) {
        ko.computed(
            () => {
                let options = ko.unwrap<IRouteOptions | string>(valueAccessor());
                if (!isRouteOptions(options)) {
                    options = {
                        route: options
                    } as IRouteOptions;
                }

                const $app = bindingContext.$root as App,
                    href = $app.router.getRoute(options.route, ko.toJS(options.params));

                element.href = href;
            },
            null,
            {
                disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */
            }
        );
    },
    preprocess(input: string) {
        // We allow the following syntax:
        // route: 'derp'
        // route: derp
        // route: derp | {}

        if (input.indexOf("'") !== -1) {
            return input;
        }

        const paramsSeperatorIndex = input.indexOf('|'),
            paramsString = paramsSeperatorIndex !== -1 ? input.substr(paramsSeperatorIndex + 1) : null,
            routeString = paramsSeperatorIndex !== -1 ? input.substr(0, paramsSeperatorIndex) : input,
            trimmedRouteName = routeString.trim();

        if (paramsString) {
            return `{ route: '${trimmedRouteName}', params: ${paramsString} }`;
        }

        return `'${trimmedRouteName}'`;
    }
};
