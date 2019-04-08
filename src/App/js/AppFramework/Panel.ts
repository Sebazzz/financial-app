import * as ko from 'knockout';
import AppContext from './AppContext';

export enum LoadingStatus {
    Loading = 0,

    Error = 1,

    Done = 2
}

export type ActivationPromise = Promise<void>;

export interface IPanel {
    loadStatus: ko.Observable<LoadingStatus>;

    activate(): Promise<void>;

    deactivate(): void;
}

export abstract class Panel {
    public loadStatus = ko.observable<LoadingStatus>(LoadingStatus.Loading);

    protected constructor(protected appContext: AppContext) {}

    public activate(): ActivationPromise {
        const promise = this.onActivate() || Promise.resolve();
        this.registerForLoadStatus(promise);
        return promise;
    }

    public abstract deactivate(): void;

    public dispose() {
        this.deactivate();
    }

    protected abstract onActivate(): ActivationPromise | null;
    protected registerForLoadStatus(activationPromise: ActivationPromise): void {
        activationPromise.then(() => this.loadStatus(LoadingStatus.Done));
        activationPromise.catch(() => this.loadStatus(LoadingStatus.Error));
    }
}

export type PanelFactory<T> = (params?: any, componentInfo?: ko.components.ComponentInfo) => T;

export class PanelComponent<T extends Panel> implements ko.components.Config {
    protected factory: PanelFactory<T>;

    public viewModel: ko.components.ViewModelFactory = {
        createViewModel: (params?: any, componentInfo?: ko.components.ComponentInfo) => {
            const panel = this.factory(params, componentInfo);

            panel.activate();

            return panel;
        }
    };

    public template: string;
    public synchronous = true;

    constructor(template: string, factory: PanelFactory<T>) {
        this.factory = factory;
        this.template = template;
    }
}

export function createPanelComponent<T extends Panel>(name: string, template: string, factory: PanelFactory<T>) {
    const component = new PanelComponent<T>(template, factory);

    ko.components.register(name, component);
}
