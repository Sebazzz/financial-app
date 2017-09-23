import * as af from './AppFramework/AppFactory'
import pageFactory from './PageFactory'
import * as topMenu from './Components/TopMenu'
import * as loader from './Components/Loader'
import './Components/ScrollNub'
import './BindingHandlers/All'
import 'bootstrap';

const setupMode = document.documentElement.getAttribute('data-app-setup-mode') === 'true';

export class App extends af.App {
    constructor() {
        super();

        this.context.authentication.addAnonymousRoute(/^\/setup($|\/)/);
    }

    public initRouter() {
        pageFactory.installPages(this);

        if (module.hot) {
            module.hot.accept('./PageFactory', () => {
                pageFactory.replacePages(this);
            });
        }

        if (setupMode) {
            // Redirect any path to setup if setup is not complete
            this.context.router.useMiddleware(router => {
                return (toState) => {
                    if (toState.name.indexOf('hmr-proxy') !== 0 &&
                        toState.name.indexOf('default') !== 0 &&
                        toState.name.indexOf('setup') !== 0) {
                        console.warn('Redirecting to setup wizard.');

                        router.navigate('setup');

                        return false;
                    }

                    return true;
                };
            });

            this.context.authentication.addAnonymousRoute(/^\/$/);
            this.context.router.forward('default', 'setup');
        } else {
            this.context.router.forward('setup', 'auth.login');
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

