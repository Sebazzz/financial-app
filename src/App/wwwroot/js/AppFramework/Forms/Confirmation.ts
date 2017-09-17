import * as $ from 'jquery';
import * as ko from 'knockout';

/**
 * Shows a bootstrap confirmation dialog
 * 
 * @param text Text to show
 * @param title Title, optional
 * @param isDanger Whether to show a "dangerous" button
 * @param confirmButtonText 
 * @param rejectButtonText 
 * @returns {} 
 */
export default function confirmAsync(text: string, title?: string, isDanger = false, confirmButtonText = 'Ja', rejectButtonText = 'Nee'): Promise<boolean> {
    const template = `
<div class="modal">
  <div class="modal-dialog modal-sm" role="document">
    <div class="modal-content">
      <div class="modal-header" data-bind="visible: title">
        <h5 class="modal-title" data-bind="text: title"></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p data-bind="text: text"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-bind="text: confirmButtonText, css: primaryCssClass"></button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal" data-bind="text: rejectButtonText"></button>
      </div>
    </div>
  </div>
</div>`;

    const viewModel = {
        text: text,
        title: title,
        confirmButtonText: confirmButtonText,
        rejectButtonText: rejectButtonText,
        primaryCssClass: isDanger ? 'btn-outline-danger' : 'btn-primary'
    };

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = template;

    document.body.appendChild(modalContainer);
    ko.applyBindings(viewModel, modalContainer);

    const $modalContainer = $(modalContainer),
          $modal = $modalContainer.children('.modal');

    return new Promise<boolean>((resolve) => {
        let result = false;

        $modal.on('click', '.btn-primary, .btn-outline-danger', (ev) => {
            ev.preventDefault();

            result = true;
            $modal.modal('hide');
        });

        $modal.on('hidden.bs.modal', () => {
            resolve(result);
            $modalContainer.remove();
        });

        $modal.modal();
    });
}