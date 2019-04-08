import { AsyncDataSource } from 'AppFramework/Utils/AsyncDataSource';
import * as ko from 'knockout';

function makeArray<T>(arrayLikeObject: { [index: number]: T; length: number }) {
    const result = [];
    for (let i = 0, j = arrayLikeObject.length; i < j; i++) {
        result.push(arrayLikeObject[i]);
    }
    return result;
}

function moveCleanedNodesToContainerElement(nodes: Node[] | NodeList) {
    // Ensure it's a real array, as we're about to reparent the nodes and
    // we don't want the underlying collection to change while we're doing that.
    const nodesArray = makeArray(nodes);
    const templateDocument = (nodesArray[0] && nodesArray[0].ownerDocument) || document;

    const container = templateDocument.createElement('div');
    for (let i = 0, j = nodesArray.length; i < j; i++) {
        container.appendChild(ko.cleanNode(nodesArray[i]));
    }
    return container;
}

let counter = 1;

ko.bindingHandlers.asyncLoadingPanel = {
    init<T>(
        element: Element,
        valueAccessor: () => AsyncDataSource<T>,
        allBindingsAccessor: ko.AllBindings,
        viewModel: any,
        bindingContext: ko.BindingContext
    ) {
        // Mark panel
        element.classList.add('async-loading-panel');

        // Retrieve binding context
        const dataSource = valueAccessor();
        if (!(dataSource instanceof AsyncDataSource)) {
            console.warn(`asyncLoadingPanel: Functor ${valueAccessor} did not return 'AsyncLoadingPanel<T>'`);

            return { controlsDescendantBindings: true };
        }

        ko.tasks.schedule(() => dataSource.invokeLoad());

        // Prepare template
        const templateNodes = ko.virtualElements.childNodes(element);
        if (templateNodes.length === 0) {
            throw new Error(
                `asyncLoadingPanel: no child nodes when binding at ${(element as HTMLElement).outerHTML || element}'`
            );
        }

        const container = moveCleanedNodesToContainerElement(templateNodes);

        container.id = 'async-loading-panel-contents-' + new Date().toISOString() + '-inst-' + ++counter;
        container.style.display = 'none';
        document.body.appendChild(container);

        // Set-up rendering
        const template = ko.computed(
            () => {
                const templateName = dataSource.template() || container.id;
                console.warn('template: %s', templateName);
                return templateName;
            },
            null,
            { disposeWhenNodeIsRemoved: element as any /* knockout/issues/2471 */ }
        );

        // Set-up binding context
        const childBindingContext = bindingContext.createChildContext(
            () => ko.computed(() => dataSource.data),
            undefined,
            (ctx: any) => {
                ctx.$dataSource = dataSource;
                ctx.$model = viewModel;
            }
        );

        const observable = ko.renderTemplate(template, childBindingContext, {}, element);
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => observable.dispose());
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => container.remove());

        return { controlsDescendantBindings: true };
    }
};
