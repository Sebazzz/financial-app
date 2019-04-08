import AppContext from 'AppFramework/AppContext';
import {
    Page,
    PageRegistration,
    PageModule,
    PageTemplateReference,
    IPageTemplates,
    IPageRegistration
} from 'AppFramework/Navigation/Page';
import { State } from 'router5';
import isMobile from 'AppFramework/Client/BrowserDetector';
import * as ko from 'knockout';

const defaultTemplateName = 'page-loader',
    errorTemplateName = 'page-error';

interface IModule<T> {
    /**
     * Default export of module
     */
    default: T;
}

/**
 * Helper class to unwrap module export
 *
 * @param input Module export object
 */
function unwrapModule<T>(input: IModule<T>): T {
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

        this.loadTemplateToDom(page.id, templateId, await templateReference);

        return templateId;
    }

    /**
     * Reloads templates, returns a value whether the replacement has actually different templates
     *
     * @param currentPageModule
     * @param replacementPageModule
     */
    public async reloadTemplate(
        currentPageModuleId: string,
        replacementPageModule: PageModule
    ): Promise<{ templateId: string; hasChanged: boolean }> {
        const replacementTemplates = PageTemplateManager.getPageModule(replacementPageModule),
            replacementTemplateReference = PageTemplateManager.selectTemplate(replacementTemplates);

        if (typeof replacementTemplateReference === 'string') {
            // Magic reference reload not supported
            return { templateId: replacementTemplateReference, hasChanged: false };
        }

        // Get the ids, these should yield the same, but if they don't this means isMobile() is returning a different value
        const currentTemplateId = PageTemplateManager.templateId(
                currentPageModuleId,
                !!replacementTemplates.mobile /*hasMobileTemplate*/
            ),
            replacementTemplateId = PageTemplateManager.templateId(
                replacementPageModule.id,
                !!replacementTemplates.mobile /*hasMobileTemplate*/
            );

        if (currentTemplateId !== replacementTemplateId) {
            this.loadTemplateToDom(replacementPageModule.id, replacementTemplateId, await replacementTemplateReference);

            // Still, force reload of page since we don't know what else might have changed
            return { templateId: replacementTemplateId, hasChanged: false };
        }

        // Load the templates, compare the strings
        const replacementTemplate = await replacementTemplateReference,
            currentTemplateElement = document.getElementById(currentTemplateId);

        if (!currentTemplateElement) {
            // This shouldn't happen. We did load the template but the DOM element does not exist?
            // Return failure, and the regular path should fix this mess.
            return { templateId: replacementTemplateId, hasChanged: false };
        }

        // Compare the strings to check if the template HTML has changed. We are comparing the "innerHTML",
        // so not sure what the cross-browser behavior is here, but for the browsers I develop in this works fine.
        if (currentTemplateElement.innerHTML === unwrapModule(replacementTemplate)) {
            // The strings have not changed
            return { templateId: replacementTemplateId, hasChanged: false };
        }

        // Strings have changed, so reload it
        this.loadTemplateToDom(replacementPageModule.id, replacementTemplateId, replacementTemplate);

        return { templateId: replacementTemplateId, hasChanged: true };
    }

    private loadTemplateToDom(pageId: string | number, templateId: string, templateReference: HtmlModule) {
        console.log('TemplateManager: Loading template of page %s as %s', pageId, templateId);

        const domElement =
            (document.getElementById(templateId) as HTMLScriptElement) ||
            (document.createElement('script') as HTMLScriptElement);
        domElement.type = 'text/html';
        domElement.id = templateId;
        domElement.innerHTML = unwrapModule<string>(templateReference);

        // Check if we need to attach to DOM
        if (!domElement.parentElement) {
            document.body.appendChild(domElement);
        }

        this.loadedTemplates[templateId] = true;

        console.log('TemplateManager: Loaded template of page %s as %s', pageId, templateId);
    }

    private static selectTemplate(templates: IPageTemplates): PageTemplateReference {
        return isMobile() ? templates.mobile || templates.default : templates.default;
    }

    private static templateId(pageId: string | number, hasMobileTemplate: boolean) {
        const isMobileTemplateId = hasMobileTemplate && isMobile();

        return `template-page-${isMobileTemplateId ? 'mobile' : 'default'}type-${pageId
            .toString()
            .replace('/', '-')
            .replace('.', '')}`;
    }
}

