import {Page, IPageRegistration} from '../AppFramework/Page'
import AppContext from '../AppFramework/AppContext'

class ReportPage extends Page {

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Rapportage');
    }

    protected onActivate(args?: any): Promise<void> {
        return Promise.resolve();
    }
} 

export default {
    id: module.id,
    templateName: 'report',
    routingTable: { name: 'report', path: '/report' },
    createPage: (appContext) => new ReportPage(appContext)
} as IPageRegistration;