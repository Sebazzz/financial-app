import * as ko from 'knockout';
import AppContext from './AppContext';
import HttpClient from './ServerApi/HttpClient';

export function register(appContext: AppContext) {
    const appVersion = appContext.versionStamp;
    const defaultLoader: ko.components.defaultLoader = ko.components.defaultLoader as any; // knockout/issues/2459
    const httpClient = HttpClient.create();

    ko.components.loaders.unshift({
        loadTemplate(componentName: string, templateConfig: any, callback: (result: Node[] | null) => void): void {
            if (typeof templateConfig === 'object' && typeof templateConfig.location === 'string') {
                console.log('ComponentLoader: %s', componentName);
                httpClient.getText(templateConfig.location, { v: appVersion }).then((html: any) => {
                    if (!html) {
                        return;
                    }

                    // tslint:disable-next-line:no-unused-expression
                    defaultLoader.loadTemplate && defaultLoader.loadTemplate(componentName, html as string, callback);
                });
            } else {
                callback(null);
            }
        }
    });
}
