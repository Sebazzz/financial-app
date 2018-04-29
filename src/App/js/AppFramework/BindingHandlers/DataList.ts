import * as ko from 'knockout';

ko.bindingHandlers.dataList = {
    init(element: HTMLDataListElement, valueAccessor: () => KnockoutObservableArray<string> | string[]) {
        if (element.tagName !== 'DATALIST') {
            throw new Error(
                `The dataList binding handler can only be applied to the datalist element but is currently bound to ${
                    element.tagName
                }`
            );
        }

        ko
            .computed(() => {
                const values = ko.unwrap(valueAccessor());

                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }

                for (const value of values) {
                    const option = document.createElement('option');
                    option.value = value;
                    element.appendChild(option);
                }
            })
            .extend({ disposeWhenNodeIsRemoved: element });
    }
};
