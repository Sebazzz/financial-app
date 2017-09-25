import * as ko from 'knockout';
import * as $ from 'jquery';

export class ModalController<T=any> {
    private $component: ModalComponentComponentModel;

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
    public dismissButtonText = ko.observable<string|null>('Annuleren');

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

    public async showDialog(model : T): Promise<DialogResult> {
        this.modalViewModel(model);

        try {
            return await this.$component.showDialog();
        } finally {
            this.modalViewModel(null);
        }
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

    constructor(parameters: IModalParams, public contentNodes: Node[], public renderElement: Element) {
        if (!parameters || !parameters.controller || !(parameters.controller instanceof ModalController)) {
            throw new Error('Modal: Please set an instance of ModalParameters as the argument');
        }

        this.controller = parameters.controller;
        this.controller.setComponent(this);
    }

    public showDialog(): Promise<DialogResult> {
        return new Promise<DialogResult>((resolve) => {
            const $modal = this.$modal();

            let dialogResult = DialogResult.Other;

            $modal.on('click.modal-component', '.modal-footer .btn, .modal-header [data-dismiss]', (ev) => {
                ev.preventDefault();

                if (((ev.target as any) as Element).classList.contains('btn-primary')) {
                    dialogResult = DialogResult.PrimaryButton;
                    $modal.modal('hide');
                }
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

    public dispose() {
        this.$modal().modal('hide');
    }

    private $modal() {
        return $(this.renderElement).children('.modal');
    }
}

class ModalComponent implements KnockoutComponentTypes.ComponentConfig {
    public template = null;

    public viewModel: KnockoutComponentTypes.ViewModelFactoryFunction = {
        createViewModel: (params: IModalParams, componentInfo: KnockoutComponentTypes.ComponentInfo) => {
            return new ModalComponentComponentModel(params, componentInfo.templateNodes, componentInfo.element as Element);
        }
    };

    public synchronous = true;

    constructor() {
        this.loadTemplate();

        if (module.hot) {
            module.hot.accept('./templates/modal.html', () => {
                this.loadTemplate();

                console.warn('Modal: New template has been loaded, but re-rendering of component is required to apply changes');
            });
        }
    }

    private loadTemplate() {
        this.template = require('./templates/modal.html');
    }
}

export default function register() {
    ko.components.register('modal', new ModalComponent());
}