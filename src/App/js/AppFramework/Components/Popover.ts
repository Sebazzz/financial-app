import * as ko from 'knockout';
import * as $ from 'jquery';
import 'bootstrap/js/dist/popover';

export class PopoverController<T = any> {
    private $component: PopoverComponentComponentModel | null = null;

    /**
     * Sets the title. If not set, the title is hidden.
     */
    public title = ko.observable<string | null>(null);

    public popoverViewModel = ko.observable<T | null>();

    constructor(title?: string | null) {
        if (typeof title !== 'undefined') {
            this.title(title);
        }
    }

    public setComponent($component: PopoverComponentComponentModel) {
        this.$component = $component;
    }

    public async show(model: T, element: Element): Promise<void> {
        this.popoverViewModel(model);

        if (this.$component === null) {
            throw new Error('Component model not set. It is supposed to be set by the component binding.');
        }

        try {
            await this.$component.show(element);
        } finally {
            this.popoverViewModel(null);
        }
    }
}

class PopoverComponentComponentModel {
    private template: string = '';
    private instances: JQuery[] = [];

    public controller: PopoverController;

    constructor(parameters: IPopoverParams, public contentNodes: Node[], public renderElement: Element) {
        if (!parameters || !parameters.controller || !(parameters.controller instanceof PopoverController)) {
            throw new Error('Popover: Please set an instance of PopoverParameters as the argument');
        }

        this.controller = parameters.controller;
        this.controller.setComponent(this);

        this.loadTemplate();
    }

    private loadTemplate() {
        if (module.hot && !this.template) {
            module.hot.accept('./templates/popover.html', () => {
                this.loadTemplate();

                console.warn(
                    'Popover: New template has been loaded, but re-rendering of component is required to apply changes'
                );
            });
        }

        this.template = require('./templates/popover.html');
    }

    public show(element: Element): Promise<void> {
        return new Promise<void>(resolve => {
            const $popover = $(element),
                needsInitialization = !$popover.data('bs.popover'),
                eventHandlerName = 'click.bs-popover-auto-hide-' + this.instances.length;

            let isShown = false;

            if (needsInitialization) {
                $popover.on('inserted.bs.popover', () => {
                    try {
                        const template = $popover.data('bs.popover').getTipElement() as Element,
                            root = template.querySelector('.ko-root') as Element,
                            bindingContext = ko.contextFor(element) as ko.BindingContext,
                            childBindingContext = bindingContext.extend({
                                $component: this.controller,
                                $viewModel: ko.utils.peekObservable(this.controller.popoverViewModel),
                                $nodes: this.contentNodes
                            });

                        root.innerHTML = this.template;

                        ko.applyBindingsToDescendants(childBindingContext, root);
                    } catch (e) {
                        console.error(e);

                        throw e;
                    }
                });

                $popover.on('show.bs.popover', () => {
                    isShown = true;
                });

                $popover.popover({
                    html: true,
                    trigger: 'manual',
                    title: this.controller.title() || undefined,
                    content: '<div class="ko-root"></div>'
                });

                $popover.data('bs.popover.controller', this.controller);

                $(document.body).on(eventHandlerName, ev => {
                    if (!isShown) {
                        return;
                    }

                    if ((ev.target as Element) === element || $.contains(element, ev.target as Element)) {
                        ev.preventDefault();
                        return;
                    }

                    if (!$.contains($popover.data('bs.popover').getTipElement(), ev.target as Element)) {
                        console.info('Hiding popover - was clicked outside body');
                        console.log(ev.target);
                        $popover.popover('hide');
                    }
                });

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    $(document.body).off(eventHandlerName);
                    $popover.popover('dispose');
                });
            }

            $popover.one('hidden.bs.popover', () => {
                isShown = false;
                resolve();
            });
            $popover.popover('show');
        });
    }

    public dispose() {
        // Can we dispose the instances?
        this.instances.forEach(x => x.popover('dispose'));
    }
}

export enum DialogResult {
    PrimaryButton,
    Other
}

export interface IPopoverParams {
    controller: PopoverController;
}

class PopoverComponent implements ko.components.Config {
    public template = '<span></span>';

    public viewModel: ko.components.ViewModelFactory = {
        createViewModel: (params: IPopoverParams, componentInfo: ko.components.ComponentInfo) => {
            return new PopoverComponentComponentModel(
                params,
                componentInfo.templateNodes,
                componentInfo.element as Element
            );
        }
    };

    public synchronous = true;
}

export type DataFactory = (viewModel: any) => any;

export default function register() {
    ko.components.register('popover', new PopoverComponent());

    ko.bindingHandlers.popover = {
        init(
            element: Element,
            valueAccessor: () => {
                controller: PopoverController;
                data: any | DataFactory;
            },
            allBindingsAccessor: ko.AllBindings,
            viewModel: any,
            bindingContext: ko.BindingContext
        ): void {
            const options = valueAccessor(),
                controller = options.controller;

            function onHoverIn() {
                let data = typeof options.data === 'function' ? options.data(viewModel) : options.data;
                if (typeof data === 'undefined') {
                    data = bindingContext.$data;
                }

                controller.show(data, element).catch(reason => console.error(reason));
            }

            function onHoverOut() {
                $(element).popover('hide');
            }

            $(element).hover(onHoverIn, onHoverOut);
        }
    };
}
