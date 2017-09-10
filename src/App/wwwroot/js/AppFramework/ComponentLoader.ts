import * as ko from 'knockout';
import * as $ from 'jquery';
import AppContext from './AppContext';

export function register(appContext : AppContext) {
    const appVersion = appContext.versionStamp;
    const defaultLoader = ko.components.defaultLoader;

    ko.components.loaders.unshift({
        loadTemplate(componentName: string, templateConfig: any, callback: (result: Node[] | null) => void): void {
            if (typeof templateConfig === 'object' && typeof templateConfig.location === 'string') {
                console.log('ComponentLoader: %s', componentName);
                $.get(templateConfig.location, {v:appVersion})
                    .done((html: any) => {
                        if (!html) {
                            return;
                        }

                        defaultLoader.loadTemplate && defaultLoader.loadTemplate(componentName, html as string, callback);
                 });

            } else {
                callback(null);
            }
        }
    });
}