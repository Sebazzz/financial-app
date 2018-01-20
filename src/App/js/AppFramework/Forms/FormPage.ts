import * as ko from 'knockout';
import {Page} from '../Page';
import AppContext from '../AppContext';

export interface IFormPage {
    isBusy: KnockoutObservable<boolean>;
    save(): Promise<void>;
    errorMessage: KnockoutObservable<string>;
}

export default abstract class FormPage extends Page implements IFormPage {
    public isBusy = ko.observable<boolean>(false);
    public errorMessage = ko.observable<string>();

    public abstract save(): Promise<void>;

    constructor(appContext: AppContext) {
        super(appContext);

        // bind "this
        this.save = this.save.bind(this);
    }
}
