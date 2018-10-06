import AppContext from 'AppFramework/AppContext';
import { Router } from 'router5';
import { RoutingTable } from 'AppFramework/Navigation/Router';
import { IDisposable, disposeObject } from 'AppFramework/Utils/ObjectDisposal';

import { Panel, ActivationPromise } from 'AppFramework/Panel';
import * as ko from 'knockout';

export interface IPageRegistration {
    /**
     * Represents an unique identifier for the page. This is used for hot-reloading the page.
     */
    id: string;

    /**
     * Body class name
     *
     * Note: This is something we could have lazy loaded, but it is nice to see some progress while the page is loading.
     */
    bodyClassName?: string;

    /**
     * Specifies the routes that lead to the page
     */
    routingTable: RoutingTable;

    /**
     * Loads the page information and module async
     */
    loadAsync(): Promise<{ default: IPageModule }>;
}

export type PageTemplateReference = Promise<HtmlModule> | string;

export interface IPageTemplates {
    /**
     * The default content of the page. Required.
     */
    default: PageTemplateReference;

    /**
     * The mobile template of the page. Optional.
     */
    mobile: PageTemplateReference | undefined;
}

export interface IPageModule {
    /**
     * Gets the unique id of the page module. Should be equal to `module.id`
     */
    id: string | number; // Can be number when in production mode

    /**
     * Gets the template content for the page
     */
    template: IPageTemplates | PageTemplateReference;

    /**
     * Factory for creating the actual page instance. Is called on every navigation.
     *
     * Must return a page instance. The page will have the opportunity to load resources asynchronously.
     */
    createPage(appContext: AppContext): Page;
}

export type PageModule = IPageModule;
export type PageRegistration = IPageRegistration;

/*
 * A page registration collection is either an array. The elements are ether a IPageRegistration or an array of PageRegistrationCollection.
 */
export interface IPageRegistrationCollection extends Array<PageRegistration | IPageRegistrationCollection> {}
export type PageRegistrationCollection = IPageRegistrationCollection;

export abstract class Page extends Panel implements IDisposable {
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
        this.dispose();
    }

    public dispose(): void {
        disposeObject(this);
    }

    protected abstract onActivate(args?: any): ActivationPromise | null;
}

export class RouterUtils {
    public static getPage(router: Router): Page | null {
        const deps = router.getDependencies();

        return (deps && deps['app.page']) || null;
    }
}
