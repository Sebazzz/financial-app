import * as ko from 'knockout';

export type ModuleLoader<T> = () => Promise<T>;

export type LoadingHandler = (element: Element) => void;

export interface IPartialBindingHandler<T> {
    init: (
        library: T,
        element: any,
        valueAccessor: () => any,
        allBindingsAccessor?: ko.AllBindings,
        viewModel?: any,
        bindingContext?: ko.BindingContext
    ) => void;
}

export default function register<T>(
    name: string,
    loader: ModuleLoader<T>,
    initBindingHandler: IPartialBindingHandler<T>,
    loadingHandler?: LoadingHandler
) {
    ko.bindingHandlers[name] = {
        init(
            element: Element,
            valueAccessor: () => any,
            allBindingsAccessor?: ko.AllBindings,
            viewModel?: any,
            bindingContext?: ko.BindingContext
        ) {
            const initInternal = async () => {
                let disposed = false;

                loadingHandler && loadingHandler(element);

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => (disposed = true));
                const module = await loader();
                if (disposed) {
                    return;
                }

                initBindingHandler.init(module, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            };

            initInternal();
        }
    };
}
