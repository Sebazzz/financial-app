import AppContext from 'AppFramework/AppContext';
import {
    Page,
    PageRegistration,
    PageModule,
    PageTemplateReference,
    IPageTemplates
} from 'AppFramework/Navigation/Page';
import { State } from 'router5';
import isMobile from 'AppFramework/Client/BrowserDetector';

const defaultTemplateName = 'page-loader',
    errorTemplateName = 'page-error';

type Module<T> = { default: T };

function unwrapModule<T>(input: Module<T>): T {
    return input.default;
}

class PageTemplateManager {
    private loadedTemplates: {
        [templateId: string]: boolean | null | undefined;
    } = {};

    private static getPageModule(pageModule: PageModule): IPageTemplates {
        const template = pageModule.template;

        if (template instanceof Promise || typeof template === 'string') {
            return {
                default: template,
                mobile: undefined
            };
        }

        return template;
    }

    public async loadTemplate(page: PageModule): Promise<string> {
        const templates = PageTemplateManager.getPageModule(page);

        if (!templates) {
            throw new Error(`Unable to load empty template for ${page.id}`);
        }

        // Check template to load
        const templateReference = PageTemplateManager.selectTemplate(templates);

        if (typeof templateReference === 'string') {
            // If this is a hard template reference, assume it is a magic reference and it is already loaded
            return templateReference;
        }

        const templateId = PageTemplateManager.templateId(page.id, !!templates.mobile /*hasMobileTemplate*/);

        if (this.loadedTemplates[templateId]) {
            return templateId;
        }

        console.log('TemplateManager: Loading template of page %s as %s', page.id, templateId);

        const domElement = document.createElement('script') as HTMLScriptElement;
        domElement.type = 'text/html';
        domElement.id = templateId;
        domElement.innerHTML = unwrapModule<string>(await templateReference);

        document.body.appendChild(domElement);
        this.loadedTemplates[templateId] = true;

        console.log('TemplateManager: Loaded template of page %s as %s', page.id, templateId);

        return templateId;
    }

    private static selectTemplate(templates: IPageTemplates): PageTemplateReference {
        return isMobile() ? templates.mobile || templates.default : templates.default;
    }

    private static templateId(pageId: string, hasMobileTemplate: boolean) {
        const isMobileTemplateId = hasMobileTemplate && isMobile();

        return `template-page-${isMobileTemplateId ? 'mobile' : 'default'}type-${pageId
            .replace('/', '-')
            .replace('.', '')}`;
    }
}

// tslint:disable-next-line:max-classes-per-file
class PageComponentModel {
    private templateManager: PageTemplateManager;

    public templateName = ko.observable<string>(defaultTemplateName).extend({ notify: 'always' });
    public page = ko.observable<Page | null>(null);
    public errorInfo = ko.observable<string | null>(null);

    public bodyClassName = ko.observable<string | null>(null);

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

        let oldClassName: string | null = null;
        ko.computed(() => {
            const newClassName = this.bodyClassName();

            if (oldClassName != null) {
                document.body.classList.remove(oldClassName);
            }

            if (newClassName != null) {
                document.body.classList.add(newClassName);
            }

            oldClassName = newClassName;
        });
    }

    public async handleRouteChange(toState: State, fromState?: State): Promise<boolean> {
        try {
            console.info(
                'Route changes %s to %s: Deactivating page',
                (fromState && fromState.name) || '(null)',
                toState.name
            );

            const currentPage = this.page();
            if (currentPage) {
                currentPage.deactivate();
            }

            // Reset template
            this.templateName(defaultTemplateName);
            this.page(null);

            console.info(
                'Route changes %s to %s: Activating page / loading template',
                (fromState && fromState.name) || '(null)',
                toState.name
            );

            // Start loading page
            const pageRegistration = this.findPage(toState.name);
            this.bodyClassName(pageRegistration.bodyClassName || null);

            const pageModule = unwrapModule(await pageRegistration.loadAsync()),
                page = pageModule.createPage(this.appContext);

            const [templateId] = await Promise.all([this.loadTemplate(pageModule), page.activate(toState.params)]);

            this.page(page);
            this.templateName(templateId);
            this.errorInfo(null);

            this.appContext.router.setDependency('app.page', page);
        } catch (e) {
            console.error(e);

            this.bodyClassName('page-error');

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

    private loadTemplate(page: PageModule): Promise<string> {
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

            const koUtils = ko.utils as any,
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
        console.log(hotReload.name);

        return this.templateManager.loadTemplate(page);
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

export default function registerPageLoader(appContext: AppContext) {
    ko.components.register('page-container', new PageComponent(appContext));
}
