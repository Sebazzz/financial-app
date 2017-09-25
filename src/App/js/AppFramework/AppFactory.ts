import AppContext from './AppContext';
import { registerPageLoader, IPageRegistration } from './Page';
import { Router } from './Router';
import * as $ from 'jquery';
import * as ko from 'knockout';
import * as ComponentLoader from './ComponentLoader';
import './BindingHandlers/All';
import registerLoadingBar from './Components/LoadingBar';
import registerModal from './Components/Modal';
import hotModuleReplacementPage from './HotModulePage';
import installDefaultTemplates from './Templates/Index';

export interface IPageRepository {
    addPages(pages: IPageRegistration[]): void;
    replacePage(page: IPageRegistration): void;
}

export class App implements IPageRepository {
    public pages: IPageRegistration[] = [];
    public context: AppContext = new AppContext(this);
    public router = new Router();

    public start(): void {}
    public bind(): void {}
    public initRouter(): void { }
    public registerComponents(): void { }

    public findPage(routeName: string): IPageRegistration|null {
        for (const page of this.pages) {
            if (this.router.matchRoutingTable(routeName, page.routingTable)) {
                return page;
            }
        }

        return null;
    }

    public addPages(pages: IPageRegistration[]) {
        const uniquePageIds : Array<string> = [];

        for (const page of pages) {
            this.pages.push(page);

            if (uniquePageIds.indexOf(page.id) !== -1) {
                console.error('Page with id %s already exists in the loaded pages. App behaviour will be undefined.', page.id);
            }

            uniquePageIds.push(page.id);
        }
    }

    public replacePage(replacement: IPageRegistration): void {
        console.info('App HMR support: Replacing page %s', replacement.id);

        // Find matching page
        for (let index = 0; index < this.pages.length; index++) {
            const page = this.pages[index];

            if (page.id !== replacement.id) {
                continue;
            }

            if (page === replacement) {
                return;
            }

            if (JSON.stringify(page.routingTable) !== JSON.stringify(replacement.routingTable)) {
                console.warn('Routing table for page %s has changed: This is not supported. Reload the application to allow routing changes to apply.', replacement.id);
                return;
            }

            this.pages[index] = replacement;

            // Check if this is the current page
            const currentState = this.context.router.getState(),
                  routingTable = Array.isArray(page.routingTable) ? page.routingTable : [page.routingTable];

            if (routingTable.some(route => route.name === currentState.name)) {
                console.log('%s is the current loaded page. Reloading via HMR proxy page.', replacement.id);
                this.context.router.navigate(
                    'hmr-proxy',
                    { name: currentState.name, params: currentState.params ? JSON.stringify(currentState.params) : {} },
                    { replace: true },
                    () => console.log('Loading of HMR proxy for %s completed', replacement.id)
                );
                return;
            }

            console.log('Replacement of %s completed', replacement.id);

            return;
        }

        console.error('Unable to find page %s. Possibly the module name has changed. Reload the application.', replacement.id);
    }
}

function initRouter(app: App) {
    app.context.router = app.router.getInternalInstance();
    app.context.router.useMiddleware(app.context.authentication.middleware);

    app.initRouter();
    app.addPages([hotModuleReplacementPage]);

    for (const page of app.pages) {
        app.router.add(page.routingTable);
    }
}

function startUp(app: App) {
    console.info('AppFactory: Startup');

    app.context.authentication.initialize();
    app.router.start();
    app.start();
}

function bind(app: App) {
    console.info('AppFactory: Bind');

    app.bind();

    const element = document.body;

    ko.applyBindings(app, element);
}

function registerBindingProvider() {
    function preprocessor(node: Node) : void {
        if (node.nodeType === 8 && node.nodeValue) {
            node.nodeValue = node.nodeValue.replace('$appContext', '$app.context');
            node.nodeValue = node.nodeValue.replace('$app', '$root');
        } else if (node instanceof HTMLElement) {
            const dataBind = node.getAttribute('data-bind');

            if (dataBind) node.setAttribute('data-bind', dataBind.replace('$appContext', '$app.context').replace('$app', '$root'));
        }
    }

   (ko.bindingProvider.instance as any)['preprocessNode'] = preprocessor;
}

function registerComponents(appContext : AppContext) {
    registerLoadingBar(appContext);
    registerModal();
}

function registerGlobals() {
    // For development it is *very* useful to have some globals available

    (window as any)['ko'] = ko;
}

function setCultureInformation(app: App) {
    kendo.culture(app.context.culture);
}

/**
 * Applies a global hook to JSON payloads, so they are always converted to a Javascript date
 */
function applyJsonDateHook() {
    JSON.useDateParser();

    // At this time of initialization, jquery is already initialized and we have to manually apply the hook there
    $.ajaxPrefilter('text json', (options) => {
        options.converters && (options.converters['text json'] = JSON.parse);
    });
    ($ as any).parseJSON = JSON.parse;
}

function setKnockoutErrorHandler() {
    const isMobileDevice = document.documentElement.getAttribute('data-app-mobile') !== 'false';

    if (isMobileDevice) {
        // Incorrect TSD: onError should be writeable
        (ko as any).onError = (error : Error) => {
            alert(`Application error ${error.name}

${error.message}

At:
${error.stack}

${error.toString()}`);
        };
    }
}

export function createApp<TModel extends App>(app: TModel) {
    console.info('AppFactory: CreateApp');

    installDefaultTemplates();
    setKnockoutErrorHandler();
    applyJsonDateHook();
    setCultureInformation(app);
    registerGlobals();
    ComponentLoader.register(app.context);
    registerComponents(app.context);
    app.registerComponents();
    initRouter(app);
    registerPageLoader(app.context);
    registerBindingProvider();
    bind(app);
    startUp(app);

    console.info('AppFactory: Done');
}

// For improved performance, by default defer all updates
// via the knockout microtask queue
ko.options.deferUpdates = true;

// HMR support
if (module.hot) {
    module.hot.accept('./BindingHandlers/All', () => {
        console.warn('New binding handlers have been loaded.');
        console.warn('Please note though, they will only applied on new rendered templates or pages.');
        console.warn('This might create some inconsistency in your views.');
    });
}