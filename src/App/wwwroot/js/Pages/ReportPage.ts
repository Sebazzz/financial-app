import { Page } from '../AppFramework/Page'
import AppContext from '../AppFramework/AppContext'

export default class ReportPage extends Page {

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Rapportage');
        this.templateName = 'report';
        this.routes = { name: 'report', path: '/report' };
    }

    protected onActivate(args?: any): Promise<void> {
        return Promise.resolve();
    }
} 