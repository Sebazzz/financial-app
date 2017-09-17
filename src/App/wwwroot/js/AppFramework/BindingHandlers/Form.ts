import * as ko from 'knockout';
import {Page} from '../Page';
import {ValidateableViewModel} from '../Forms/ValidateableViewModel';
import {IFormPage} from '../Forms/FormPage'

function findPage(bindingContext: KnockoutBindingContext) : IFormPage {
    let currentBindingContext : KnockoutBindingContext | undefined = bindingContext,
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
    handler: (viewModel : ValidateableViewModel) => Promise<void>;
    isBusy: KnockoutObservable<boolean>;
}

/**
 * The form binding handler handles common requirements of forms:
 * - Disabling any submit buttons on submission
 * - Auto-binding of submit button to save handler
 * - Set/unset busy flags
 */
ko.bindingHandlers['form'] = {
    init(element: HTMLElement, valueAccessor: () => IFormOptions|undefined, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: ValidateableViewModel, bindingContext: KnockoutBindingContext) {
        const $element = $(element),
              page = findPage(bindingContext),
              options = valueAccessor() || { handler: page.save, isBusy: page.isBusy };

        const handler = async (ev : any) => {
            ev.preventDefault();

            console.group('Form: Submit');

            try {
                element.classList.remove('was-validated');
                element.classList.add('is-busy');

                page.errorMessage(null);
                options.isBusy(true);

                await options.handler(viewModel);
            } catch (e) {
                page.errorMessage('Oeps. Dat ging niet goed. Probeer het nog eens.');

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
        ko.computed(() => $buttons.prop('disabled', options.isBusy())).extend({ 'disposeWhenNodeIsRemoved': element });
    }
};