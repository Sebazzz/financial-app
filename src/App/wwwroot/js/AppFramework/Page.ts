import AppContext from './AppContext';
import { State } from 'router5'
import {Panel,ActivationPromise} from './Panel';
import HttpClient from './ServerApi/HttpClient';
import * as router from './Router';
import * as ko from 'knockout';

export abstract class Page extends Panel {
    public title = ko.observable<string>();
    public templateName : string|null = null;

    protected constructor(appContext: AppContext) {
        super(appContext);
    }

    public routes: router.RoutingTable = [];

    public async activate(args?: any): Promise<void> {
        // TODO: change return type to ActivationPromise if bug is fixed:
        // https://github.com/Microsoft/TypeScript/issues/14169

        {
            const initialLoad = this.loadActivationDependencies(args);

            await initialLoad;
        }

        {
            const promise = this.onActivate(args) || Promise.resolve();
            this.registerForLoadStatus(promise);

            await promise;
        }
    }

    public deactivate(): void { }

    protected abstract onActivate(args?: any): ActivationPromise | null;

    /**
        * Returns loads the dependencies for this page and returns an appropiate promise
        */
    protected loadActivationDependencies(args?: any): ActivationPromise {
        return Promise.resolve();
    }
}

class PageTemplateManager {
    private loadedTemplates: { [template: string]: boolean | null | undefined } = {};
    private httpClient = HttpClient.create();

    constructor(private appContext: AppContext) {
    }

    public async loadTemplate(page : Page): Promise<string> {
        const templateName = page.templateName;

        if (!templateName) {
            throw new Error(`Unable to load empty template for ${page.constructor}`);
        }

        const templateId = PageTemplateManager.templateId(templateName),
              templateUrl = `/ko-templates/${templateName}.html`;

        if (this.loadedTemplates[templateName] === true) {
            return templateId;
        }

        console.log('TemplateManager: Loading template from %s', templateUrl);

        const content = await this.httpClient.getText(templateUrl, {v: this.appContext.versionStamp}),
              domElement = document.createElement('script') as HTMLScriptElement;

        console.log('TemplateManager: Loaded template from %s', templateUrl);

        domElement.type = 'text/html';
        domElement.id = templateId;
        domElement.innerHTML = content;

        document.body.appendChild(domElement);
        this.loadedTemplates[templateName] = true;

        return templateId;
    }


    private static templateId(templateName: string) {
        return `template-page-${templateName}`;
    }
}

const defaultTemplateName = 'pageLoader';
class PageComponentModel {
    private templateManager : PageTemplateManager;

    public templateName = ko.observable<string>(defaultTemplateName);
    public page = ko.observable<Page | null>(null);

    public title = ko.computed(() => {
        const page = this.page(),
              pageTitle = page && page.title();

        return pageTitle;
    });

    constructor(private appContext: AppContext) {
        this.templateManager = new PageTemplateManager(appContext);
        appContext.router.useMiddleware(() => this.handleRouteChange.bind(this));

        ko.computed(() => {
            const title = this.title();

            document.title = title ? `${title} - ${this.appContext.title}` : this.appContext.title;
        });
    }

    public async handleRouteChange(toState: State, fromState?: State, done?: Function): Promise<boolean> {
        try {
            console.info('Route changes %s to %s: Deactivating page', fromState && fromState.name || '(null)', toState.name);

            const currentPage = this.page();
            if (currentPage) {
                currentPage.deactivate();
            }

            this.templateName(defaultTemplateName);
            this.page(null);

            const page = this.findPage(toState.name),
                  templateId = await this.templateManager.loadTemplate(page);

            console.info('Route changes %s to %s: Activating page', fromState && fromState.name || '(null)', toState.name);

            await page.activate(toState.params);

            this.page(page);
            this.templateName(templateId);
        } catch (e) {
            console.error(e);

            return false;
        }

        return true;
    }

    private findPage(routeName: string) : Page {
        const page = this.appContext.app.findPage(routeName);

        if (page === null) {
            throw new Error('Unable to find page matching route: ' + routeName);
        }

        return page;
    }
}

class PageComponent implements KnockoutComponentTypes.ComponentConfig {
    private appContext : AppContext;
    public viewModel: KnockoutComponentTypes.ViewModelFactoryFunction = {
        createViewModel: () => {
            return new PageComponentModel(this.appContext);
        }
    };

    public template : string;
    public synchronous = true;

    constructor(appContext: AppContext) {
        this.appContext = appContext;

        this.template = `<div data-bind="template: { name: $component.templateName, data: $component.page }"></div>`;
    }
}

export function registerPageLoader(appContext : AppContext) {
    ko.components.register('page-container', new PageComponent(appContext));
}