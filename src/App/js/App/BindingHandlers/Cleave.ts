import * as Cleave from 'cleave.js';
import * as ko from 'knockout';
import * as $ from 'jquery';
import { App } from 'AppFramework/AppFactory';
import {
    getNumberFormat as getCurrentNumberFormat,
    currencyFormats,
    currencyFormat,
    Parse as NumberParse
} from 'AppFramework/Internationalization/Number';

ko.bindingHandlers.cleave = {
    init(
        element: HTMLInputElement,
        valueAccessor: () => any,
        allBindingsAccessor: ko.AllBindings,
        viewModel?: any,
        bindingContext?: ko.BindingContext
    ): void {
        const app = bindingContext && bindingContext.$root;

        if (!app || !(app instanceof App)) {
            throw new Error('Unable to find application view model');
        }

        const cleaveOptions = allBindingsAccessor.get('cleaveOptions'),
            cleave = new Cleave(element, cleaveOptions);

        ko.computed(
            () => {
                let rawValue = ko.unwrap(valueAccessor());

                if (rawValue === null || typeof rawValue === 'undefined') {
                    rawValue = '';
                }

                // Trigger JQuery event if necesary
                $(element).trigger('change');

                cleave.setRawValue(rawValue);
            },
            this,
            { disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */ }
        );

        function updateObservable() {
            const obs = valueAccessor();
            if (ko.isWriteableObservable(obs)) {
                const rawValue = cleave.getFormattedValue();

                obs(rawValue);
            }
        }

        element.addEventListener('input', updateObservable);
        element.addEventListener('blur', updateObservable);
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => cleave.destroy());
        ko.utils.domNodeDisposal.addDisposeCallback(element, () =>
            element.removeEventListener('blur', updateObservable)
        );
    }
};

ko.bindingHandlers.cleaveNumber = ko.bindingHandlers.cleaveCurrency = {
    init(
        element: HTMLInputElement,
        valueAccessor: () => any,
        allBindingsAccessor: ko.AllBindings,
        viewModel?: any,
        bindingContext?: ko.BindingContext
    ): void {
        const app = bindingContext && bindingContext.$root;

        if (!app || !(app instanceof App)) {
            throw new Error('Unable to find application view model');
        }

        const cultureInfo = getCurrentNumberFormat(),
            currentCurrencyFormat = currencyFormats[currencyFormat];

        const isCurrency = !!allBindingsAccessor.get('cleaveCurrency'),
            cleaveOptions = {
                numeral: true,
                numeralDecimalScale: allBindingsAccessor.get('cleaveNumberScale') || 2,
                prefix: isCurrency ? currentCurrencyFormat.symbol() + ' ' : undefined,
                numeralDecimalMark: cultureInfo.decimalSeperator,
                delimiter: cultureInfo.thousandSeperator
            },
            cleave = new Cleave(element, cleaveOptions);

        ko.computed(
            () => {
                let rawValue = ko.unwrap(valueAccessor());

                if (rawValue === null || typeof rawValue === 'undefined') {
                    rawValue = '';
                }

                // Trigger JQuery event if necesary
                $(element).trigger('change');

                cleave.setRawValue(rawValue);
            },
            this,
            { disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */ }
        );

        function updateObservable() {
            const obs = valueAccessor();
            if (ko.isWriteableObservable(obs)) {
                let rawValue = cleave.getFormattedValue();

                if (rawValue === null || typeof rawValue === 'undefined' || rawValue === '') {
                    rawValue = null;
                } else {
                    rawValue = rawValue.substr(cleaveOptions.prefix ? cleaveOptions.prefix.length : 0);
                    rawValue = NumberParse.float(rawValue);
                    console.assert(!isNaN(rawValue), 'Error parsing value');
                }

                obs(rawValue);
            }
        }

        element.addEventListener('blur', updateObservable);
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => cleave.destroy());
        ko.utils.domNodeDisposal.addDisposeCallback(element, () =>
            element.removeEventListener('blur', updateObservable)
        );
    }
};
