import { Page } from '../../../AppFramework/Page'
import AppContext from '../../../AppFramework/AppContext'

export default class DefaultPage extends Page {
    constructor(appContext: AppContext) {
        super(appContext);

        this.templateName = 'archive/default';
        this.routes = [
            { name: 'sheet.entry', path: '/entry', forwardTo: 'archive.sheet.entry' },
            { name: 'archive.sheet.entry', path: '/entry', forwardTo: 'archive.sheet' }
        ];
    }

    protected async onActivate(args?: any): Promise<void> {
    }
} 