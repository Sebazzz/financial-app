import * as framework from 'AppFramework/Panel';
import AppContext from 'AppFramework/AppContext';

class Loader extends framework.Panel {
    public deactivate(): void {}
    protected onActivate(): Promise<void> {
        return Promise.resolve();
    }

    constructor(appContext: AppContext) {
        super(appContext);
    }
}

export function register(appContext: AppContext) {
    framework.createPanelComponent(
        'loader',
        require('~/ko-templates/widgets/loader.html'),
        () => new Loader(appContext)
    );
}
