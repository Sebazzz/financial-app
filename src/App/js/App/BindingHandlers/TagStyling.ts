import * as ko from 'knockout';
import * as tag from 'App/ServerApi/Tag';
import { styleHtmlElement } from 'App/Utils/TagColor';

ko.bindingHandlers.tagStyling = {
    update(element: HTMLElement, valueAccessor: () => ko.Observable<tag.ITag> | tag.ITag): void {
        const tag = ko.unwrap(valueAccessor());

        styleHtmlElement(element, tag);
    }
};
