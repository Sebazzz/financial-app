import AppContext from 'AppFramework/AppContext';
import { PageModule } from 'AppFramework/Navigation/Page';
import FormPage from 'AppFramework/Forms/FormPage';
import * as tag from 'App/ServerApi/Tag';
import * as validate from 'AppFramework/Forms/ValidateableViewModel';
import * as mapper from 'AppFramework/ServerApi/Mapper';
import * as ko from 'knockout';

class EditPage extends FormPage {
    private api = new tag.Api();

    public id = ko.observable<number>(0);
    public tag = ko.observable<EditViewModel>(new EditViewModel());

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Label bewerken');

        this.save = this.save.bind(this);
    }

    protected async onActivate(args?: any): Promise<void> {
        if (args && args.id) {
            this.id(+args.id);

            this.title('Label bewerken');
            this.set(await this.api.get(this.id.peek()));
            this.title(`Label "${this.tag().name()}" bewerken`);
        } else {
            this.id(0);
            this.tag(new EditViewModel());
            this.title('Label aanmaken');
        }
    }

    public async save(): Promise<void> {
        const tag = this.tag.peek();

        try {
            const serialized = ko.toJS(tag) as tag.ITag,
                id = this.id.peek(),
                isNew = id === 0;

            if (isNew) {
                await this.api.create(serialized);
            } else {
                await this.api.update(id, serialized);
            }

            this.appContext.router.navigate('manage.tag');
        } catch (e) {
            const xhr = e as JQueryXHR;

            if (!validate.tryExtractValidationError(xhr, tag)) {
                throw e;
            }
        }
    }

    private set(data: tag.ITag): any {
        const vm = mapper.MapUtils.deserialize<EditViewModel>(EditViewModel, data);
        if (!vm) {
            throw new Error('Unable to deserialize server response: null');
        }

        this.tag(vm);
    }
}

export class EditViewModel extends validate.ValidateableViewModel {
    private static defaultColorCode = '#0090FF';

    public id = 0;
    public name = ko.observable<string>();
    public description = ko.observable<string>();
    public hexColorCode = ko.observable<string | null>(EditViewModel.defaultColorCode);

    public noColor = ko.computed(() => this.hexColorCode() === null);

    public disableColorSelection() {
        this.hexColorCode(null);
    }

    public enableColorSelection() {
        this.hexColorCode(EditViewModel.defaultColorCode);
    }

    public toggleColor() {
        // Using a timeout because using a click and checked binding together confuses the hell out of knockout
        setTimeout(() => {
            if (this.noColor()) {
                this.enableColorSelection();
            } else {
                this.disableColorSelection();
            }
        }, 100);
    }
}

export default {
    id: module.id,
    template: import(/*webpackMode: "eager"*/ 'Template/manage/tag/edit.html'),
    createPage: appContext => new EditPage(appContext)
} as PageModule;
