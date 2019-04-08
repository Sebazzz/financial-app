import { Page } from 'AppFramework/Navigation/Page';

const bindingContextPreprocessMarker = '__unnamedBindingContextExtender';

export default function preprocessBindingContext(bindingContext: ko.BindingContext) {
    const writeableBindingContext = bindingContext as any;

    if (writeableBindingContext[bindingContextPreprocessMarker]) {
        return;
    }

    let page: Page | null = null;
    function findPage(): Page | null {
        if (page) {
            return page;
        }

        let ctx: ko.BindingContext | undefined = bindingContext;
        while (ctx) {
            if (ctx.$data instanceof Page) {
                return (page = ctx.$data);
            }

            ctx = ctx.$parentContext;
        }

        console.log('findPage: Not able to find the page');
        return null;
    }

    // We define three properties:
    //  $app: The application instance
    //  $appContext: The application context
    //  $page: If applicable, gets the page instance
    Object.defineProperties(writeableBindingContext, {
        $app: {
            configurable: true,
            get: () => bindingContext.$root,
            enumerable: true
        },
        $appContext: {
            configurable: true,
            get: () => bindingContext.$root.context,
            enumerable: true
        },
        $page: {
            configurable: true,
            get: findPage,
            enumerable: false // when extending the binding context knockout will actually call this property, not ideal
        }
    });

    // Mark that we have processed this binding context
    writeableBindingContext[bindingContextPreprocessMarker] = bindingContextPreprocessMarker;

    // Ensure child binding contexts will always get the new properties applied ASAP
    const extend = bindingContext.extend,
        createChildContext = bindingContext.createChildContext;

    writeableBindingContext.extend = function() {
        const newContext = extend.apply(this, arguments as any);

        delete (newContext as any)[bindingContextPreprocessMarker];
        preprocessBindingContext(newContext);

        return newContext;
    };

    writeableBindingContext.createChildContext = function() {
        const childContext = createChildContext.apply(this, arguments as any);

        delete childContext[bindingContextPreprocessMarker];
        preprocessBindingContext(childContext);

        return childContext;
    };
}
