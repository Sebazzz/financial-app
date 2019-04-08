import * as ko from 'knockout';
import { Page } from 'AppFramework/Navigation/Page';
import AppContext from '../AppContext';
import { ValidateableViewModel } from 'AppFramework/Forms/ValidateableViewModel';

export interface IFormPage {
    isBusy: ko.Observable<boolean>;

    /**
     * Called when the form submits. May throw an exception containing validation errors.
     * @param submissionName Button name that caused submission
     */
    save(viewModel: ValidateableViewModel, submissionName?: string | null): Promise<void>;

    errorMessage: ko.Observable<string | null>;
}

export default abstract class FormPage extends Page implements IFormPage {
    public isBusy = ko.observable<boolean>(false);
    public errorMessage = ko.observable<string | null>(null);

    public abstract save(viewModel: ValidateableViewModel, submissionName?: string | null): Promise<void>;

    constructor(appContext: AppContext) {
        super(appContext);

        // bind "this
        this.save = this.save.bind(this);
    }
}
