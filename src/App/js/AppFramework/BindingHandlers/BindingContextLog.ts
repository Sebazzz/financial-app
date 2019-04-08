import * as ko from 'knockout';

const noImplMarker = new Object().toString();

function getName(input: any | ko.Observable<any> | undefined | null): string {
    const unwrapped = ko.unwrap(input);

    let toString: string;
    if (unwrapped === null) {
        toString = '(null)';
    } else if (typeof unwrapped === 'undefined') {
        toString = '(undefined)';
    } else if ($.isArray(unwrapped)) {
        toString = `Array [${unwrapped.length}]`;

        if (unwrapped.length <= 50) {
            toString += '[' + unwrapped.map(v => getName(v)).join(',') + ']';
        }
    } else {
        toString = unwrapped.toString();

        if (toString === noImplMarker) {
            const ctor = unwrapped.constructor;
            if (ctor) {
                return ctor.name || getName(ctor);
            }

            const proto = unwrapped.__proto__;
            if (proto) {
                return getName(proto);
            }
        }
    }

    if (ko.isObservable(input)) {
        toString += ' [observable]';
    }

    return toString;
}

function logProperty(name: string, value: any) {
    const fmt = name + ': %s';
    try {
        console.log(fmt, getName(value));
    } catch (e) {
        console.log(fmt, e);
    }
}

function logLookup(prefix: string, bindingContext: any) {
    if ('$lookup' in bindingContext) {
        logProperty(prefix + '$lookup', bindingContext.$lookup);
    }
}

ko.bindingHandlers.bindingContextLog = {
    init(
        element: Node,
        valueAccessor: () => string,
        allBindingsAccessor: ko.AllBindings,
        viewModel: any,
        bindingContext: ko.BindingContext
    ) {
        if (DEBUG === false) {
            return;
        }

        const marker = valueAccessor();

        ko.computed(
            () => {
                try {
                    console.group('bindingContext ' + marker);

                    logProperty('$data', bindingContext.$data);
                    logProperty('$component', bindingContext.$component);
                    logProperty('$index', bindingContext.$index);
                    logProperty('$root', bindingContext.$root);
                    logProperty('$parent', bindingContext.$parent);
                    logLookup('', bindingContext);

                    const parentContext = bindingContext.$parentContext;
                    if (parentContext) {
                        logProperty('$parentContext.$data', parentContext.$data);
                        logProperty('$parentContext.$component', parentContext.$component);
                        logProperty('$parentContext.$index', parentContext.$index);
                        logProperty('$parentContext.$root', parentContext.$root);
                        logProperty('$parentContext.$parent', parentContext.$parent);
                        logLookup('$parentContext.', parentContext);
                    }
                } finally {
                    console.groupEnd();
                }
            },
            null,
            { disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */ }
        );
    }
};
ko.virtualElements.allowedBindings.bindingContextLog = true;
