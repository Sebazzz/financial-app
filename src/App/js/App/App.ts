import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/util';

import * as af from 'AppFramework/AppFactory';
import pageFactory from './PageFactory';
import * as topMenu from './Components/TopMenu';
import * as loader from './Components/Loader';
import './Components/ScrollNub';
import './BindingHandlers/All';
import registerSetupInterceptor from './Services/SetupInterceptor';

export class App extends af.App {
    constructor() {
        super();

        registerSetupInterceptor(this.context);
    }

    public initRouter() {
        pageFactory.installPages(this);

        if (module.hot) {
            module.hot.accept('./PageFactory', () => {
                pageFactory.replacePages(this);
            });
        }
    }

    public bind(): void {
        this.context.title = 'Financial App';
    }

    public registerComponents(): void {
        topMenu.register(this.context);
        loader.register(this.context);
    }
}
