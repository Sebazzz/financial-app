import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import ServiceWorkerMethods from 'App/Services/ServiceWorkerMessaging';
import { initialize as initializeServiceWorker } from 'App/Services/ServiceWorkerManager';
import * as ko from 'knockout';
import * as version from 'App/ServerApi/Version';
import mobileDetection from 'AppFramework/Client/BrowserDetector';

class AboutPage extends Page {
    private api = new version.Api();

    public appVersionId: string = '?';
    public appVersion: string = '?';
    public clientVersionId: string = '?';
    public isMobileMode: boolean = false;

    public serviceWorker = new ServiceWorkerController();

    public clientVersionMatches = ko.pureComputed(() => this.appVersionId !== this.clientVersionId);

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Over Financial App');
    }

    protected async onActivate(): Promise<void> {
        const version = await this.api.get();

        this.appVersion = version.appVersion;
        this.appVersionId = version.appVersionId;
        this.isMobileMode = mobileDetection();

        this.clientVersionId = this.appContext.versionStamp;
    }
}

class ServiceWorkerController {
    private serviceWorkerContainer!: ServiceWorkerContainer;
    private serviceWorker: ServiceWorker | null = null;

    private currentRegistration: ServiceWorkerRegistration | null = null;

    public isInstalled = ko.observable(false);
    public isSupported = 'serviceWorker' in navigator;

    public state = ko.observable<ServiceWorkerState>();
    public scriptUrl = ko.observable<string>();
    public serviceWorkerVersion = ko.observable<string | null>();
    public serviceWorkerBuildType = ko.observable<string | null>();

    public serviceWorkerConsole = ko.observableArray<string>();
    public isServiceWorkerConsoleVisible = ko.pureComputed(() => this.serviceWorkerConsole().length > 0);

    constructor() {
        if (!this.isSupported) {
            return;
        }

        const sw = (this.serviceWorkerContainer = navigator.serviceWorker);
        this.serviceWorker = sw.controller;

        this.isInstalled(this.serviceWorker !== null);

        // bind "this"
        this.onServiceWorkerStateChange = this.onServiceWorkerStateChange.bind(this);
        this.onServiceWorkerControllerChange = this.onServiceWorkerControllerChange.bind(this);

        this.forceReload = this.forceReload.bind(this);
        this.update = this.update.bind(this);
        this.unregister = this.unregister.bind(this);
        this.register = this.register.bind(this);

        this.requestServiceWorkerVersion = this.requestServiceWorkerVersion.bind(this);
        this.requestServiceWorkerBuildType = this.requestServiceWorkerBuildType.bind(this);

        this.onServiceWorkerControllerChange();
        this.checkServiceWorkerRegistrationAsync();

        sw.addEventListener('controllerchange', this.onServiceWorkerControllerChange);
    }

    private updateServiceWorkerInformation() {
        this.requestServiceWorkerVersion();
        this.requestServiceWorkerBuildType();
    }

    public async requestServiceWorkerVersion() {
        try {
            this.serviceWorkerVersion(null);
            this.serviceWorkerVersion(await ServiceWorkerMethods.versionQuery());
        } catch (e) {
            this.appendConsole('Error retrieving version: ' + (e.message || e.toString()));
            this.serviceWorkerVersion('Error: ' + e);
        }
    }

    public async requestServiceWorkerBuildType() {
        try {
            this.serviceWorkerBuildType(null);
            this.serviceWorkerBuildType(await ServiceWorkerMethods.buildTypeQuery());
        } catch (e) {
            this.appendConsole('Error retrieving version: ' + (e.message || e.toString()));
            this.serviceWorkerBuildType('Error: ' + e);
        }
    }

    private async checkServiceWorkerRegistrationAsync() {
        const registration = await this.serviceWorkerContainer.getRegistration();

        if (!registration) {
            this.appendConsole('Service worker not registered');
            this.isInstalled(false);

            return;
        }

        this.isInstalled(true);
        this.currentRegistration = registration;

        this.updateServiceWorkerInformation();
    }

    private onServiceWorkerStateChange() {
        if (!this.serviceWorker) {
            return; // This will not happen, but is to satisfy the type checker
        }

        this.appendConsole(`statechange: ${this.serviceWorker.state}`);
        this.state(this.serviceWorker.state);
    }

    public register(ignored: never, event: MouseEvent) {
        const element = event.target as HTMLInputElement;

        this.appendConsole('invoked: register');

        (async () => {
            if (element) {
                element.disabled = true;
            }

            try {
                await initializeServiceWorker();
                this.appendConsole('register() success');

                await this.checkServiceWorkerRegistrationAsync();
                this.appendConsole('check() success');
            } catch (e) {
                this.appendConsole('Niet gelukt: ' + e.toString());
            } finally {
                if (element) {
                    element.disabled = false;
                }
            }
        })();
    }

    public unregister(ignored: never, event: MouseEvent) {
        this.executeAction(async reg => {
            this.appendConsole('invoked: unregister()');

            const result = await reg.unregister();
            if (result) {
                this.appendConsole('unregister() success');
            } else {
                this.appendConsole('unregister() failure');
            }

            await this.checkServiceWorkerRegistrationAsync();
        }, event);
    }

    public forceReload(ignored: never, event: MouseEvent) {
        const success = this.executeAction(async reg => {
            await reg.update();
            document.location!.reload(true);
        }, event);

        if (!success) {
            document.location!.reload(true);
        }
    }

    public update(ignored: never, event: MouseEvent) {
        this.executeAction(async reg => {
            this.appendConsole('invoked: update()');
            await reg.update();
            this.appendConsole('update() success');
        }, event);
    }

    private executeAction(action: (reg: ServiceWorkerRegistration) => Promise<void>, event: Event) {
        const reg = this.currentRegistration,
            element = event.target as HTMLInputElement;

        if (!reg) {
            this.appendConsole('Niet mogelijk');

            this.checkServiceWorkerRegistrationAsync();
            return false;
        }

        (async () => {
            if (element) {
                element.disabled = true;
            }

            try {
                await action(reg);
            } catch (e) {
                this.appendConsole('Niet gelukt: ' + e.message + ' ' + e.toString());
            } finally {
                if (element) {
                    element.disabled = false;
                }
            }
        })();

        return true;
    }

    private onServiceWorkerControllerChange() {
        this.appendConsole('Service controller: changed');

        this.serviceWorker = this.serviceWorkerContainer.controller;

        this.checkServiceWorkerRegistrationAsync();
        this.updateServiceWorkerInformation();

        if (this.serviceWorker !== null) {
            this.serviceWorker.addEventListener('statechange', this.onServiceWorkerStateChange);

            this.state(this.serviceWorker.state);
            this.scriptUrl(this.serviceWorker.scriptURL);
        }
    }

    public dispose() {
        if (this.serviceWorker) {
            this.serviceWorker.removeEventListener('statechange', this.onServiceWorkerStateChange);
        }

        this.serviceWorkerContainer.removeEventListener('controllerchange', this.onServiceWorkerControllerChange);
    }

    private appendConsole(input: string) {
        this.serviceWorkerConsole.push(input);
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/about.html'),
    createPage: appContext => new AboutPage(appContext)
} as PageModule;
