import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';

class HotModuleReplacementPage extends Page {
    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Hot Module Replacement in progress');
    }

    protected onActivate(args?: any): Promise<void> {
        setTimeout(() => {
            if (!args) {
                alert('HMR arguments not provided');
                return;
            }

            const nextState = args.params ? JSON.parse(args.params) : {},
                name = args.name;

            this.appContext.router.navigate(name, nextState, { replace: true }, () =>
                console.info('Replaced page and redirected to %s', name)
            );
        });

        return Promise.resolve();
    }
}

export default {
    id: module.id,
    template: 'page-loader',
    createPage: appContext => new HotModuleReplacementPage(appContext)
} as PageModule;
