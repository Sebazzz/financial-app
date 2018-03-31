import {Page, IPageRegistration} from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';
import ServiceWorkerMethods from 'App/Services/ServiceWorkerMessaging';
import * as ko from 'knockout';
import * as version from 'App/ServerApi/Version';

class AboutPage extends Page {
    private api = new version.Api();

    public appVersionId: string = '?';
    public appVersion: string = '?';
    public clientVersionId: string = '?';

    public serviceWorker = new ServiceWorkerController();

    public clientVersionMatches = ko.pureComputed(() => this.appVersionId !== this.clientVersionId);

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Over Financial App');
    }

    protected async onActivate(args?: any): Promise<void> {
        const version = await this.api.get();

        this.appVersion = version.appVersion;
        this.appVersionId = version.appVersionId;

        this.clientVersionId = document.documentElement.getAttribute('data-app-version') || '???';
    }
}

class ServiceWorkerController {
    private serviceWorkerContainer!: ServiceWorkerContainer;
    private serviceWorker: ServiceWorker | null = null;

    private currentRegistration: ServiceWorkerRegistration | null = null;

    public isInstalled = ko.observable(false);
    public isSupported = ('serviceWorker' in navigator);

    public state = ko.observable<ServiceWorkerState>();
    public scriptUrl = ko.observable<string>();
    public serviceWorkerVersion = ko.observable<string>();

    constructor() {
        if (!this.isSupported) {
            return;
        }

        const sw = this.serviceWorkerContainer = navigator.serviceWorker;
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

        this.onServiceWorkerControllerChange();
        this.checkServiceWorkerRegistrationAsync();

        sw.addEventListener('controllerchange', this.onServiceWorkerControllerChange);

        this.requestServiceWorkerVersion();
    }

    public async requestServiceWorkerVersion() {
        try {
            this.serviceWorkerVersion(null);
            this.serviceWorkerVersion(await ServiceWorkerMethods.versionQuery());
        } catch (e) {
            this.serviceWorkerVersion('Error: ' + e);
        }
    }

    private async checkServiceWorkerRegistrationAsync() {
        const registration = await this.serviceWorkerContainer.getRegistration();

        if (!registration) {
            return;
        }

        this.isInstalled(true);
        this.currentRegistration = registration;
    }

    private onServiceWorkerStateChange() {
        if (!this.serviceWorker) {
            return; // This will not happen, but is to satisfy the type checker
        }

        this.state(this.serviceWorker.state);
    }

    public register(ignored: never, event: MouseEvent) {
        const element = event.target as HTMLInputElement;

        (async () => {
            if (element) {
                element.disabled = true;
            }

            try {
                await this.serviceWorkerContainer.register('/sw.js');
                alert('register() success');

                await this.checkServiceWorkerRegistrationAsync();
                alert('check() success');
            } catch (e) {
                alert('Niet gelukt: ' + e.toString());
            } finally {
                if (element) {
                    element.disabled = false;
                }
            }
        })();
    }

    public unregister(ignored: never, event: MouseEvent) {
        this.executeAction(async reg => {
            const result = await reg.unregister();
            if (result) {
                alert('unregister() success');
            } else {
                alert('unregister() failure');
            }

            await this.checkServiceWorkerRegistrationAsync();
        }, event);
    }

    public forceReload(ignored: never, event: MouseEvent) {
        const success = this.executeAction(async reg => {
            await reg.update();
            document.location.reload(true);
        }, event);

        if (!success) {
            document.location.reload(true);
        }
    }

    public update(ignored: never, event: MouseEvent) {
        this.executeAction(async reg => {
            await reg.update();
            alert('update() success');
        }, event);
    }

    private executeAction(action: (reg: ServiceWorkerRegistration) => Promise<void>, event: Event) {
        const reg = this.currentRegistration,
              element = event.target as HTMLInputElement;

        if (!reg) {
            alert('Niet mogelijk');

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
                alert('Niet gelukt: ' + e.toString());
            } finally {
                if (element) {
                    element.disabled = false;
                }
            }
        })();

        return true;
    }

    private onServiceWorkerControllerChange() {
        this.serviceWorker = this.serviceWorkerContainer.controller;

        this.checkServiceWorkerRegistrationAsync();
        this.requestServiceWorkerVersion();

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
}

export default {
    id: module.id,
    templateName: 'about',
    routingTable: { name: 'about', path: '/about' },
    createPage: appContext => new AboutPage(appContext),
    bodyClassName: 'page-about'
} as IPageRegistration;
