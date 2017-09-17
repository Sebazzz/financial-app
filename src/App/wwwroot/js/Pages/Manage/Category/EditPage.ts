import AppContext from '../../../AppFramework/AppContext';
import {IPageRegistration} from '../../../AppFramework/Page';
import FormPage from '../../../AppFramework/Forms/FormPage';
import * as category from '../../../ServerApi/Category';
import * as validate from '../../../AppFramework/Forms/ValidateableViewModel';
import * as mapper from '../../../AppFramework/ServerApi/Mapper';
import * as ko from 'knockout';

class EditPage extends FormPage {
    private api = new category.Api();

    public id = ko.observable<number>(0);
    public category = ko.observable<EditViewModel>(new EditViewModel());

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Categorie bewerken');

        this.save = this.save.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        if (args && args.id) {
            this.id(+args.id);

            this.title('Categorie bewerken');
            this.set(await this.api.get(this.id.peek()));
            this.title(`Categorie "${this.category().name()}" bewerken`);
        } else {
            this.id(0);
            this.category(new EditViewModel());
            this.title('Categorie aanmaken');
        }
    }

    public async save(): Promise<void> {
        const category = this.category.peek();

        try {
            const serialized = ko.toJS(category) as category.ICategory,
                  id = this.id.peek(),
                  isNew = id === 0;

            if (isNew) {
                await this.api.create(serialized);
            } else {
                await this.api.update(id, serialized);
            }

            this.appContext.router.navigate('manage.category');
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, category)) {
                throw e;
            }
        }
    }

    private set(data: category.ICategory): any {
        const vm = mapper.MapUtils.deserialize<EditViewModel>(EditViewModel, data);
        if (!vm) {
            throw new Error('Unable to deserialize server response: null');
        }

        this.category(vm);
    }
}

export class EditViewModel extends validate.ValidateableViewModel {
    public id = 0;
    public name = ko.observable<string>();
    public description = ko.observable<string>();
}

export default {
    name: 'EditManageCategory',
    templateName: 'manage/category/edit',
    routingTable: [
        { name: 'manage.category.edit', path: '/edit/:id' },
        { name: 'manage.category.add', path: '/add'}
    ],
    createPage: (appContext) => new EditPage(appContext)
} as IPageRegistration;