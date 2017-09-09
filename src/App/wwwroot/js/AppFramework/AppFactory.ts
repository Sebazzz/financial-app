import AppContext from './AppContext';
import { registerPageLoader, Page } from './Page';
import { Router } from './Router';
import * as ko from 'knockout';
import * as ComponentLoader from './ComponentLoader';

export class App {
    public pages: Page[] = [];
    public context: AppContext = new AppContext(this);
    public router = new Router();

    public start(): void {}
    public bind(): void {}
    public initRouter(): void { }
    public registerComponents(): void { }

    public findPage(routeName: string): Page|null {
        for (const page of this.pages) {
            if (this.router.matchPage(routeName, page)) {
                return page;
            }
        }

        return null;
    }

    protected addPages(pages: Page[]) {
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
        app.router.addPage(page);
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
        if (node.nodeType === 8) {
            node.nodeValue = node.nodeValue.replace('$appContext', '$app.context');
            node.nodeValue = node.nodeValue.replace('$app', '$root');
        } else if (node instanceof HTMLElement) {
            const dataBind = node.getAttribute('data-bind');

            if (dataBind) node.setAttribute('data-bind', dataBind.replace('$appContext', '$app.context').replace('$app', '$root'));
        }

        return null;
    }

   (ko.bindingProvider.instance as any)['preprocessNode'] = preprocessor;
}

export function createApp<TModel extends App>(app: TModel) {
    console.info('AppFactory: CreateApp');

    ComponentLoader.register(app.context);
    app.registerComponents();
    initRouter(app);
    registerPageLoader(app.context);
    registerBindingProvider();
    bind(app);
    startUp(app);

    console.info('AppFactory: Done');
}

ko.options.deferUpdates = true;