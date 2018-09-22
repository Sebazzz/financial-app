import { Page, PageModule } from 'AppFramework/Navigation/Page';
import AppContext from 'AppFramework/AppContext';
import * as tag from 'App/ServerApi/Tag';
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
        if (
            await confirmAsync(
                `Weet je zeker dat je ${tag.id} wilt verwijderen? De tag zal inactief worden gemaakt.`,
                'Tag verwijderen',
                true
            )
        ) {
            this.tags.remove(tag);
            await this.api.delete(tag.id);
        }
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/manage/tag/default.html'),
    createPage: appContext => new DefaultPage(appContext)
} as PageModule;