// TODO: Is there a better way instead of keeping a global?
let pageComponentInstance: PageComponentModel | null = null;

// tslint:disable-next-line:max-classes-per-file
class PageComponentModel implements ko.components.ViewModel {
    private templateManager: PageTemplateManager;
    private pageTemplateName: string | null = null;

    private pageRegistrationToPageIdMap: {
        [pageRegistrationId: string]: string | null | undefined;
    } = {};

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

        pageComponentInstance = this;
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

            this.pageRegistrationToPageIdMap[pageRegistration.id] = pageModule.id.toString();

            const [templateId] = await Promise.all([
                this.templateManager.loadTemplate(pageModule),
                page.activate(toState.params)
            ]);

            this.page(page);
            this.pageTemplateName = templateId;
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

    public async tryReloadTemplate(
        currentPageRegistration: IPageRegistration,
        replacementPageRegistration: IPageRegistration
    ): Promise<boolean> {
        try {
            const currentPageModuleId = this.pageRegistrationToPageIdMap[currentPageRegistration.id];
            if (!currentPageModuleId) {
                // We have never loaded this page, we cannot reload the templates. Good optimization.
                console.debug('Page %s was not loaded yet. Skipping template reload.', currentPageRegistration.id);
                return false;
            }

            const replacementPageModule = unwrapModule(await replacementPageRegistration.loadAsync());

            const { templateId, hasChanged } = await this.templateManager.reloadTemplate(
                currentPageModuleId,
                replacementPageModule
            );

            if (!hasChanged) {
                console.debug(
                    'Page %s did not have a changed template. Skipping template reload.',
                    currentPageRegistration.id
                );
                return false;
            }

            console.debug(
                'Page %s does have a changed template. Template has been reloaded.',
                currentPageRegistration.id
            );
            this.hotReloadRunningTemplate(templateId);
            return true;
        } catch (e) {
            console.error('Error reloading templates, returning false.');
            console.error(e);

            return false;
        }
    }

    /**
     * Reload the current template
     */
    public reloadCurrentTemplate() {
        this.hotReloadRunningTemplate(this.pageTemplateName || this.templateName.peek());
    }

    /**
     * The handler below will be called if the current template is available for hot reloading.
     * We hack the knockout error async error mechanism so that errors are immediately returned,
     * and we show an error page if the template cannot be applied.
     *
     * In the happy path, the template is immediately applied to the model so we allow a very efficient
     * developer experience where templates can immediately be applied.
     *
     * @param templateId The template id to reload
     */
    private hotReloadRunningTemplate(templateId: string) {
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
    }

    private findPage(routeName: string): PageRegistration {
        const page = this.appContext.app.findPage(routeName);

        if (page === null) {
            throw new Error('Unable to find page matching route: ' + routeName);
        }

        return page;
    }

    public dispose() {
        // STFU tsc
    }
}

// tslint:disable-next-line:max-classes-per-file
class PageComponent implements ko.components.Config {
    private appContext: AppContext;
    public viewModel: ko.components.ViewModelFactory = {
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

/**
 * Reloads the template of the current page. Returns true in the case the template was found to be changed, returns false in the case
 * of either failure or when the template was not changed between versions. This means a page reload is required in that case.
 *
 * @param currentPageRegistration The current page registration
 * @param replacementPageRegistration The new page registration
 */
export function tryReloadTemplate(
    currentPageRegistration: PageRegistration,
    replacementPageRegistration: IPageRegistration
): Promise<boolean> {
    if (pageComponentInstance === null) {
        throw new Error('Application not initialized');
    }

    return pageComponentInstance.tryReloadTemplate(currentPageRegistration, replacementPageRegistration);
}

/**
 * Reloads the the template of the current running page
 */
export function reloadCurrentTemplate() {
    if (pageComponentInstance === null) {
        throw new Error('Application not initialized');
    }

    pageComponentInstance.reloadCurrentTemplate();
}
