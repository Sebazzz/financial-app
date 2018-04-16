import * as ko from 'knockout';
import {Page} from '../Page';
import AppContext from '../AppContext';
import {ValidateableViewModel} from 'AppFramework/Forms/ValidateableViewModel';

export interface IFormPage {
    isBusy: KnockoutObservable<boolean>;

    /**
     * Called when the form submits. May throw an exception containing validation errors.
     * @param submissionName Button name that caused submission
     */
    save(viewModel: ValidateableViewModel, submissionName?: string|null): Promise<void>;

    errorMessage: KnockoutObservable<string>;
}

export default abstract class FormPage extends Page implements IFormPage {
    public isBusy = ko.observable<boolean>(false);
    public errorMessage = ko.observable<string>();

    public abstract save(viewModel: ValidateableViewModel, submissionName?: string|null): Promise<void>;

    constructor(appContext: AppContext) {
        super(appContext);

        // bind "this
        this.save = this.save.bind(this);
    }
}
