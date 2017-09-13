import {Page} from '../../../AppFramework/Page'
import AppContext from '../../../AppFramework/AppContext'
import * as category from '../../../ServerApi/Category';
import * as ko from 'knockout';
import confirmAsync from '../../../AppFramework/Forms/Confirmation';

export default class DefaultPage extends Page {
    private api = new category.Api();

    public categories = ko.observableArray<category.ICategoryListing>();

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Categoriëen');
        this.templateName = 'CategoryList';
        this.routes = [
            { name: 'manage.category', path: '/category' }
        ];

        this.deleteCategory = this.deleteCategory.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        this.categories(await this.api.list());
    }

    public async deleteCategory(category: category.ICategoryListing) {
        if (await confirmAsync(`Weet je zeker dat je ${category.name} wilt verwijderen?`, 'Categorie verwijderen', true)) {
            this.categories.remove(category);
            await this.api.delete(category.id);
        }
    }
} 