import { default as ApiBase } from 'AppFramework/ServerApi/ApiBase';
import { ISheetEntry } from './SheetEntry';

export interface ITagReportSheetEntry extends ISheetEntry {
    sheetSubject: Date;
}

export class Api extends ApiBase {
    constructor() {
        super();

        this.baseUrl = '/api/report/tag';
    }

    public entries(tagId: number) {
        return this.execGet<ITagReportSheetEntry[]>(`${tagId}/entries`);
    }
}
