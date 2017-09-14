import * as ko from 'knockout';
import * as $ from 'jquery';

ko.bindingHandlers['formatText'] = {
    init(element: HTMLElement, valueAccessor: () => any | undefined, allBindingsAccessor: KnockoutAllBindingsAccessor) {
        const $element = $(element);

        ko.computed(() => {
            const format = allBindingsAccessor.get('format'),
                  value = ko.unwrap(valueAccessor()),
                  str = kendo.toString(value, format);

            $element.text(str);
        }).extend({ 'disposeWhenNodeIsRemoved': element });
    }
}