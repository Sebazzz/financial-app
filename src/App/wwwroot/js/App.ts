import * as af from './AppFramework/AppFactory'
import getPages from './PageFactory'
import * as topMenu from './Components/TopMenu'
import 'bootstrap';

export class App extends af.App {
    constructor() {
        super();
    }

    public initRouter() {
        this.addPages(getPages(this.context));
    }

    public bind(): void {
        this.context.title = 'Financial App';
    }

    public registerComponents(): void {
        topMenu.register(this.context);
    }
}