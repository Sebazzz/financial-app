import * as ko from 'knockout';
import * as $ from 'jquery';

const template = `
<div class="modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header" data-bind="if: $component.controller.title">
        <h5 class="modal-title" data-bind="text: $component.controller.title"></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" data-bind="template: { nodes: $component.contentNodes, data: $component.controller.modalViewModel, if: $component.controller.modalViewModel }"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-bind="text: $component.controller.primaryButtonText, visible: $component.controller.primaryButtonText"></button>
        <button type="button" class="btn btn-secondary" data-bind="text: $component.controller.dismissButtonText, visible: $component.controller.dismissButtonText" data-dismiss="modal"></button>
      </div>
    </div>
  </div>
</div>`;

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
    public template = template;

    public viewModel: KnockoutComponentTypes.ViewModelFactoryFunction = {
        createViewModel: (params: IModalParams, componentInfo: KnockoutComponentTypes.ComponentInfo) => {
            return new ModalComponentComponentModel(params, componentInfo.templateNodes, componentInfo.element as Element);
        }
    };

    public synchronous = true;
}

export default function register() {
    ko.components.register('modal', new ModalComponent());
}