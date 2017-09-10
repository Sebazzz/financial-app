import * as ko from 'knockout';
import * as $ from 'jquery';

type TooltipOptions = KnockoutObservable<string> | string;

ko.bindingHandlers['tooltip'] = {
    init(element: HTMLElement, valueAccessor: () => TooltipOptions) {
        ko.computed(() => {
            const text = ko.unwrap(valueAccessor());
            $(element).tooltip({
                title: text
            });
        }).extend({
            disposeWhenNodeIsRemoved: element
        });
    }
};