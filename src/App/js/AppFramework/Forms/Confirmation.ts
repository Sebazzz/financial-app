﻿import * as $ from 'jquery';
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
    const template = require('./templates/confirmation.html');

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

if (module.hot) {
    module.hot.accept('./templates/confirmation.html');
}