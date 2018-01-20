import * as ko from 'knockout';

/**
 * Hidden binding handler: Easy to use instead of visible: !condition
 */
ko.bindingHandlers.hidden = {
    preprocess: (value: string, name: string, addBindingCallback: (name: string, value: string) => void) => {
        addBindingCallback('visible', `!(ko.unwrap(${value}))`);
        return '';
    }
};
