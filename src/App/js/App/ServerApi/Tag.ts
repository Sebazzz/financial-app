import { default as ApiBase, ICreatedResult } from 'AppFramework/ServerApi/ApiBase';

export interface ITag {
    id: number;
    name: string;
    description: string;
    hexColorCode: string | null;
}

function correctColorCode(entity: ITag) {
    if (entity.hexColorCode) {
        if (entity.hexColorCode[0] === '#') {
            entity.hexColorCode = entity.hexColorCode.substr(1);
        }
    }
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/tag';
    }

    public list() {
        return this.execGet<ITag[]>();
    }

    public delete(id: number) {
        return this.execDelete<void>(id);
    }

    public async get(id: number) {
        const tag = await this.execGet<ITag>(id);
        if (tag.hexColorCode) {
            tag.hexColorCode = '#' + tag.hexColorCode;
        }
        return tag;
    }

    public create(entity: ITag) {
        correctColorCode(entity);

        return this.execPost<ICreatedResult<ITag>>(null, entity);
    }

    public update(id: number, entity: ITag) {
        correctColorCode(entity);

        return this.execPut<void>(id, entity);
    }
}
