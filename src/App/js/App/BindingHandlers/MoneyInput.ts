import * as ko from 'knockout';
import isMobile from 'AppFramework/Client/BrowserDetector';

const isMobileDevice = isMobile();

/**
 * Check if valueAsNumber is properly supported. Works around Microsoft Edge bug #669685.
 * @param element
 */
function supportsValueAsNumber(element: HTMLInputElement) {
    try {
        element.valueAsNumber = 0; // This line will throw in MS Edge

        element.valueAsNumber = NaN;

        return true;
    } catch (e) {
        return false;
    }
}

function getParseCulture(element: HTMLInputElement) {
    const val = '12,23';
    element.value = val;

    if (element.value !== val) {
        // Happens in Edge
        element.value = '';

        return 'en-US';
    }

    element.value = '';
    return 'nl-NL';
}

function parseValue(element: HTMLInputElement, culture: string): number {
    if (!element.value) {
        return NaN;
    }

    const parsedValue = kendo.parseFloat(element.value, culture);
    if (kendo.toString(parsedValue, 'g') === element.value) {
        return parsedValue;
    }

    // ultimate fallback
    return kendo.parseFloat(element.value, 'en-US');
}

ko.bindingHandlers.moneyInput = {
    init(element: HTMLInputElement, valueAccessor: () => KnockoutObservable<number> | number, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext): void {
        element.classList.add('input-money');
        element.type = 'number';
        element.step = '0.01';

        const isValueAsNumberSupported = supportsValueAsNumber(element),
              parseCulture = getParseCulture(element);
        if (!isValueAsNumberSupported) {
            // Force consistent behavior in Edge
            element.lang = parseCulture;
        }

        let isSettingValue = false;

        // Read from
        ko.computed(() => {
            const value = ko.unwrap(valueAccessor());

            if (isSettingValue || value === null || typeof value === 'undefined' || isNaN(value)) {
                return;
            }

            if (isValueAsNumberSupported) {
                element.valueAsNumber = value;
            } else {
                element.value = kendo.toString(value, 'g', parseCulture);
            }
        }, this, { disposeWhenNodeIsRemoved: element });

        // Write to
        element.addEventListener('change', () => {
            try {
                isSettingValue = true;

                const observable = valueAccessor();
                if (ko.isWriteableObservable(observable)) {
                    const value = isValueAsNumberSupported ? element.valueAsNumber : parseValue(element, parseCulture);

                    if (isNaN(value) || typeof value === 'undefined') {
                        observable(null);
                    } else {
                        observable(value);
                    }

                    ko.tasks.runEarly();
                }
            } finally {
                isSettingValue = false;
            }
        });
    },

    preprocess(value: string, name: string, addBindingCallback: (name: string, value: string) => void) {
        if (!isMobileDevice) {
            addBindingCallback('cleaveCurrency', value);

            // Incorrect type definition
            return (undefined as any) as string;
        }

        return value;
    }
};
