﻿import * as ko from 'knockout';

const isMobileDevice = document.documentElement.getAttribute('data-app-mobile') !== 'false';

/**
 * Check if valueAsNumber is properly supported. Works around Microsoft Edge bug #669685.
 * @param element
 */
function supportsValueAsNumber(element: HTMLInputElement) {
    try {
        element.valueAsNumber = 0; // This line will throw

        element.valueAsNumber = NaN;

        return true;
    } catch (e) {
        return false;
    }
}

function parseValue(element: HTMLInputElement) : number {
    if (!element.value) {
        return NaN;
    }

    const parsedValue = kendo.parseFloat(element.value);
    if (kendo.toString(parsedValue, 'g') === element.value) {
        return parsedValue;
    }

    // input type=number appears to be fixed to decimal points
    return kendo.parseFloat(element.value, 'en-US');
}

ko.bindingHandlers['moneyInput'] = {
    init(element: HTMLInputElement, valueAccessor: () => KnockoutObservable<number> | number, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext): void {
        element.classList.add('input-money');
        element.type = 'number';
        element.step = '0.01';

        const isValueAsNumberSupported = supportsValueAsNumber(element);
        if (!isValueAsNumberSupported) {
            // Force consistent behavior in Edge
            element.lang = 'en-US';
        }

        let isSettingValue = false;

        // Read from
        ko.computed(() => {
            let value = ko.unwrap(valueAccessor());

            if (isSettingValue || value === null || typeof value === 'undefined' || isNaN(value)) {
                return;
            }

            if (isValueAsNumberSupported) {
                element.valueAsNumber = value;
            } else {
                element.value = kendo.toString(value, 'g', 'en-US');
            }
        }, this, { disposeWhenNodeIsRemoved: element });

        // Write to
        element.addEventListener('change', () => {
            try {
                isSettingValue = true;

                const observable = valueAccessor();
                if (ko.isWriteableObservable(observable)) {
                    const value = isValueAsNumberSupported ? element.valueAsNumber : parseValue(element);

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
}