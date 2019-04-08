import * as ko from 'knockout';

type AsyncClickHandler<T> = (viewModel: T, event: MouseEvent) => Promise<void>;

ko.bindingHandlers.asyncClick = {
    init<TViewModel>(
        element: HTMLButtonElement,
        valueAccessor: () => AsyncClickHandler<TViewModel>,
        _: ko.AllBindings,
        viewModel: TViewModel
    ) {
        ko.utils.registerEventHandler(element, 'click', (event: MouseEvent) => {
            const handler = valueAccessor();

            if (!handler) {
                return;
            }

            event.preventDefault();

            (async () => {
                element.disabled = true;

                try {
                    await handler.call(viewModel, viewModel, event);
                } finally {
                    element.disabled = false;
                }
            })();
        });
    }
};
