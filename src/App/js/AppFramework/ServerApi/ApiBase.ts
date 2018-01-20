import HttpClient from './HttpClient';

type UrlPart = string | number | null;

export default class ApiBase {
    protected httpClient = HttpClient.create();

    protected baseUrl: string | null = null;

    protected execGet<T>(url: UrlPart = null, data: any = null): Promise<T> {
        return this.httpClient.get<T>(this.makeFullUrl(url), data);
    }

    protected execPut<T>(url: UrlPart = null, data: any = null): Promise<T> {
        return this.httpClient.put<T>(this.makeFullUrl(url), data);
    }

    protected execPost<T>(url: UrlPart = null, data: any = null): Promise<T> {
        return this.httpClient.post<T>(this.makeFullUrl(url), data);
    }

    protected execDelete<T>(url: UrlPart = null, data: any = null): Promise<T> {
        return this.httpClient.delete<T>(this.makeFullUrl(url), data);
    }

    private makeFullUrl(subPath: UrlPart): string {
        if (!this.baseUrl) {
            throw new Error('Please set the base url prior to calling this method');
        }

        if (!subPath) {
            return this.baseUrl;
        }

        return this.baseUrl + '/' + subPath;
    }
}

// ReSharper disable once InconsistentNaming
export type ICreatedResult<T> = T;
