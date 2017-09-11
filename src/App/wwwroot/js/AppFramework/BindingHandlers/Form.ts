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

/**
 * The form binding handler handles common requirements of forms:
 * - Disabling any submit buttons on submission
 * - Auto-binding of submit button to save handler
 * - Set/unset busy flags
 */
ko.bindingHandlers['form'] = {
    init(element: HTMLElement, valueAccessor: () => ValidateableViewModel|undefined, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: ValidateableViewModel, bindingContext: KnockoutBindingContext) {
        const page = findPage(bindingContext);

        $(element).on('submit', async (ev) => {
            ev.preventDefault();

            console.group('Form: Submit');

            try {
                element.classList.remove('was-validated');
                page.errorMessage(null);
                page.isBusy(true);

                await page.save();
            } catch (e) {
                page.errorMessage('Oeps. Dat ging niet goed. Probeer het nog eens.');

                console.error('Form: Caught exception: %s', e);
                console.error(e);
            } finally {
                element.classList.add('was-validated');
                page.isBusy(false);

                console.groupEnd();
            }
        });

        const $buttons = $(element).find('button');
        ko.computed(() => $buttons.prop('disabled', page.isBusy())).extend({ 'disposeWhenNodeIsRemoved': element });
    }
};