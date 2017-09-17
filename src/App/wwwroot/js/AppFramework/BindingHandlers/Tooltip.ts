import * as ko from 'knockout';
import * as $ from 'jquery';

interface ITooltipOptions {
    text: KnockoutObservable<string> | string;
    forceOpen: KnockoutObservable<boolean> | boolean;
}

type TooltipOptions = KnockoutObservable<string> | string | ITooltipOptions;

function getTooltipOptions(input: TooltipOptions) {
    const textMaybeString = ko.unwrap<string | ITooltipOptions>(input);
    if (typeof textMaybeString === 'string') {
        return {
            text: input as (KnockoutObservable<string> | string),
            forceOpen: false
        };
    }

    return input as ITooltipOptions;
}


ko.bindingHandlers['tooltip'] = {
    init(element: HTMLElement, valueAccessor: () => TooltipOptions) {
        const $element = $(element);

        ko.computed(() => {
            const options = getTooltipOptions(valueAccessor());
            const text = ko.unwrap(options.text);
            if (!text) {
                $element.tooltip('dispose');
                return;
            }

            const forceOpen = ko.unwrap(options.forceOpen);
            const trigger = forceOpen ? 'manual' : 'hover focus';

            $element.tooltip({
                title: text,
                trigger: trigger
            });

            if (forceOpen) {
                $element.tooltip('show');
            }
        }).extend({
            disposeWhenNodeIsRemoved: element
        });
    }
};