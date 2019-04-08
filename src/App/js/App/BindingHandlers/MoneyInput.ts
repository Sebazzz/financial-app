import * as ko from 'knockout';
import { NumberParse, NumberFormat, Culture } from 'AppFramework/Internationalization';
import isMobile from 'AppFramework/Client/BrowserDetector';

const isMobileDevice = isMobile();

/**
 * Check if valueAsNumber is properly supported. Works around Microsoft Edge bug #669685.
 * @param element
 */
function supportsValueAsNumber(element: HTMLInputElement) {
    try {
        element.valueAsNumber = 0; // This line will throw in MS Edge

        return true;
    } catch (e) {
        alert(e);
        alert(e.message);
        return false;
    }
}

function getParseCulture(element: HTMLInputElement): Culture {
    const val = '12,23';
    element.value = val;

    if (element.value !== val) {
        // Happens in Edge
        element.value = '';

        return Culture.USEnglish;
    }

    element.value = '';
    return Culture.Dutch;
}

function parseValue(element: HTMLInputElement, culture: Culture): number {
    if (!element.value) {
        return NaN;
    }

    const parsedValue = NumberParse.float(element.value, culture);
    if (NumberFormat.decimal(parsedValue) === element.value) {
        return parsedValue;
    }

    // ultimate fallback
    return NumberParse.float(element.value, Culture.USEnglish);
}

ko.bindingHandlers.moneyInput = {
    init(element: HTMLInputElement, valueAccessor: () => ko.Observable<number | null> | number | null): void {
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
        ko.computed(
            () => {
                const value = ko.unwrap(valueAccessor());

                if (isSettingValue || value === null || typeof value === 'undefined' || isNaN(value)) {
                    return;
                }

                if (isValueAsNumberSupported) {
                    element.valueAsNumber = value;
                } else {
                    element.value = NumberFormat.decimal(value, undefined, parseCulture);
                }
            },
            this,
            { disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */ }
        );

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
