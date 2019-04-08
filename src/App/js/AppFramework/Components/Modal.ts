import * as ko from 'knockout';
import * as $ from 'jquery';

export class ModalController<T = any> {
    private $component: ModalComponentComponentModel | null = null;

    /**
     * Sets the title. If not set, the title is hidden.
     */
    public title = ko.observable<string | null>(null);

    /**
     * Text of the primary button. If not set, the primary button is hidden.
     */
    public primaryButtonText = ko.observable<string | null>('Opslaan');

    /**
     * Text of close button. If not set, the close button is hidden.
     */
    public dismissButtonText = ko.observable<string | null>('Annuleren');

    public modalViewModel = ko.observable<T | null>();

    constructor(title?: string | null, primaryButtonText?: string | null, dismissButtonText?: string | null) {
        if (typeof title !== 'undefined') {
            this.title(title);
        }

        if (typeof primaryButtonText !== 'undefined') {
            this.primaryButtonText(primaryButtonText);
        }

        if (typeof dismissButtonText !== 'undefined') {
            this.dismissButtonText(dismissButtonText);
        }
    }

    public setComponent($component: ModalComponentComponentModel) {
        this.$component = $component;
    }

    public async showDialog(model: T): Promise<DialogResult> {
        this.modalViewModel(model);

        if (this.$component === null) {
            throw new Error('Component model not set. It is supposed to be set by the component binding.');
        }

        try {
            return await this.$component.showDialog();
        } finally {
            this.modalViewModel(null);
        }
    }

    public closeDialog() {
        if (this.$component === null) {
            throw new Error('Component model not set. It is supposed to be set by the component binding.');
        }

        this.$component.closeDialog();
    }
}

export enum DialogResult {
    PrimaryButton,
    Other
}

export interface IModalParams {
    controller: ModalController;
}

class ModalComponentComponentModel {
    private isInitialized = false;

    public controller: ModalController;

    public bodyNodes: Node[] = [];
    public footerNodes: Node[] = [];

    constructor(parameters: IModalParams, public contentNodes: Node[], public renderElement: Element) {
        if (!parameters || !parameters.controller || !(parameters.controller instanceof ModalController)) {
            throw new Error('Modal: Please set an instance of ModalParameters as the argument');
        }

        this.controller = parameters.controller;
        this.controller.setComponent(this);

        for (const contentNode of contentNodes) {
            if (!(contentNode instanceof HTMLElement)) {
                // Unknown nodes always considered body nodes. This works for the scenario where modal body
                // and modal footer are not explicitly defined
                this.bodyNodes.push(contentNode);
                continue;
            }

            if (contentNode.tagName === 'MODAL-BODY') {
                // Clear body & attrs
                const myBody = renderElement.querySelector('.modal-body'),
                    myBodyAttributes = myBody && myBody.attributes;
                if (!(myBody && myBodyAttributes)) {
                    throw new Error('Unable to find modal body');
                }

                while (myBodyAttributes.length > 0) {
                    const attr = myBodyAttributes.item(0);
                    if (attr) {
                        myBody.removeAttribute(attr.name);
                    }
                }

                // Write new bindings (we have just deleted the original data-bind)
                myBody.setAttribute('ko-template:data', '$component.controller.modalViewModel');
                myBody.setAttribute('ko-template:if', '$component.controller.modalViewModel');
                myBody.setAttribute('ko-template:nodes', '$component.bodyNodes');

                myBody.classList.add('modal-body');

                // Copy any attributes
                let attrIndex = 0;
                while (attrIndex < contentNode.attributes.length) {
                    const attr = contentNode.attributes.item(attrIndex);
                    if (attr) {
                        myBody.setAttribute(attr.name, attr.value);
                    }

                    attrIndex++;
                }

                // Register all child nodes as a body node
                this.bodyNodes.length = 0;
                while (contentNode.childNodes.length > 0) {
                    const childNode = contentNode.childNodes.item(0);
                    contentNode.removeChild(childNode);
                    this.bodyNodes.push(childNode);
                }

                continue;
            }

            if (contentNode.tagName === 'MODAL-FOOTER') {
                // Clear body & attrs
                const myFooter = renderElement.querySelector('.modal-footer'),
                    myFooterAttributes = myFooter && myFooter.attributes;
                if (!(myFooter && myFooterAttributes)) {
                    throw new Error('Unable to find modal body');
                }

                while (myFooterAttributes.length > 0) {
                    const attr = myFooterAttributes.item(0);
                    if (attr) {
                        myFooter.removeAttribute(attr.name);
                    }
                }

                // Write new bindings (we have just deleted the original data-bind)
                myFooter.setAttribute('ko-template:data', '$component.controller.modalViewModel');
                myFooter.setAttribute('ko-template:if', '$component.controller.modalViewModel');
                myFooter.setAttribute('ko-template:nodes', '$component.footerNodes');

                myFooter.classList.add('modal-footer');

                // Copy any attributes
                let attrIndex = 0;
                while (attrIndex < contentNode.attributes.length) {
                    const attr = contentNode.attributes.item(attrIndex);
                    if (attr) {
                        myFooter.setAttribute(attr.name, attr.value);
                    }

                    attrIndex++;
                }

                // Register all child nodes as a footer node
                this.footerNodes.length = 0;
                while (contentNode.childNodes.length > 0) {
                    const childNode = contentNode.childNodes.item(0);
                    contentNode.removeChild(childNode);
                    this.footerNodes.push(childNode);
                }

                continue;
            }

            // Push any unknown node to the body
            this.bodyNodes.push(contentNode);
        }
    }

    public showDialog(): Promise<DialogResult> {
        return new Promise<DialogResult>(resolve => {
            const $modal = this.$modal();

            let dialogResult = DialogResult.Other;

            $modal.on('click.modal-component', '.modal-footer .btn, .modal-header [data-dismiss]', ev => {
                if (((ev.target as any) as Element).classList.contains('btn-primary')) {
                    if (ev.target.classList.contains('btn-modal-ignore')) {
                        return;
                    }

                    dialogResult = DialogResult.PrimaryButton;
                    $modal.modal('hide');
                }

                ev.preventDefault();
            });

            $modal.one('hidden.bs.modal', () => {
                $modal.unbind('click.modal-component');

                resolve(dialogResult);
            });

            if (this.isInitialized) {
                $modal.modal();
            } else {
                $modal.modal('show');
            }
        });
    }

    public closeDialog() {
        const $modal = this.$modal();
        $modal.modal('hide');
    }

    public dispose() {
        this.$modal().modal('hide');
    }

    private $modal() {
        return $(this.renderElement).children('.modal');
    }
}

class ModalComponent implements ko.components.Config {
    public template = null;

    public viewModel: ko.components.ViewModelFactory = {
        createViewModel: (params: IModalParams, componentInfo: ko.components.ComponentInfo) => {
            return new ModalComponentComponentModel(
                params,
                componentInfo.templateNodes,
                componentInfo.element as Element
            );
        }
    };

    public synchronous = true;

    constructor() {
        this.loadTemplate();

        if (module.hot) {
            module.hot.accept('./templates/modal.html', () => {
                this.loadTemplate();

                console.warn(
                    'Modal: New template has been loaded, but re-rendering of component is required to apply changes'
                );
            });
        }
    }

    private loadTemplate() {
        this.template = require('./templates/modal.html');
    }
}

export default function register() {
    ko.components.register('modal', new ModalComponent());

    // Register for older browsers (IE11)
    document.createElement('modal-body');
    document.createElement('modal-footer');
}
