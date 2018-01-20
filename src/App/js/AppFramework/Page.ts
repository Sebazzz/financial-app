import AppContext from './AppContext';
import { Router, State } from 'router5';
import { RoutingTable } from './Router';

import {Panel, ActivationPromise} from './Panel';
import * as ko from 'knockout';

export interface IPageRegistration {
    /**
     * Represents an unique identifier for the page. This is used for hot-reloading the page.
     */
    id: string;

    /**
     * Specifies the name of the template (sub-path) of the path.
     */
    templateName: string;

    /**
     * Specifies the routes that lead to the page
     */
    routingTable: RoutingTable;

    /**
     * Factory for creating the actual page instance. Is called on every navigation.
     *
     * Must return a page instance. The page will have the opportunity to load resources asynchronously.
     */
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

        // ReSharper disable once MissingHasOwnPropertyInForeach
        // tslint:disable-next-line:forin
        for (const property in bag) {
            const item = bag[property];

            if (ko.isComputed(item)) {
                item.dispose();
            }
        }
    }
}

const defaultTemplateName = 'page-loader',
      errorTemplateName = 'page-error',
      magicTemplates = [defaultTemplateName, errorTemplateName];

class PageTemplateManager {
    private loadedTemplates: { [template: string]: boolean | null | undefined } = {};

    constructor() {
        // Provided by app implementor
        for (const magicTemplate of magicTemplates) {
            this.loadedTemplates[magicTemplate] = true;
        }
    }

    public async loadTemplate(page: PageRegistration, reloadCallback?: (template: string) => void): Promise<string> {
        const templateName = page.templateName;

        if (!templateName) {
            throw new Error(`Unable to load empty template for ${page.id}`);
        }

        const templateId = PageTemplateManager.templateId(templateName);

        if (this.loadedTemplates[templateName] === true) {
            return templateId;
        }

        console.log('TemplateManager: Loading template from %s as %s', templateName, templateId);

        const content = (await PageTemplateManager.importAsync(templateName)),
              domElement = document.createElement('script') as HTMLScriptElement;

        console.log('TemplateManager: Loaded template from %s', templateName, templateId);

        domElement.type = 'text/html';
        domElement.id = templateId;
        domElement.innerHTML = content;

        document.body.appendChild(domElement);
        this.loadedTemplates[templateName] = true;

        if (module.hot) {
            // We can't apply to updates to child modules of our module, and from webpack
            // perspective a wildcard/dynamic include is a child module.
            //
            // In addition, during bundling, if not hoisted into a variable, webpack
            // will create a iif that throws an exception.
            const recursiveName = './ko-templates lazy recursive ^\\.\\/.*\\.html$';

            console.log('Adding call for template %s via %s', templateName, recursiveName);
            module.hot.accept(recursiveName, async () => {
                console.info('Accepting update for template %s', templateName);

                await this.reload(templateName);

                if (reloadCallback) {
                    reloadCallback(templateId);
                }
            });
        }

        return templateId;
    }

    public async reload(templateName: string) {
        const templateId = PageTemplateManager.templateId(templateName),
              domElement = document.getElementById(templateId) as HTMLScriptElement,
              newTemplate = await PageTemplateManager.importAsync(templateName);

        domElement.innerHTML = newTemplate;

        return newTemplate;
    }

    private static async importAsync(templateName: string): Promise<string>  {
        // TODO: Use template string once TS compiler bug has been fixed [https://github.com/Microsoft/TypeScript/issues/16763]

        // We cannot check in advance whether a mobile template is available,
        // so just try to load it, and if we fail, load the regular template.
        try {
            const isMobileDevice = document.documentElement.getAttribute('data-app-mobile') !== 'false';

            if (isMobileDevice) {
                return await import(
                    /* webpackChunkName: "templates" */
                    /* webpackMode: "lazy" */
                    '~/ko-templates/' + templateName + '.mobile.html');
            }
            console.log('~/ko-templates/' + templateName + '.html');
            return await import(
                /* webpackChunkName: "templates" */
                /* webpackMode: "lazy" */
                '~/ko-templates/' + templateName + '.html');
        } catch (e) {
            console.log('~/ko-templates/' + templateName + '.html');
            return await import(
                /* webpackChunkName: "templates" */
                /* webpackMode: "lazy" */
                '~/ko-templates/' + templateName + '.html');
        }
    }

