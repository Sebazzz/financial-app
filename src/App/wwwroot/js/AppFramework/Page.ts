import AppContext from './AppContext';
import { State } from 'router5';
import { RoutingTable } from './Router';

import {Panel,ActivationPromise} from './Panel';
import HttpClient from './ServerApi/HttpClient';
import * as ko from 'knockout';

export interface IPageRegistration {
    name:string;
    templateName: string;
    routingTable: RoutingTable;

    createPage(appContext: AppContext): Page;
}

export type PageRegistration = IPageRegistration;

export abstract class Page extends Panel {
    public title = ko.observable<string>();

    protected constructor(appContext: AppContext) {
        super(appContext);
    }

    public async activate(args?: any): Promise<void> {
        // TODO: change return type to ActivationPromise if bug is fixed:
        // https://github.com/Microsoft/TypeScript/issues/14169

        {
            const promise = this.onActivate(args) || Promise.resolve();
            this.registerForLoadStatus(promise);

            await promise;
        }
    }

    public deactivate(): void {
        this.disposeObservables();
    }

    protected abstract onActivate(args?: any): ActivationPromise | null;

    private disposeObservables() {
        // Proactively dispose any computed properties to prevent memory leaks
        const bag = (this as any);
        for (const property in bag) {
            const item = bag[property];

            if (ko.isComputed(item)) {
                item.dispose();
            }
        }
    }
}

class PageTemplateManager {
    private loadedTemplates: { [template: string]: boolean | null | undefined } = {};
    private httpClient = HttpClient.create();

    constructor(private appContext: AppContext) {
        // Provided by app implementor
        this.loadedTemplates['pageLoader'] = true;
    }

    public async loadTemplate(page : PageRegistration): Promise<string> {
        const templateName = page.templateName;

        if (!templateName) {
            throw new Error(`Unable to load empty template for ${page.name}`);
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
        if (templateName === 'pageLoader') {
            return templateName;
        }

        return `template-path-${templateName.replace('/', '-').replace('.', '-')}`;
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

            console.info('Route changes %s to %s: Activating page / loading template', fromState && fromState.name || '(null)', toState.name);

            const pageRegistration = this.findPage(toState.name),
                  page = pageRegistration.createPage(this.appContext);

            const [templateId] = await Promise.all([this.templateManager.loadTemplate(pageRegistration), page.activate(toState.params)]);

            this.page(page);
            this.templateName(templateId);
        } catch (e) {
            console.error(e);

            return false;
        }

        return true;
    }

    private findPage(routeName: string): PageRegistration {
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