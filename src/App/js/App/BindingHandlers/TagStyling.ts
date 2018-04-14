import * as ko from 'knockout';
import * as tag from 'App/ServerApi/Tag';
import {styleHtmlElement} from 'App/Utils/TagColor';

ko.bindingHandlers.tagStyling = {
    update(element: HTMLElement, valueAccessor: () => KnockoutObservable<tag.ITag> | tag.ITag): void {
        const tag = ko.unwrap(valueAccessor());

        styleHtmlElement(element, tag);
    }
};
