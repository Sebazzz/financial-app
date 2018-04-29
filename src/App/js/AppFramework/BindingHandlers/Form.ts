import * as ko from 'knockout';
import { Page } from '../Page';
import { ValidateableViewModel } from '../Forms/ValidateableViewModel';
import { IFormPage } from '../Forms/FormPage';

function findPage(bindingContext: KnockoutBindingContext): IFormPage {
    let currentBindingContext: KnockoutBindingContext | undefined = bindingContext,
        viewModel = bindingContext.$data;

    while (!(viewModel instanceof Page) && viewModel) {
        currentBindingContext = currentBindingContext && currentBindingContext.$parentContext;

        viewModel = currentBindingContext && currentBindingContext.$data;
    }

    if (!viewModel) {
        throw new Error('Unable to find form page');
    }

    return viewModel;
}

export interface IFormOptions {
    handler: (viewModel: ValidateableViewModel, submissionName?: string | null) => Promise<void>;
    isBusy: KnockoutObservable<boolean>;
    errorMessage?: KnockoutObservable<string>;
}

/**
 * The form binding handler handles common requirements of forms:
 * - Disabling any submit buttons on submission
 * - Auto-binding of submit button to save handler
 * - Set/unset busy flags
 */
ko.bindingHandlers.form = {
    init(
        element: HTMLElement,
        valueAccessor: () => IFormOptions | undefined,
        allBindingsAccessor: KnockoutAllBindingsAccessor,
        viewModel: ValidateableViewModel,
        bindingContext: KnockoutBindingContext
    ) {
        const $element = $(element),
            page = findPage(bindingContext),
            options = valueAccessor() || {
                handler: page.save,
                isBusy: page.isBusy,
                errorMessage: page.errorMessage
            };

        function setErrorMessage(msg: string | null) {
            if (options.errorMessage) {
                options.errorMessage(msg);
            }
        }

        const handler = async (ev: any) => {
            ev.preventDefault();

            console.group('Form: Submit');

            try {
                element.classList.remove('was-validated');
                element.classList.add('is-busy');

                options.isBusy(true);
                setErrorMessage(null);

                // This is the fun/odd part: When a submit event is captured, we cannot actually find out
                // which button has caused the submit, other than checking which buttons has the current focus
                const focusedElement = document.activeElement;
                console.debug(focusedElement);

                const submissionName: string | null = (focusedElement && focusedElement.getAttribute('name')) || null;
                await options.handler(viewModel, submissionName);
            } catch (e) {
                setErrorMessage('Dat ging niet goed. Probeer het nog eens.');

                console.error('Form: Caught exception: %s', e);
                console.error(e);
            } finally {
                element.classList.add('was-validated');
                element.classList.remove('is-busy');
                options.isBusy(false);

                console.groupEnd();
            }
        };

        if (element.tagName === 'FORM') {
            $element.on('submit', handler);
        } else {
            $element.on('click', '.btn.btn-primary', handler);
        }

        const $buttons = $(element).find('button');
        ko.computed(() => $buttons.prop('disabled', options.isBusy())).extend({ disposeWhenNodeIsRemoved: element });
    }
};
