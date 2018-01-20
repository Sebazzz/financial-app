import * as ko from 'knockout';

export type ModelStateErrors = string[];

export interface IModelState {
    [key: string]: ModelStateErrors;
}

export class ValidateableViewModel {
    public modelState = ko.observable<IModelState>({});
}

const httpBadRequest = 400;

export function tryExtractValidationError(xhr: JQueryXHR, viewModel: ValidateableViewModel): boolean {
    // ReSharper disable once TsResolvedFromInaccessibleModule [R# limitation]
    if (xhr.status !== httpBadRequest) {
        return false;
    }

    const response = xhr.responseJSON as IModelState;
    if (!response) {
        return false;
    }

    viewModel.modelState(response);
    return true;
}
