import { default as ApiBase } from 'AppFramework/ServerApi/ApiBase';

export interface ISetupStepDescriptor {
    order: number;
    name: string;
    isDone: boolean;
}

export interface ISetupState {
    currentStep: ISetupStepDescriptor;
    steps: ISetupStepDescriptor[];
}

export interface ISetupInvocation<TData = undefined> {
    setupStepNumber: number;

    data: TData;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/setup';
    }

    public async getCurrentState(): Promise<ISetupState> {
        return this.execGet<ISetupState>();
    }

    public async execute<TData>(invocation: ISetupInvocation<TData>): Promise<ISetupStepDescriptor> {
        return this.execPost<ISetupStepDescriptor>(null, invocation);
    }
}