    private static templateId(templateName: string) {
        if (magicTemplates.indexOf(templateName) !== -1) {
            return templateName;
        }

        return `template-path-${templateName.replace('/', '-').replace('.', '-')}`;
    }
}

export class RouterUtils {
    public static getPage(router: Router): Page|null {
        const deps = router.getDependencies();

        return deps && deps['app.page'] || null;
    }
}

// tslint:disable-next-line:max-classes-per-file
class PageComponentModel {
    private templateManager: PageTemplateManager;

    public templateName = ko.observable<string>(defaultTemplateName).extend({ notify: 'always' });
    public page = ko.observable<Page | null>(null);
    public errorInfo = ko.observable<string | null>(null);

    public title = ko.computed(() => {
        const page = this.page(),
              pageTitle = page && page.title();

        return pageTitle;
    });

    constructor(private appContext: AppContext) {
        this.templateManager = new PageTemplateManager();
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

            const [templateId] = await Promise.all([this.loadTemplate(pageRegistration), page.activate(toState.params)]);

            this.page(page);
            this.templateName(templateId);
            this.errorInfo(null);

            this.appContext.router.setDependency('app.page', page);
        } catch (e) {
            console.error(e);

            // Always consider the page load to be a success, even in the case of a failure. Instead,
            // we load a failed template and be done with that.
            this.templateName(errorTemplateName);
            try {
                this.errorInfo(e.toString());
            } catch (e) {
                this.errorInfo(JSON.stringify(e));
            }

            return true;
        }

        return true;
    }

    private loadTemplate(page: IPageRegistration): Promise<string> {
        // The handler below will be called if the current template is available for hot reloading.
        // We hack the knockout error async error mechanism so that errors are immediately returned,
        // and we show an error page if the template cannot be applied.
        //
        // In the happy path, the template is immediately applied to the model so we allow a very efficient
        // developer experience where templates can immediately be applied.
        const hotReload = (templateId: string) => {
            const currentTemplate = this.templateName.peek();
            if (templateId !== currentTemplate && currentTemplate !== errorTemplateName) {
                return;
            }

            console.group('Reloading template... ' + templateId);

            const koUtils = (ko.utils as any),
                currentErrorHandler = koUtils.deferError;

            koUtils.deferError = (e: Error) => {
                console.error('HMR: Unable to apply updated template');
                console.error(e);

                this.templateName(errorTemplateName);
            };

            try {
                this.templateName(templateId);

                // Ensure multi-layered templates are applied immediately
                ko.tasks.runEarly();
                ko.tasks.runEarly();
                ko.tasks.runEarly();
            } catch (e) {
                console.error('HMR: Unable to apply updated template');
                console.error(e);

                this.templateName(errorTemplateName);
            } finally {
                koUtils.deferError = currentErrorHandler;
                console.groupEnd();
            }
        };

        return this.templateManager.loadTemplate(page, hotReload);
    }

    private findPage(routeName: string): PageRegistration {
        const page = this.appContext.app.findPage(routeName);

        if (page === null) {
            throw new Error('Unable to find page matching route: ' + routeName);
        }

        return page;
    }
}

// tslint:disable-next-line:max-classes-per-file
class PageComponent implements KnockoutComponentTypes.ComponentConfig {
    private appContext: AppContext;
    public viewModel: KnockoutComponentTypes.ViewModelFactoryFunction = {
        createViewModel: () => {
            return new PageComponentModel(this.appContext);
        }
    };

    public template: string;
    public synchronous = true;

    constructor(appContext: AppContext) {
        this.appContext = appContext;

        this.template = '<div data-bind="template: { name: $component.templateName, data: $component.page }"></div>';
    }
}

export function registerPageLoader(appContext: AppContext) {
    ko.components.register('page-container', new PageComponent(appContext));
}
