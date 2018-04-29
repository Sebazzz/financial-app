import { Page, IPageRegistration } from 'AppFramework/Page';
import AppContext from 'AppFramework/AppContext';
import * as category from '../../../ServerApi/Category';
import * as ko from 'knockout';
import confirmAsync from 'AppFramework/Forms/Confirmation';

class DefaultPage extends Page {
    private api = new category.Api();

    public categories = ko.observableArray<category.ICategoryListing>();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Categoriëen');

        this.deleteCategory = this.deleteCategory.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        this.categories(await this.api.list());
    }

    public async deleteCategory(category: category.ICategoryListing) {
        if (
            await confirmAsync(`Weet je zeker dat je ${category.id} wilt verwijderen?`, 'Categorie verwijderen', true)
        ) {
            this.categories.remove(category);
            await this.api.delete(category.id);
        }
    }
}

export default {
    id: module.id,
    templateName: 'manage/category/default',
    routingTable: { name: 'manage.category', path: '/category' },
    createPage: appContext => new DefaultPage(appContext)
} as IPageRegistration;
