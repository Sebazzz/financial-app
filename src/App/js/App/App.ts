import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/util';

import * as af from 'AppFramework/AppFactory';
import installPages from './Navigation';
import * as topMenu from './Components/TopMenu';
import * as loader from './Components/Loader';
import './Components/ScrollNub';
import './BindingHandlers/All';
import registerSetupInterceptor from './Services/SetupInterceptor';

function bindingHandlerReloadSupport(app: App) {
    // HMR support
    if (module.hot) {
        module.hot.accept('./BindingHandlers/All', () => {
            console.warn('New binding handlers have been loaded - will attempt to reload current page template.');
            console.warn('Please note though, they will only applied on new rendered templates or pages.');
            console.warn(
                'This might create some inconsistency in your views if the bindinghandler that has been reloaded exists in the main layout.'
            );

            app.refreshRender();
        });
    }
}

export class App extends af.App {
    constructor() {
        super();

        registerSetupInterceptor(this.context);
        bindingHandlerReloadSupport(this);
    }

    public initRouter() {
        installPages(this);
    }

    public bind(): void {
        this.context.title = 'Financial App';
    }

    public registerComponents(): void {
        topMenu.register(this.context);
        loader.register(this.context);
    }
}
