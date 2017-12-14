import {Page, IPageRegistration} from 'AppFramework/Page'
import AppContext from 'AppFramework/AppContext'
import * as tag from '../../../ServerApi/Tag';
import * as ko from 'knockout';
import confirmAsync from 'AppFramework/Forms/Confirmation';

class DefaultPage extends Page {
    private api = new tag.Api();

    public tags = ko.observableArray<tag.ITag>();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Labels beheren');

        this.deleteTag = this.deleteTag.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        this.tags(await this.api.list());
    }

    public async deleteTag(tag: tag.ITag) {
        if (await confirmAsync(`Weet je zeker dat je ${tag.id} wilt verwijderen? De tag zal inactief worden gemaakt.`, 'Tag verwijderen', true)) {
            this.tags.remove(tag);
            await this.api.delete(tag.id);
        }
    }
}

export default {
    id: module.id,
    templateName: 'manage/tag/default',
    routingTable: { name: 'manage.tag', path: '/tag' },
    createPage: (appContext) => new DefaultPage(appContext)
} as IPageRegistration;