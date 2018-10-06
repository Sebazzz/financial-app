import { IDisposable, disposeObject } from 'AppFramework/Utils/ObjectDisposal';
import * as ko from 'knockout';

export type AsyncDataLoader<T> = () => Promise<T>;

export class AsyncDataSource<T> implements IDisposable {
    public isLoading = ko.observable<boolean>();
    public isLoaded = ko.observable<boolean>();
    public data = ko.observable<T>();

    public error = ko.observable<any>();
    public isErrored = ko.pureComputed(() => !!this.error());

    public template = ko.pureComputed(() => {
        if (this.isErrored()) {
            return 'panel-error';
        }

        if (this.isLoading() || !this.data()) {
            return 'page-loader';
        }

        return null;
    });

    constructor(private handler: AsyncDataLoader<T>) {
        this.invokeLoad = this.invokeLoad.bind(this);
        this.reload = this.reload.bind(this);
    }

    public invokeLoad() {
        if (this.isLoaded.peek()) {
            return;
        }

        this.reload();
    }

    public reload() {
        // Async fire a reload
        (async () => {
            if (this.isLoading.peek()) {
                // The proper behavior is to abort. We don't have that currently.
                return;
            }

            let handle = 0;
            try {
                if (this.data.peek()) {
                    // If we have data, prevent the loader from flickering, so keep some slack time
                    handle = window.setTimeout(() => this.isLoading(true), 750 /*Good guess*/);
                } else {
                    this.isLoading(true);
                }

                this.error(null);
                this.data(await this.handler());

                this.isLoaded(true);
            } catch (e) {
                console.error(e);
                this.error(e);
            } finally {
                window.clearTimeout(handle);
                this.isLoading(false);
            }
        })();
    }

    public dispose(): void {
        disposeObject(this);
    }
}
