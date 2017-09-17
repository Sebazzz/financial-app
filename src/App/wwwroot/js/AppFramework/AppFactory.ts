import AppContext from './AppContext';
import { registerPageLoader, IPageRegistration } from './Page';
import { Router } from './Router';
import * as $ from 'jquery';
import * as ko from 'knockout';
import * as ComponentLoader from './ComponentLoader';
import './BindingHandlers/All';
import registerLoadingBar from './Components/LoadingBar';
import registerModal from './Components/Modal';

export class App {
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

    protected addPages(pages: IPageRegistration[]) {
        for (const page of pages) {
            this.pages.push(page);
        }
    }
}

function initRouter(app: App) {
    app.context.router = app.router.getInternalInstance();
    app.context.router.useMiddleware(app.context.authentication.middleware);

    app.initRouter();
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