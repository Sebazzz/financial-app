import * as ko from 'knockout';
import * as v from './ValidateableViewModel';
import { Page } from 'AppFramework/Navigation/Page';

function findValidateableViewModel(bindingContext: ko.BindingContext): v.ValidateableViewModel | null {
    let currentBindingContext: ko.BindingContext | undefined = bindingContext,
        viewModel = bindingContext.$data;

    while (!(viewModel instanceof v.ValidateableViewModel) && viewModel && !(viewModel instanceof Page) /* too far */) {
        currentBindingContext = currentBindingContext && currentBindingContext.$parentContext;

        viewModel = currentBindingContext && currentBindingContext.$data;
    }

    if (!viewModel || !(viewModel instanceof v.ValidateableViewModel)) {
        return null;
    }

    return viewModel;
}

ko.bindingHandlers.validationMessage = {
    init(
        element: HTMLElement,
        valueAccessor: () => string,
        allBindingsAccessor: ko.AllBindings,
        viewModel: any,
        bindingContext: ko.BindingContext
    ) {
        const validatable = findValidateableViewModel(bindingContext),
            property = valueAccessor(),
            $element = $(element);

        if (!validatable) {
            return;
        }

        element.classList.add('invalid-feedback');
        element.classList.add('invalid-feedback-list');

        ko.computed(
            () => {
                const modelState = validatable.modelState();
                if (!modelState) {
                    return;
                }

                const propertyState = modelState[property];
                if (!propertyState) {
                    $element.text('');
                } else {
                    $element.text(propertyState.join('\r\n'));
                }
            },
            null,
            { disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */ }
        );
    },

    preprocess(value: string) {
        return `'${value}'`;
    }
};

ko.bindingHandlers.validationProperty = {
    init(
        element: HTMLInputElement,
        valueAccessor: () => string,
        allBindingsAccessor: ko.AllBindings,
        viewModel: any,
        bindingContext: ko.BindingContext
    ) {
        const validatable = findValidateableViewModel(bindingContext),
            property = valueAccessor();

        if (!validatable) {
            return;
        }

        function mark(validationState: string | undefined) {
            if ('setCustomValidity' in element) {
                element.setCustomValidity(validationState ? validationState : '');

                if (!validationState) {
                    element.removeAttribute('required');
                } else {
                    element.setAttribute('required', 'required');
                }
            } else {
                // Workaround for issue: https://github.com/Microsoft/TypeScript/issues/21517
                const workaround = element as HTMLInputElement;
                if (validationState) {
                    workaround.classList.add('is-invalid');
                } else {
                    workaround.classList.remove('is-invalid');
                }
            }
        }

        ko.computed(
            () => {
                const modelState = validatable.modelState();
                if (!modelState) {
                    return;
                }

                const propertyState = modelState[property];
                if (!propertyState) {
                    mark(undefined);
                } else {
                    mark(propertyState.join('\r\n'));
                }
            },
            null,
            { disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */ }
        );
    },

    preprocess(value: string) {
        return `'${value}'`;
    }
};

function handleByConvention(bindingHandlerName: string): void {
    const bindingHandler = ko.bindingHandlers[bindingHandlerName],
        existingPreprocess = bindingHandler.preprocess;

    bindingHandler.preprocess = (
        value: string,
        name: string,
        addBindingCallback: (name: string, value: string) => void
    ) => {
        addBindingCallback('validationProperty', value);

        return existingPreprocess ? existingPreprocess(value, name, addBindingCallback) : value;
    };
}

handleByConvention('value');
handleByConvention('textInput');
