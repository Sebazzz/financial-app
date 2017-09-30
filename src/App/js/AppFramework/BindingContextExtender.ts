import {Page} from './Page';

const bindingContextPreprocessMarker = '__unnamedBindingContextExtender';

export default function preprocessBindingContext(bindingContext: KnockoutBindingContext) {
    const writeableBindingContext = bindingContext as any;

    if (writeableBindingContext[bindingContextPreprocessMarker]) {
        return;
    }

    let page: Page | null = null;
    function findPage(): Page | null {
        if (page) {
            return page;
        }

        let ctx: KnockoutBindingContext | undefined = bindingContext;
        while (ctx) {
            if (ctx.$data instanceof Page) {
                return page = ctx.$data;
            }

            ctx = ctx.$parentContext;
        }

        return null;
    }

    // We define three properties:
    //  $app: The application instance
    //  $appContext: The application context
    //  $page: If applicable, gets the page instance
    Object.defineProperties(writeableBindingContext, {
        '$app': {
            get: () => bindingContext.$root,
            enumerable: true
        },
        '$appContext': {
            get: () => bindingContext.$root.context,
            enumerable: true
        },
        '$page': {
            get: () => findPage(),
            enumerable: true
        }
    });

    // Mark that we have processed this binding context
    writeableBindingContext[bindingContextPreprocessMarker] = bindingContextPreprocessMarker;

    // Ensure child binding contexts will always get the new properties applied ASAP
    const extend = bindingContext.extend,
          createChildContext = bindingContext.createChildContext;

    writeableBindingContext.extend = function () {
        preprocessBindingContext(this);
        return extend.apply(this, arguments);
    };

    writeableBindingContext.createChildContext = function () {
        const childContext = createChildContext.apply(this, arguments);
        preprocessBindingContext(childContext);
        return childContext;
    };
}