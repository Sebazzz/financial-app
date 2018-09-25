import * as ko from 'knockout';
import * as $ from 'jquery';

import { compositeFormat, toString as valueToString } from 'AppFramework/Internationalization/String';

ko.bindingHandlers.formatText = {
    init(element: HTMLElement, valueAccessor: () => any | undefined, allBindingsAccessor: KnockoutAllBindingsAccessor) {
        const $element = $(element);

        ko.computed(() => {
            const format = allBindingsAccessor.get('format'),
                value = ko.unwrap(valueAccessor()),
                isCompositeFormatString = format.indexOf('{') !== -1,
                str = isCompositeFormatString ? compositeFormat(format, value) : valueToString(value, format);

            $element.text(str);
        }).extend({ disposeWhenNodeIsRemoved: element });
    }
};
