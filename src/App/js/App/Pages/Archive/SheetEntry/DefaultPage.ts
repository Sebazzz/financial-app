import { Page, IPageRegistration } from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';

class DefaultPage extends Page {
    constructor(appContext: AppContext) {
        super(appContext);
    }

    protected async onActivate(args?: any): Promise<void> {}
}

export default {
    id: module.id,
    templateName: 'default',
    routingTable: [
        {
            name: 'sheet.entry',
            path: '/entry',
            forwardTo: 'archive.sheet.entry'
        },
        {
            name: 'archive.sheet.entry',
            path: '/entry',
            forwardTo: 'archive.sheet'
        }
    ],
    createPage: appContext => new DefaultPage(appContext)
} as IPageRegistration;
