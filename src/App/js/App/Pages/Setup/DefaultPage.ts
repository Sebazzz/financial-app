import { PageModule } from 'AppFramework/Navigation/Page';
import FormPage from 'AppFramework/Forms/FormPage';
import * as api from '../../ServerApi/Setup';
import AppContext from 'AppFramework/AppContext';
import * as ko from 'knockout';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';

class DefaultPage extends FormPage {
    private api = new api.Api();

    private setupStepHandlerFactory: SetupStepHandlerFactory[] = [
        () => new DefaultSetupStepHandler(),
        () => new DatabaseConnectionSetupStepHandler(),
        () => new DatabaseMigrationStepHandler(),
        () => new DefaultSetupStepHandler(),
        () => new DatabaseInitialUserStepHandler(),
        () => new DefaultSetupStepHandler()
    ];

    public steps = ko.observableArray<api.ISetupStepDescriptor>();
    public currentStep = ko.observable<api.ISetupStepDescriptor>();
    public currentStepIndex = ko.pureComputed(() => this.currentStep()!.order);
    public currentStepHandler = ko.pureComputed(() => {
        const currentStep = this.currentStep()!,
            handlerFactory = this.setupStepHandlerFactory[currentStep.order],
            handler = handlerFactory();

        handler.name(currentStep.name);

        return handler;
    });

    public isBusy = ko.observable<boolean>(false);

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Setup wizard');

        this.currentStep.subscribe(step => {
            this.title(`${step!.name} - Setup wizard`);
        });

        this.nextStep = this.nextStep.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        const state = await this.api.getCurrentState();

        this.steps(state.steps);
        this.currentStep(state.steps[state.currentStep.order]);
    }

    public stepCssClass(displayStep: api.ISetupStepDescriptor) {
        return ko.computed(() => {
            const activeStepIndex = this.currentStep()!.order,
                displayStepIndex = displayStep.order;

            if (activeStepIndex === displayStepIndex) {
                return 'active';
            }

            return activeStepIndex > displayStepIndex ? '' : 'disabled';
        });
    }

    public step(index: number) {
        return ko.pureComputed(() => {
            const currentStep = this.currentStep();

            return currentStep!.order === index ? this.currentStepHandler() : null;
        });
    }

    public async nextStep() {
        const stepHandler = this.currentStepHandler(),
            currentStep = this.currentStep();

        try {
            this.isBusy(true);

            if (currentStep!.isDone) {
                document.location!.pathname = '/';
                return;
            }

            const result = await this.api.execute({
                setupStepNumber: this.currentStepIndex(),
                data: stepHandler.getData()
            });
            this.currentStep(this.steps().filter(x => x.order === result.order)[0]);
        } catch (e) {
            const xhr = e as JQueryXHR;

            switch (xhr.status) {
                case 400:
                    if (xhr.responseText && validate.tryExtractValidationError(xhr, stepHandler)) {
                        return;
                    }

                    alert('Ongeldige wizard staat. Applicatie wordt herladen.');
                    document.location!.reload(true);
                    return;
            }

            if (stepHandler.handleError(xhr, this)) {
                return;
            }

            throw e;
        } finally {
            this.isBusy(currentStep!.isDone);
        }
    }

    public save(): Promise<void> {
        return this.nextStep();
    }
}

type SetupStepHandlerFactory = () => SetupStepHandler;

abstract class SetupStepHandler extends validate.ValidateableViewModel {
    public name = ko.observable<string>();
    public errorDetails = ko.observable<string>();

    public handleError(xhr: JQueryXHR, setupWizard: FormPage): boolean {
        this.errorDetails(xhr.responseText);

        return false;
    }

    public getData(): any {
        return undefined;
    }
}

class DefaultSetupStepHandler extends SetupStepHandler {}

class DatabaseConnectionSetupStepHandler extends SetupStepHandler {
    public handleError(xhr: JQueryXHR, setupWizard: FormPage): boolean {
        super.handleError(xhr, setupWizard);

        setupWizard.errorMessage(
            'We kunnen geen verbinding maken met de database. Controleer de connection string en probeer het opnieuw.'
        );
        return true;
    }
}

class DatabaseMigrationStepHandler extends SetupStepHandler {
    public handleError(xhr: JQueryXHR, setupWizard: FormPage): boolean {
        super.handleError(xhr, setupWizard);

        setupWizard.errorMessage(
            'De database kan niet geïnitialiseerd worden. Controleer de rechten en probeer het opnieuw.'
        );
        return true;
    }
}

class DatabaseInitialUserStepHandler extends SetupStepHandler {
    public userName = ko.observable<string>();
    public email = ko.observable<string>();
    public password = ko.observable<string>('FA-app-' + Math.round(Math.random() * 100000));

    public getData(): any {
        return ko.toJS(this);
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/setup/default.html'),
    createPage: appContext => new DefaultPage(appContext)
} as PageModule;
