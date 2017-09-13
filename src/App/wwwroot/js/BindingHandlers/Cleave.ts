import * as Cleave from 'cleave.js';
import * as ko from 'knockout';
import * as $ from 'jquery';

ko.bindingHandlers['cleaveNumber'] = ko.bindingHandlers['cleaveCurrency'] = {
    init(element: HTMLInputElement, valueAccessor: () => any, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext): void {
        const isCurrency = !!allBindingsAccessor.get('cleaveCurrency');                                                                                                                                  
        const scale = allBindingsAccessor.get('cleaveNumberScale') || 2;
        const prefix = isCurrency ? '€' : undefined;
        const cleave = new Cleave(element, { numeral: true, numeralDecimalScale: scale, prefix: prefix });

        ko.computed(() => {
            let rawValue = ko.unwrap(valueAccessor());

            if (rawValue === null || typeof rawValue === 'undefined') {
                rawValue = '';
            }

            // Trigger JQuery event if necesary
            $(element).trigger('change');

            cleave.setRawValue(rawValue);
        }, this, { disposeWhenNodeIsRemoved: element });

        function updateObservable() {
            const obs = valueAccessor();
            if (ko.isWriteableObservable(obs)) {
                let rawValue = cleave.getRawValue();

                if (rawValue === null || typeof rawValue === 'undefined' || rawValue === '') {
                    rawValue = null;
                } else {
                    rawValue = rawValue.substr(prefix ? prefix.length : 0);
                    rawValue = parseFloat(rawValue);
                    console.assert(!isNaN(rawValue), 'Error parsing value');
                }

                obs(rawValue);
            }
        }

        element.addEventListener('blur', updateObservable);
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => cleave.destroy());
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => element.removeEventListener('blur', updateObservable));
    }
}