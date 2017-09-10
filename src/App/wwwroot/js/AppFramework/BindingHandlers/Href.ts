import * as ko from 'knockout';
import {App} from '../AppFactory';

interface IRouteOptions {
    route: string;
    params?: any;
}

function isRouteOptions(item: string | IRouteOptions): item is IRouteOptions {
    return typeof item !== 'string';
}

type HrefOptions = KnockoutObservable<string> | string | KnockoutObservable<IRouteOptions> | IRouteOptions;

ko.bindingHandlers['href'] = {
    init(element: HTMLAnchorElement, valueAccessor: () => HrefOptions, ignored1:any, ignored2:any, bindingContext: KnockoutBindingContext) {
        ko.computed(() => {
            const options = ko.unwrap<IRouteOptions | string>(valueAccessor());
            if (!isRouteOptions(options)) {
                element.href = options;
                return;
            }

            const $app = bindingContext.$root as App,
                  href = $app.router.getRoute(options.route, options.params);

            element.href = href;
        }).extend({
            disposeWhenNodeIsRemoved: element
        });
    }
};