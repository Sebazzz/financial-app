import * as ko from 'knockout';
import { default as isMobile, addResponsiveListener, removeResponsiveListener } from './BrowserDetector';

const enum ResponsiveRenderMode {
    Desktop = 'desktop',
    Mobile = 'mobile'
}

ko.bindingHandlers.responsiveRender = {
    init(
        element: Node,
        valueAccessor: () => ResponsiveRenderMode,
        allBindingsAccessor: ko.AllBindings,
        viewModel: any,
        bindingContext: ko.BindingContext
    ) {
        const mode = valueAccessor(),
            shouldRender = ko.observable(checkShouldRender(isMobile()));

        function checkShouldRender(isMatch: boolean) {
            return (mode === ResponsiveRenderMode.Mobile) === isMatch;
        }

        function updateShouldRender(mql: MediaQueryListEvent) {
            shouldRender(checkShouldRender(mql.matches));
        }

        // Act on media query change
        addResponsiveListener(updateShouldRender);
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => removeResponsiveListener(updateShouldRender));

        // Let the 'if' binding do the heavy lifting
        return ko.bindingHandlers.if.init!(element, () => shouldRender, allBindingsAccessor, viewModel, bindingContext);
    }
};
ko.virtualElements.allowedBindings.responsiveRender = true;
